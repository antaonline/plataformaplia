import { Injectable, Logger } from '@nestjs/common';
import {
  ChatMsg,
  CompleteOptions,
  GeneratedProject,
  GenerationPlan,
  PlannedFile,
} from './codegen.types';
import {
  isProviderOpen,
  recordProviderResult,
  resolveProviderForModel,
} from './providers';
import { CreditService } from './credit.service';
import { resolveImages } from './image-resolver';
import {
  BASE_UTILS_FILE,
  buildFileSystemPrompt,
  buildFileUserPrompt,
  buildPlanSystemPrompt,
} from './prompts';
import {
  validateImports,
  buildMissingFilesPrompt,
} from './import-validator';

// PLIA Studio (Sprint 1, Lovable parity): proyectos con scaffold Vite + shadcn/ui
// permiten descomponer mucho mas — secciones individuales, paginas separadas,
// data files. Lovable/Dyad generan 20-40 archivos por proyecto.
const MAX_FILES = 40;

export interface GenerateParams {
  userId: number;
  userPrompt: string;
  history: ChatMsg[];
  aiRules: string;
  chatMode: string;
  existingFiles?: Record<string, string>;
  /**
   * Intent detectado por el analizador. Cuando viene con alta confianza
   * y targetSection conocido, el codegen activa el FAST PATH y se salta
   * la fase de PLAN (ahorrando ~30% de tokens) regenerando SOLO el
   * archivo objetivo. Reduce drasticamente el costo por edit.
   */
  editIntent?: {
    type: string;
    confidence: number;
    targetSection?: string;
  };
}

@Injectable()
export class CodegenService {
  private readonly logger = new Logger(CodegenService.name);

  constructor(private readonly credits: CreditService) {}

