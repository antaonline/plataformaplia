import { Injectable, Logger } from '@nestjs/common';
import {
  ChatMsg,
  CompleteOptions,
  GeneratedProject,
  GenerationPlan,
  PlannedFile,
} from './codegen.types';
import { resolveProviderForModel } from './providers';
import { CreditService } from './credit.service';
import { resolveImages } from './image-resolver';
import {
  BASE_UTILS_FILE,
  buildFileSystemPrompt,
  buildFileUserPrompt,
  buildPlanSystemPrompt,
} from './prompts';

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
      try {
        const out = await provider.complete(system, messages, { ...opts, model });
        if (out && out.trim().length > 0) {
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
        const status = e?.response?.status || e?.code || 'err';
        this.logger.warn(
          `[chain ${phase}] ${model} (provider=${provider.id}) fallo ${status} -> siguiente`,
        );
      }
    }
    throw lastErr || new Error(`Cadena ${phase} agotada sin respuesta`);
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
    // Garantiza utils y AppMain.
    if (!files.some((f) => f.path.replace(/^\//, '') === 'lib/utils.ts')) {
      files.push({ path: '/lib/utils.ts', purpose: 'helper cn() de clases' });
    }
    if (!hasExisting && !files.some((f) => /AppMain\.tsx$/.test(f.path))) {
      files.unshift({
        path: '/AppMain.tsx',
        purpose: 'Componente raiz que compone todas las secciones',
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
    const plan = this.normalizePlan(parsed, hasExisting);

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

    const isUtils = (p: string) => p.replace(/^\//, '') === 'lib/utils.ts';
    const isAppMain = (p: string) => /AppMain\.tsx$/.test(p);

    // NOTA: lib/utils.ts lo genera el modelo como cualquier otro archivo.
    // Antes lo sobrescribiamos con solo cn() y se perdian helpers que el
    // modelo pone ahi (fadeUp, staggerContainer, ...) e importan los
    // componentes -> exports faltantes -> pantalla en blanco.
    const componentFiles = plan.files.filter((f) => !isAppMain(f.path));
    const appMainFile = plan.files.find((f) => isAppMain(f.path));

    // Componentes con concurrencia limitada (2 a la vez) para no reventar
    // los limites de tasa del proveedor (sobre todo Gemini free).
    const CONCURRENCY = 2;
    const queue = [...componentFiles];
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
        const code = await this.completeWithChain(
          fileModels,
          fileSystem,
          [{ role: 'user', content: user }],
          { maxTokens: 16000, temperature: 0.7, onUsage },
          phase,
        );
        files[f.path] = this.stripCodeFences(code);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, componentFiles.length || 1) }, () =>
        worker(),
      ),
    );

    // AppMain al final: conoce todos los componentes ya generados.
    if (appMainFile) {
      const user = buildFileUserPrompt(
        appMainFile,
        params.userPrompt,
        files,
        params.existingFiles?.[appMainFile.path],
      );
      const code = await this.completeWithChain(
        fileModels,
        fileSystem,
        [{ role: 'user', content: user }],
        { maxTokens: 16000, temperature: 0.7, onUsage },
        phase,
      );
      files[appMainFile.path] = this.stripCodeFences(code);
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

    // CREACION: proyecto completo.
    const finalFiles: Record<string, string> = { ...files };
    if (!Object.keys(finalFiles).some((p) => /AppMain\.tsx$/.test(p))) {
      throw new Error('La generacion no produjo /AppMain.tsx');
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