  /**
   * Recorre una cadena de modelos: intenta el primero, si lanza error
   * retriable (429/503/529) o devuelve respuesta vacia, pasa al siguiente.
   * Logea claramente cual respondio. Permite mezclar Gemini + Claude +
   * OpenAI en el mismo array (el provider se resuelve por nombre).
   */
  private async completeWithChain(
    models: string[],
    system: string,
    messages: ChatMsg[],
    opts: CompleteOptions,
    phase: string,
  ): Promise<string> {
    if (!Array.isArray(models) || models.length === 0) {
      throw new Error(`Sin modelos configurados para fase ${phase}`);
    }
    let lastErr: any = null;
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const provider = resolveProviderForModel(model);
      if (!provider.isAvailable()) {
        this.logger.warn(
          `[chain ${phase}] skip ${model}: provider ${provider.id} no disponible (sin API key)`,
        );
        continue;
      }
      // Circuit breaker: si el provider ya recibio N x 429 seguidos en los
      // ultimos 60s, NO desperdiciamos ~1s pegandole de nuevo. Saltamos
      // directo al siguiente modelo (que probablemente es otro provider).
      if (isProviderOpen(provider.id)) {
        this.logger.warn(
          `[chain ${phase}] skip ${model}: provider ${provider.id} en cooldown (breaker abierto)`,
        );
        continue;
      }
      try {
        const out = await provider.complete(system, messages, { ...opts, model });
        if (out && out.trim().length > 0) {
          recordProviderResult(provider.id, true);
          if (i > 0) {
            this.logger.log(
              `[chain ${phase}] ok con ${model} (provider=${provider.id}) tras ${i} fallback(s)`,
            );
          }
          return out;
        }
        lastErr = new Error(`${model} devolvio respuesta vacia`);
        this.logger.warn(`[chain ${phase}] ${model} devolvio vacio -> siguiente`);
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status;
        recordProviderResult(provider.id, false, status);
        const tag = status || e?.code || 'err';
        // En 429/403/400 mostramos el body que devuelve el proveedor: ahi
        // viene si es "Quota exceeded", "Billing not enabled", "API key
        // invalid", "Permission denied", etc. Sin esto solo veiamos "429"
        // y no se podia distinguir cuota agotada de key incorrecta.
        const bodyText = (() => {
          const d = e?.response?.data;
          if (!d) return e?.message || '';
          if (typeof d === 'string') return d.slice(0, 400);
          try {
            const msg =
              d?.error?.message ||
              d?.error?.status ||
              JSON.stringify(d).slice(0, 400);
            return msg;
          } catch {
            return String(d).slice(0, 400);
          }
        })();
        this.logger.warn(
          `[chain ${phase}] ${model} (provider=${provider.id}) fallo ${tag} -> siguiente | detalle: ${bodyText}`,
        );
      }
    }
    throw lastErr || new Error(`Cadena ${phase} agotada sin respuesta`);
  }

  /**
   * Genera un archivo "stub" valido para los archivos que la cadena no logro
   * generar (todos los modelos cayeron). Garantiza que el preview Vite
   * renderice sin pantalla negra: cada import roto se resuelve a un placeholder.
   *
   * - data/*.ts -> export const <name> = []
   * - components/*.tsx / sections/*.tsx -> componente placeholder visible
   * - hooks/*.ts y otros -> export {} (modulo vacio que satisface el import)
   *
   * Cada stub lleva un comentario claro indicando al usuario que pida
   * regenerar ese archivo.
   */
  private buildStubFile(path: string, purpose: string): string {
    const rel = path.replace(/^\.?\//, '');
    const isTsx = /\.tsx$/i.test(rel);
    const isTs = /\.ts$/i.test(rel) && !isTsx;
    const header = `// AUTO-GENERATED STUB\n// La IA no logro generar este archivo (provider cap-eado).\n// Para regenerarlo, di en el chat: "regenera ${rel}"\n// Proposito original: ${purpose.replace(/\n/g, ' ')}\n\n`;

    // Archivos de datos: exportar arreglo vacio + default. El nombre del
    // export se deriva del filename (data/services.ts -> services).
    if (isTs && /\/data\//.test(rel)) {
      const name = (rel.match(/\/data\/([^./]+)\./) || [, 'data'])[1];
      const safeName = name.replace(/[^a-zA-Z0-9_$]/g, '_');
      return `${header}export const ${safeName}: any[] = [];\nexport default ${safeName};\n`;
    }

    // Componentes / paginas TSX: placeholder visible para que el resto del
    // sitio renderice sin tirar el preview.
    if (isTsx) {
      const comp = (rel.match(/\/([^./]+)\.tsx$/) || [, 'Component'])[1];
      const safeComp = comp.replace(/[^a-zA-Z0-9_$]/g, '');
      return `${header}const ${safeComp} = () => (\n  <div className="p-8 text-center border border-dashed border-muted-foreground/30 rounded-2xl bg-muted/20 my-4">\n    <p className="text-sm text-muted-foreground font-medium">\n      Esta seccion (${safeComp}) se generara en el proximo turn.\n    </p>\n    <p className="text-xs text-muted-foreground/70 mt-1">\n      Pidele al asistente: "regenera ${rel}"\n    </p>\n  </div>\n);\n\nexport default ${safeComp};\nexport { ${safeComp} };\n`;
    }

    // .ts genericos (hooks, lib, utils): modulo vacio que satisface cualquier import.
    if (isTs) {
      return `${header}export {};\n`;
    }

    // Otros (css, json, md): no escribimos stub.
    return '';
  }

  /**
   * Parsea la respuesta del auto-fix del validador. La IA debe devolver
   * { "files": { "src/data/menu.ts": "...", "src/components/Hero.tsx": "..." } }.
   * Toleramos varios formatos: con y sin code fences, JSON con texto antes
   * o después, y { files: ... } o { path: content } directo en el root.
   * Devuelve un mapa path->contenido o null si no se puede parsear.
   */
  private parseFixerResponse(
    raw: string,
  ): Record<string, string> | null {
    if (!raw || typeof raw !== 'string') return null;
    let s = this.stripCodeFences(raw).trim();

    // Tratamos de extraer el primer bloque JSON {} balanceado.
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    s = s.slice(start, end + 1);

    let parsed: any;
    try {
      parsed = JSON.parse(s);
    } catch {
      return null;
    }

    if (!parsed || typeof parsed !== 'object') return null;
    // Forma A: { files: { path: content } }
    if (parsed.files && typeof parsed.files === 'object') {
      const out: Record<string, string> = {};
      for (const [p, c] of Object.entries(parsed.files)) {
        if (typeof c === 'string' && c.trim()) out[p] = c;
      }
      return out;
    }
    // Forma B: { path: content } directo
    const direct: Record<string, string> = {};
    let validKeys = 0;
    for (const [p, c] of Object.entries(parsed)) {
      // Heuristica: una clave que parece path (tiene "/" o termina en .ts/.tsx)
      // y un value string son una entrada de archivo.
      if (
        typeof c === 'string' &&
        c.trim() &&
        (p.includes('/') || /\.(tsx?|jsx?|ts|json)$/i.test(p))
      ) {
        direct[p] = c;
        validKeys++;
      }
    }
    return validKeys > 0 ? direct : null;
  }

  /**
   * Decide un valor placeholder razonable para un export stub según su
   * nombre. Plural/list/items/data -> []. config/theme/brand -> {}. resto "".
   */
  private stubValueForName(sym: string): string {
    const lower = sym.toLowerCase();
    if (
      lower.endsWith('s') ||
      lower.includes('list') ||
      lower.includes('items') ||
      lower.includes('data') ||
      lower.includes('gallery') ||
      lower.includes('faqs')
    ) {
      return '[]';
    }
    if (
      lower.includes('config') ||
      lower.includes('theme') ||
      lower.includes('brand') ||
      lower.includes('settings') ||
      lower.endsWith('info')
    ) {
      return '{}';
    }
    return '""';
  }

  private stripCodeFences(s: string): string {
    let out = s.trim();
    // Quita ```lang ... ``` envolvente si el modelo lo agrega.
    const fence = out.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n```$/);
    if (fence) return fence[1].trim();
    out = out.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```$/, '');
    return out.trim();
  }

  private parsePlan(raw: string): GenerationPlan | null {
    let txt = raw.trim();
    const fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) txt = fence[1].trim();
    const start = txt.indexOf('{');
    const end = txt.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(txt.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  private normalizePlan(
    plan: GenerationPlan,
    hasExisting: boolean,
  ): GenerationPlan {
    const ds = plan.designSystem || ({} as any);
    plan.designSystem = {
      vibe: ds.vibe || 'moderno, profesional, premium',
      palette: {
        primary: ds.palette?.primary || '#0f172a',
        secondary: ds.palette?.secondary || '#1e293b',
        accent: ds.palette?.accent || '#6366f1',
        bg: ds.palette?.bg || '#0a0a0a',
        surface: ds.palette?.surface || '#141414',
        text: ds.palette?.text || '#f8fafc',
      },
      fonts: {
        heading: ds.fonts?.heading || 'Poppins',
        body: ds.fonts?.body || 'Inter',
      },
      rules: Array.isArray(ds.rules) && ds.rules.length ? ds.rules : [
        'Tipografia de alto impacto',
        'Espaciado generoso',
        'Microinteracciones sutiles con framer-motion',
      ],
    };

    let files: PlannedFile[] = Array.isArray(plan.files) ? plan.files : [];
    files = files.filter((f) => f && typeof f.path === 'string');

    // COMPAT: si el modelo emite el legacy AppMain.tsx (formato del scaffold
    // Babel-CDN viejo), lo renombramos a src/pages/Index.tsx para que el
    // App.tsx del scaffold actual lo cargue. Sin esto: pantalla blanca.
    files = files.map((f) => {
      const norm = f.path.replace(/^\.?\/+/, '');
      if (/^(src\/)?AppMain\.tsx$/i.test(norm)) {
        return {
          ...f,
          path: 'src/pages/Index.tsx',
          purpose:
            f.purpose ||
            'Pagina principal (home) que monta el orden de secciones',
        };
      }
      return f;
    });

    // Garantiza /lib/utils.ts (cn helper).
    if (!files.some((f) => /(^|\/)lib\/utils\.ts$/.test(f.path))) {
      files.push({ path: 'src/lib/utils.ts', purpose: 'helper cn() de clases' });
    }

    // Garantiza src/pages/Index.tsx — es el ENTRY de la home. El App.tsx del
    // scaffold ya tiene <Route path="/" element={<Index />} />; si el modelo
    // no genera Index.tsx, el preview muestra el placeholder "Tu proyecto va
    // aqui" → parece pantalla blanca. Lo forzamos siempre en proyectos nuevos.
    if (
      !hasExisting &&
      !files.some((f) => /(^|\/)pages\/Index\.tsx$/.test(f.path))
    ) {
      files.unshift({
        path: 'src/pages/Index.tsx',
        purpose:
          'Pagina principal (home) — monta el orden de secciones (Hero, ...) y conecta los componentes generados',
      });
    }
    plan.files = files.slice(0, MAX_FILES);
    plan.dependencies =
      plan.dependencies && typeof plan.dependencies === 'object'
        ? plan.dependencies
        : {};
    plan.projectName = plan.projectName || 'Proyecto PLIA';
    plan.thinking = plan.thinking || 'Construyendo arquitectura del proyecto.';
    plan.response =
      plan.response || 'He construido tu aplicacion con un diseno a medida.';
    plan.steps =
      Array.isArray(plan.steps) && plan.steps.length
        ? plan.steps
        : ['Arquitectura', 'Design system', 'Componentes', 'Ensamblaje'];
    return plan;
  }

  /**
   * Intenta construir un plan SIN llamar al LLM, usando el intent
   * detectado y el proyecto existente. Si tiene exito, evitamos la
   * llamada de PLAN (~30% del costo del turn). Devuelve null si no
   * se puede usar el fast path (intent ambiguo, proyecto nuevo, etc.)
   */
  private tryFastPathPlan(
    params: GenerateParams,
    hasExisting: boolean,
  ): GenerationPlan | null {
    if (!hasExisting || !params.existingFiles) return null;
    const intent = params.editIntent;
    if (!intent) return null;

    // Solo activamos fast path para intents claros y especificos.
    const surgicalIntents = [
      'UPDATE_COMPONENT',
      'UPDATE_STYLE',
      'FIX_ISSUE',
    ];
    if (!surgicalIntents.includes(intent.type)) return null;
    if (intent.confidence < 0.7) return null;
    if (!intent.targetSection) return null;

    // Buscar archivo del componente objetivo en los archivos existentes.
    // Convencion: "hero" -> "Hero.tsx", "navbar" -> "Navbar.tsx", etc.
    const sectionCapital = intent.targetSection
      .charAt(0)
      .toUpperCase() + intent.targetSection.slice(1);
    const candidates = [
      `src/components/sections/${sectionCapital}.tsx`,
      `src/components/${sectionCapital}.tsx`,
      `/components/sections/${sectionCapital}.tsx`,
      `/components/${sectionCapital}.tsx`,
    ];
    const existingPaths = Object.keys(params.existingFiles);
    const matchPath = candidates.find((c) => existingPaths.includes(c)) ||
      existingPaths.find((p) =>
        new RegExp(`/${sectionCapital}\\.(tsx|jsx)$`, 'i').test(p),
      );
    if (!matchPath) return null;

    // Reusar design system del proyecto existente.
    let ds: any = null;
    try {
      const dsRaw = params.existingFiles['/__design__.json'];
      if (dsRaw) ds = JSON.parse(dsRaw);
    } catch {
      /* ignore */
    }
    if (!ds) {
      ds = {
        vibe: 'preservar estilo actual',
        palette: {
          primary: '#6366f1',
          secondary: '#1e293b',
          accent: '#f59e0b',
          bg: '#0a0a0a',
          surface: '#141414',
          text: '#f8fafc',
        },
        fonts: { heading: 'Poppins', body: 'Inter' },
        rules: ['Preservar look existente'],
      };
    }

    return {
      projectName: 'Edicion quirurgica',
      thinking: `El usuario quiere modificar la seccion "${intent.targetSection}". Salto la fase de plan y voy directo a regenerar ${matchPath}.`,
      response: `Voy a modificar ${matchPath} segun lo que pediste, sin tocar el resto del sitio.`,
      steps: [`Localizar ${matchPath}`, 'Aplicar el cambio', 'Preservar diseno'],
      designSystem: ds,
      files: [
        {
          path: matchPath,
          purpose: `Modificar segun la solicitud del usuario: ${intent.targetSection}`,
        },
      ],
      dependencies: {},
    };
  }

  async generate(params: GenerateParams): Promise<GeneratedProject> {
    const userPlan = await this.credits.getPlanFor(params.userId);
    const hasExisting =
      !!params.existingFiles &&
      Object.keys(params.existingFiles).length > 0;
    // Cadenas de modelos por fase. La cadena se recorre en orden y cae al
    // siguiente eslabon si el modelo responde 429/503/529 o vacio.
    const planModels = userPlan.planModels;
    const fileModels = hasExisting ? userPlan.editModels : userPlan.buildModels;
    const phase = hasExisting ? 'edit' : 'build';

    // Acumula el costo real USD de TODAS las llamadas de esta generacion.
    let genCostUsd = 0;
    const onUsage = (c: number) => {
      genCostUsd += c;
    };
    const CREDIT_UNIT_USD = Number(process.env.CREDIT_UNIT_USD || 0.1);
    const CREDIT_FLOOR = Number(process.env.CREDIT_FLOOR || 1);
    const creditsFor = (usd: number) =>
      Math.max(CREDIT_FLOOR, Math.round((usd / CREDIT_UNIT_USD) * 10) / 10);

    this.logger.log(
      `Codegen plan=${userPlan.code} fase=${phase} planChain=[${planModels.join('>')}] fileChain=[${fileModels.join('>')}]`,
    );

    // --- FAST PATH: salto del PLAN para edits quirurgicos ---
    // Si el analizador de intent dice con confianza alta "modificar Hero"
    // o "cambiar colores", no llamamos al PLAN: sintetizamos uno minimo
    // a partir del proyecto existente y regeneramos SOLO el archivo
    // objetivo. Ahorra ~30% del costo del turn y reduce latencia.
    const fastPathPlan = this.tryFastPathPlan(params, hasExisting);
    let plan: GenerationPlan;
    if (fastPathPlan) {
      plan = fastPathPlan;
      this.logger.log(
        `Codegen FAST PATH activado: solo regenerar ${plan.files.map((f) => f.path).join(', ')} (intent=${params.editIntent?.type} target=${params.editIntent?.targetSection} conf=${params.editIntent?.confidence})`,
      );
    } else {
      // --- FASE 1: PLAN ---
      const planSystem = buildPlanSystemPrompt(params.aiRules, hasExisting);
      const planMessages: ChatMsg[] = [...params.history];
      let planUser = params.userPrompt;
      if (hasExisting) {
        const summary = Object.keys(params.existingFiles!)
          .map((p) => `- ${p}`)
          .join('\n');
        planUser += `\n\nArchivos existentes del proyecto:\n${summary}`;
      }
      planMessages.push({ role: 'user', content: planUser });

      const planRaw = await this.completeWithChain(
        planModels,
        planSystem,
        planMessages,
        {
          json: true,
          maxTokens: 4096,
          temperature: 0.6,
          onUsage,
        },
        'plan',
      );
      const parsed = this.parsePlan(planRaw);
      if (!parsed) {
        throw new Error('El plan de la IA no devolvio JSON valido');
      }
      plan = this.normalizePlan(parsed, hasExisting);
    }

    // EDICION: el design system del proyecto NUNCA se regenera. Reusamos el
    // existente para que tipografia/paleta no cambien al editar.
    let preservedDesignJson: string | null = null;
    if (hasExisting && params.existingFiles?.['/__design__.json']) {
      try {
        const existingDs = JSON.parse(
          params.existingFiles['/__design__.json'],
        );
        if (existingDs && typeof existingDs === 'object') {
          plan.designSystem = this.normalizePlan(
            { designSystem: existingDs, files: [] } as any,
            true,
          ).designSystem;
          preservedDesignJson = params.existingFiles['/__design__.json'];
        }
      } catch {
        /* design corrupto: se mantiene el del plan */
      }
    }

    // --- FASE 2: GENERACION POR ARCHIVO ---
    const fileSystem = buildFileSystemPrompt(plan);
    const files: Record<string, string> = {};

    const isUtils = (p: string) => /(^|\/)lib\/utils\.ts$/.test(p);
    // ENTRY = src/pages/Index.tsx (lo que importa el App.tsx del scaffold).
    // Lo generamos al final para que conozca a TODOS los componentes ya
    // generados y pueda armar el orden correcto de secciones e imports.
    const isEntry = (p: string) => /(^|\/)pages\/Index\.tsx$/.test(p);

    // NOTA: lib/utils.ts lo genera el modelo como cualquier otro archivo.
    // Antes lo sobrescribiamos con solo cn() y se perdian helpers que el
    // modelo pone ahi (fadeUp, staggerContainer, ...) e importan los
    // componentes -> exports faltantes -> pantalla en blanco.
    const componentFiles = plan.files.filter((f) => !isEntry(f.path));
    const entryFile = plan.files.find((f) => isEntry(f.path));

    // Componentes con concurrencia limitada (2 a la vez) para no reventar
    // los limites de tasa del proveedor (sobre todo Gemini free).
    const CONCURRENCY = 2;
    const queue = [...componentFiles];
    const failedFiles: { path: string; error: string }[] = [];
    const worker = async () => {
      for (;;) {
        const f = queue.shift();
        if (!f) return;
        const user = buildFileUserPrompt(
          f,
          params.userPrompt,
          {},
          params.existingFiles?.[f.path],
        );
        try {
          const code = await this.completeWithChain(
            fileModels,
            fileSystem,
            [{ role: 'user', content: user }],
            { maxTokens: 16000, temperature: 0.7, onUsage },
            phase,
          );
          files[f.path] = this.stripCodeFences(code);
        } catch (e: any) {
          // Si un archivo individual falla (todos los modelos cayeron para
          // ese archivo), NO abortamos toda la generacion. Logueamos y
          // seguimos: el sitio quedara con algunos archivos faltantes que
          // el usuario puede pedir regenerar en el siguiente turn.
          const msg = e?.response?.data?.error?.message || e?.message || String(e);
          failedFiles.push({ path: f.path, error: msg.slice(0, 200) });
          this.logger.error(
            `[gen-file] FAIL ${f.path}: ${msg.slice(0, 200)} (continuando con el resto)`,
          );
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, componentFiles.length || 1) }, () =>
        worker(),
      ),
    );
    if (failedFiles.length > 0) {
      this.logger.warn(
        `[gen-file] ${failedFiles.length}/${componentFiles.length} archivos fallaron: ${failedFiles
          .map((f) => f.path)
          .join(', ')}`,
      );
      // Stubs para que Vite no tire "Failed to resolve import" en el preview:
      // generamos un archivo minimo valido por cada uno que fallo. El sitio
      // renderiza con placeholders en lugar de pantalla negra, y el usuario
      // puede pedir regenerar archivos especificos desde el chat.
      for (const fail of failedFiles) {
        const planEntry = plan.files.find((f) => f.path === fail.path);
        files[fail.path] = this.buildStubFile(
          fail.path,
          planEntry?.purpose || 'pendiente',
        );
      }
    }

    // Index (home) al final: conoce todos los componentes ya generados y
    // arma el orden correcto de secciones/imports.
    if (entryFile) {
      const user = buildFileUserPrompt(
        entryFile,
        params.userPrompt,
        files,
        params.existingFiles?.[entryFile.path],
      );
      const code = await this.completeWithChain(
        fileModels,
        fileSystem,
        [{ role: 'user', content: user }],
        { maxTokens: 16000, temperature: 0.7, onUsage },
        phase,
      );
      files[entryFile.path] = this.stripCodeFences(code);
    }

    // ─── VALIDADOR POST-CODEGEN (hasta 2 reintentos + stubs garantía) ──
    // Escaneamos los archivos generados buscando imports a "@/..." que NO
    // resuelvan a un archivo+export real. Si la IA prometió secciones que
    // no entregó o le erró el nombre del export (ej: importa { pizzas }
    // pero exportó menuData), el preview queda en blanco con "does not
    // provide an export named 'X'".
    //
    // Algoritmo:
    //   1. Validar.
    //   2. Si hay rotos -> reintento #1 con prompt específico.
    //   3. Re-validar lo que quedó.
    //   4. Si AÚN hay rotos -> reintento #2 con prompt más estricto.
    //   5. Re-validar.
    //   6. Si AÚN hay rotos (rate limit, IA confundida, etc.) ->
    //      generar STUBS automáticos con los exports requeridos y datos
    //      placeholder. Garantiza que la app renderice aunque sea minima.
    try {
      let missing = validateImports(files, params.existingFiles);

      // PASO 1: los 'export-missing' (archivo EXISTE pero le falta un
      // símbolo) los arreglamos DIRECTO apendando los exports faltantes al
      // contenido existente. NO los mandamos a la IA porque regenerar el
      // archivo entero rompe OTROS imports (la IA no conoce todos los
      // símbolos que el resto de componentes necesitan de ese archivo).
      // Esto resuelve el bug de constants.ts que se autodestruía.
      const appendStubsForExportMissing = () => {
        const exportMissing = missing.filter((m) => m.reason === 'export-missing');
        if (exportMissing.length === 0) return;
        const byPath = new Map<string, Set<string>>();
        for (const m of exportMissing) {
          // Solo nombres named — el default-missing en archivo existente es
          // raro y lo dejamos para la IA/stub final.
          if (m.missingNamedSymbols.length === 0) continue;
          let set = byPath.get(m.expectedPath);
          if (!set) {
            set = new Set();
            byPath.set(m.expectedPath, set);
          }
          for (const s of m.missingNamedSymbols) set.add(s);
        }
        for (const [path, syms] of byPath.entries()) {
          const existing = files[path] ?? files[`/${path}`] ?? '';
          const key = files[path] !== undefined ? path : `/${path}`;
          const appended = [
            existing.trimEnd(),
            '',
            '// ─── Exports auto-completados por el validador ─────────────',
            ...[...syms].map((s) => `export const ${s} = ${this.stubValueForName(s)};`),
            '',
          ].join('\n');
          files[key] = appended;
        }
        this.logger.log(
          `[validator] export-missing: apendí ${[...byPath.values()].reduce((n, s) => n + s.size, 0)} exports a ${byPath.size} archivos existentes (sin destruir contenido).`,
        );
      };
      appendStubsForExportMissing();
      missing = validateImports(files, params.existingFiles);

      // PASO 2: los 'file-missing' (archivo NO existe) SÍ los pedimos a la
      // IA, hasta 2 reintentos.
      for (let attempt = 1; attempt <= 2 && missing.some((m) => m.reason === 'file-missing'); attempt++) {
        const fileMissing = missing.filter((m) => m.reason === 'file-missing');
        this.logger.warn(
          `[validator] attempt=${attempt} ${fileMissing.length} archivos faltantes: ` +
            fileMissing.map((m) => m.expectedPath).slice(0, 5).join(', '),
        );
        const fixPrompt = buildMissingFilesPrompt(fileMissing);
        try {
          const raw = await this.completeWithChain(
            fileModels,
            fileSystem,
            [{ role: 'user', content: fixPrompt }],
            { json: true, maxTokens: 8000, temperature: 0.4, onUsage },
            phase,
          );
          const parsed = this.parseFixerResponse(raw);
          if (parsed && Object.keys(parsed).length > 0) {
            Object.assign(files, parsed);
            this.logger.log(
              `[validator] attempt=${attempt} añadió ${Object.keys(parsed).length} archivos: ${Object.keys(parsed).join(', ')}`,
            );
          } else {
            break;
          }
        } catch (e: any) {
          this.logger.warn(`[validator] attempt=${attempt} falló: ${e?.message || e}`);
          break;
        }
        // Re-validar y re-apendar export-missing que la nueva gen pudo crear.
        missing = validateImports(files, params.existingFiles);
        appendStubsForExportMissing();
        missing = validateImports(files, params.existingFiles);
      }

      // PASO 3: STUBS de garantía para lo que AÚN falte (file-missing que
      // la IA no logró generar). Estos sí crean archivo nuevo — no destruyen
      // nada porque por definición no existían.
      if (missing.length > 0) {
        this.logger.warn(
          `[validator] post-reintentos siguen rotos ${missing.length}. Generando stubs de garantía (solo archivos nuevos).`,
        );
        const stubsByPath = new Map<
          string,
          { needsDefault: boolean; named: Set<string> }
        >();
        for (const m of missing) {
          let s = stubsByPath.get(m.expectedPath);
          if (!s) {
            s = { needsDefault: false, named: new Set() };
            stubsByPath.set(m.expectedPath, s);
          }
          if (m.missingDefault) s.needsDefault = true;
          for (const sym of m.missingNamedSymbols) s.named.add(sym);
        }
        for (const [path, spec] of stubsByPath.entries()) {
          // SEGURIDAD: si el archivo YA existe (export-missing que escapó),
          // apendar en vez de reemplazar — nunca destruir contenido real.
          const existsKey =
            files[path] !== undefined
              ? path
              : files[`/${path}`] !== undefined
                ? `/${path}`
                : null;
          const isTsx = /\.tsx$/i.test(path);
          const exportLines: string[] = [];
          for (const sym of spec.named) {
            exportLines.push(`export const ${sym} = ${this.stubValueForName(sym)};`);
          }
          if (spec.needsDefault) {
            exportLines.push(
              isTsx
                ? '\nexport default function Placeholder() {\n  return null;\n}'
                : '\nexport default null;',
            );
          }
          if (existsKey) {
            files[existsKey] =
              files[existsKey].trimEnd() +
              '\n\n// ─── Stubs de garantía ─────\n' +
              exportLines.join('\n') +
              '\n';
          } else {
            files[path] =
              [
                `// AUTO-STUB del validador post-codegen.`,
                `// Importado pero no entregado por la IA. Placeholder para`,
                `// que la app renderice; pedí "completá ${path}" en el chat.`,
                '',
                ...exportLines,
                '',
              ].join('\n') + '\n';
          }
        }
        this.logger.log(
          `[validator] generados ${stubsByPath.size} stubs: ${[...stubsByPath.keys()].join(', ')}`,
        );
      } else {
        this.logger.log(`[validator] todos los imports resuelven OK.`);
      }
    } catch (e: any) {
      // El validador NUNCA debe romper la generación entera. Si falla,
      // log y seguimos — peor caso: el cliente ve el toast de error con
      // AUTO-FIX y arregla manual.
      this.logger.warn(`[validator] crash inesperado: ${e?.message || e}`);
    }

    // El modelo NUNCA debe regenerar estos (los controla la plataforma).
    delete files['/__design__.json'];
    delete files['/__deps__.json'];

    // Garantiza cn en /lib/utils.ts. Solo actuamos si el modelo (re)genero
    // utils, o si NO existe utils en ningun lado (proyecto sin utils).
    const cnRe = /\b(function|const)\s+cn\b|cn\s*=|export\s+\{[^}]*\bcn\b/;
    const genUtilsKey = Object.keys(files).find((p) => isUtils(p));
    const existingUtils = Object.keys(params.existingFiles || {}).some((p) =>
      isUtils(p),
    );
    if (genUtilsKey) {
      const c = files[genUtilsKey];
      if (!c || !c.trim()) files[genUtilsKey] = BASE_UTILS_FILE;
      else if (!cnRe.test(c))
        files[genUtilsKey] = `${c.trim()}\n\n${BASE_UTILS_FILE}`;
    } else if (!existingUtils) {
      files['/lib/utils.ts'] = BASE_UTILS_FILE;
    }

    const meta: GeneratedProject['meta'] = {
      thinking: plan.thinking,
      conceptName: plan.projectName,
      steps: plan.steps,
      chatMode: params.chatMode,
    };

    if (hasExisting) {
      // EDICION: el mensaje lleva SOLO los archivos que el modelo cambio
      // (delta). El front acumula [FILES] de todos los mensajes, asi que el
      // preview sigue completo, el design system original se conserva (no se
      // re-emite) y "Ejecucion de Tareas" muestra solo lo realmente tocado.
      const resolvedDelta = await resolveImages(files);
      meta.creditsUsed = creditsFor(genCostUsd);
      meta.costUsd = Number(genCostUsd.toFixed(4));
      this.logger.log(
        `[CostMeter] GEN-FIN plan=${userPlan.code} modo=edit archivos=${Object.keys(resolvedDelta).length} costo=$${genCostUsd.toFixed(4)} creditos=${meta.creditsUsed}`,
      );
      return {
        meta,
        response: plan.response,
        files: resolvedDelta,
        dependencies: plan.dependencies,
      };
    }

    // CREACION: proyecto completo. La home (src/pages/Index.tsx) es lo que
    // el App.tsx del scaffold carga: sin ese archivo el preview se ve blanco.
    const finalFiles: Record<string, string> = { ...files };
    if (
      !Object.keys(finalFiles).some((p) =>
        /(^|\/)pages\/Index\.tsx$/.test(p),
      )
    ) {
      throw new Error('La generacion no produjo src/pages/Index.tsx (home)');
    }
    finalFiles['/__design__.json'] =
      preservedDesignJson ?? JSON.stringify(plan.designSystem);
    const resolved = await resolveImages(finalFiles);

    meta.creditsUsed = creditsFor(genCostUsd);
    meta.costUsd = Number(genCostUsd.toFixed(4));
    this.logger.log(
      `[CostMeter] GEN-FIN plan=${userPlan.code} modo=create archivos=${Object.keys(resolved).length} costo=$${genCostUsd.toFixed(4)} creditos=${meta.creditsUsed}`,
    );
    return {
      meta,
      response: plan.response,
      files: resolved,
      dependencies: plan.dependencies,
    };
  }
}
