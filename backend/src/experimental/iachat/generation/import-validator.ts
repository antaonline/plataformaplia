/**
 * Validador post-generación: escanea los archivos que la IA generó buscando
 * imports a `@/...` que NO resuelven a un archivo+export real. Si encuentra
 * rotos, devuelve la lista para que el orquestador llame a la IA de nuevo
 * pidiendo SOLO los archivos faltantes.
 *
 * Sin esto, el cliente ve pantalla blanca con "does not provide an export
 * named 'menuData'" cuando la IA promete cosas que no entregó (caso clásico
 * del proyecto 176: importa de '@/data/menu' pero nunca creó ese archivo).
 *
 * Filosofía: usar regex robustas, NO parsear AST completo. Imperfecto pero
 * MUY rápido y suficiente para los patrones de import típicos de Vite+React.
 */

export interface ResolvedImport {
  /** Archivo que tiene el import. Ej: 'src/pages/Index.tsx'. */
  importerPath: string;
  /** Path del import tal cual lo escribió la IA. Ej: '@/data/menu'. */
  importSource: string;
  /** Paths candidatos donde podría estar el archivo (con extensiones). */
  candidatePaths: string[];
  /** Símbolos importados como named. Ej: ['menuData', 'categories']. */
  namedSymbols: string[];
  /** Si importa default (sin braces). Ej: import Hero from '@/components/Hero'. */
  importsDefault: boolean;
}

export interface MissingImport {
  importerPath: string;
  importSource: string;
  /** Path que debería existir pero no está. */
  expectedPath: string;
  /** Default y/o named que faltan. Si el archivo existe pero le faltan algunos. */
  missingDefault: boolean;
  missingNamedSymbols: string[];
  /** Reason: 'file-missing' | 'export-missing'. */
  reason: 'file-missing' | 'export-missing';
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Extrae los imports de un archivo. Reconoce:
 *   import { A, B as Bb, type C } from "@/..."
 *   import Default from "@/..."
 *   import Default, { A, B } from "@/..."
 *   import * as Ns from "@/..."  (lo ignoramos para validacion — namespace
 *                                  no se valida por export)
 *
 * Solo captura imports que empiezan con "@/" — los "react", "lucide-react",
 * etc. son node_modules y no nos competen.
 */
export function parseImports(
  content: string,
  importerPath: string,
): ResolvedImport[] {
  const out: ResolvedImport[] = [];
  if (!content) return out;

  // Regex con multilinea para que match import {} from que se extiendan
  // sobre varias lineas con cada simbolo en su linea.
  const re =
    /import\s+(?:([\w$]+)\s*,\s*)?(?:\{([^}]+)\})?\s*(?:([\w$]+)\s+)?from\s+["']([^"']+)["']/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const defaultBefore = m[1]; // Default antes de las llaves
    const braces = m[2];
    const defaultAfter = m[3]; // Default cuando no hay llaves (raro pero valido)
    const source = m[4];

    if (!source || !source.startsWith('@/')) continue;

    const hasDefault = !!(defaultBefore || defaultAfter);

    let named: string[] = [];
    if (braces) {
      named = braces
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        // Quitar "type " prefix de imports de tipo (no necesitan export valor)
        .filter((s) => !s.startsWith('type '))
        // Tomar el nombre original (antes de "as ...")
        .map((s) => s.split(/\s+as\s+/)[0].trim());
    }

    if (!hasDefault && named.length === 0) {
      // import "@/..." (side-effect only) — saltamos validacion.
      continue;
    }

    out.push({
      importerPath,
      importSource: source,
      candidatePaths: resolveAliasCandidates(source),
      namedSymbols: named,
      importsDefault: hasDefault,
    });
  }

  return out;
}

/**
 * Convierte `@/data/menu` -> [`src/data/menu.ts`, `src/data/menu.tsx`,
 * `src/data/menu.js`, `src/data/menu.jsx`, `src/data/menu/index.ts`,
 * `src/data/menu/index.tsx`].
 *
 * El primer candidato que exista en files se usa.
 */
function resolveAliasCandidates(importSource: string): string[] {
  if (!importSource.startsWith('@/')) return [];
  const rel = importSource.slice(2); // quitar "@/"
  const base = `src/${rel}`;
  const exts = ['.tsx', '.ts', '.jsx', '.js'];
  const candidates: string[] = [];
  // Archivo directo con extensiones.
  for (const ext of exts) candidates.push(base + ext);
  // Si rel ya tiene extension, también probarlo tal cual.
  if (/\.(tsx?|jsx?|json)$/.test(base)) candidates.push(base);
  // Carpeta con index.
  for (const ext of exts) candidates.push(`${base}/index${ext}`);
  return candidates;
}

/**
 * Encuentra todos los exports (named + default) del contenido.
 * Reconoce:
 *   export const X = ...
 *   export function X(...
 *   export class X ...
 *   export { X, Y, Z as W }
 *   export { default } from ...
 *   export default ...
 *   export type X = ...
 *   export interface X ...
 *   export enum X ...
 */
export function extractExports(content: string): {
  hasDefault: boolean;
  named: Set<string>;
} {
  const named = new Set<string>();
  let hasDefault = false;
  if (!content) return { hasDefault, named };

  // export default ...
  if (/\bexport\s+default\b/.test(content)) hasDefault = true;

  // export const/let/var X
  const constRe = /export\s+(?:const|let|var)\s+([\w$]+)/g;
  let m: RegExpExecArray | null;
  while ((m = constRe.exec(content)) !== null) named.add(m[1]);

  // export function X
  const fnRe = /export\s+(?:async\s+)?function\s*\*?\s*([\w$]+)/g;
  while ((m = fnRe.exec(content)) !== null) named.add(m[1]);

  // export class X
  const clsRe = /export\s+(?:abstract\s+)?class\s+([\w$]+)/g;
  while ((m = clsRe.exec(content)) !== null) named.add(m[1]);

  // export type / interface / enum X
  const tpRe = /export\s+(?:type|interface|enum)\s+([\w$]+)/g;
  while ((m = tpRe.exec(content)) !== null) named.add(m[1]);

  // export { A, B as C, default as ... }
  const groupRe = /export\s*\{([^}]+)\}/g;
  while ((m = groupRe.exec(content)) !== null) {
    const items = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      const parts = item.split(/\s+as\s+/);
      const exportedAs = (parts[1] || parts[0]).trim();
      if (exportedAs === 'default') hasDefault = true;
      else if (exportedAs) named.add(exportedAs);
    }
  }

  return { hasDefault, named };
}

// ---------------------------------------------------------------------------
// Validador principal
// ---------------------------------------------------------------------------

/**
 * Valida que TODOS los imports `@/...` de los archivos generados resuelvan
 * a un archivo existente que provee los símbolos importados.
 *
 * @param newFiles Archivos generados/editados en este turn de la IA.
 * @param existingFiles Archivos del proyecto previos al turn (para edits).
 *                      Si existe `src/data/menu.ts` en el proyecto y la IA
 *                      no lo regeneró, ese import NO está roto.
 * @returns Lista de imports rotos. Vacío si todo está bien.
 */
export function validateImports(
  newFiles: Record<string, string>,
  existingFiles: Record<string, string> = {},
): MissingImport[] {
  // Pool combinado: archivos del turn actual sobreescriben los previos.
  const allFiles: Record<string, string> = { ...existingFiles, ...newFiles };

  // Normalizar paths a forward slashes y sin prefix /
  const normalizedPool: Record<string, string> = {};
  for (const [p, c] of Object.entries(allFiles)) {
    const norm = p.replace(/^\.?\/+/, '').replace(/\\/g, '/');
    normalizedPool[norm] = c;
  }

  const missing: MissingImport[] = [];

  // Solo validamos imports de archivos GENERADOS en este turn. Los archivos
  // del scaffold y los existentes no nos competen — si tienen un import
  // roto, ya estaba roto antes.
  for (const [filePath, content] of Object.entries(newFiles)) {
    const norm = filePath.replace(/^\.?\/+/, '').replace(/\\/g, '/');
    const imports = parseImports(content, norm);
    for (const imp of imports) {
      // ¿Algún candidato existe en el pool?
      const found = imp.candidatePaths.find(
        (c) => normalizedPool[c] !== undefined,
      );
      if (!found) {
        // Filtramos los imports de @/components/ui/* (shadcn — el scaffold
        // los tiene siempre) y @/hooks/use-* (use-toast, use-mobile — del
        // scaffold) — no los validamos contra los archivos generados porque
        // viven en el scaffold base por symlink, no en allFiles.
        if (
          imp.importSource.startsWith('@/components/ui/') ||
          imp.importSource === '@/hooks/use-toast' ||
          imp.importSource === '@/hooks/use-mobile'
        ) {
          continue;
        }
        // @/lib/utils es siempre del scaffold (merge) — no fallar.
        if (imp.importSource === '@/lib/utils') continue;

        missing.push({
          importerPath: norm,
          importSource: imp.importSource,
          expectedPath: imp.candidatePaths[0], // primer candidato como sugerencia
          missingDefault: imp.importsDefault,
          missingNamedSymbols: imp.namedSymbols,
          reason: 'file-missing',
        });
        continue;
      }

      // Archivo existe: validar que tenga los símbolos pedidos.
      const targetContent = normalizedPool[found];
      const exports = extractExports(targetContent);

      const missingNamed = imp.namedSymbols.filter((s) => !exports.named.has(s));
      const missingDefault = imp.importsDefault && !exports.hasDefault;

      if (missingNamed.length > 0 || missingDefault) {
        missing.push({
          importerPath: norm,
          importSource: imp.importSource,
          expectedPath: found,
          missingDefault,
          missingNamedSymbols: missingNamed,
          reason: 'export-missing',
        });
      }
    }
  }

  return missing;
}

/**
 * Genera un prompt CONCISO para pedirle a la IA solo los archivos/exports
 * faltantes. NO repetimos contexto del proyecto entero (ahorra tokens).
 *
 * Devuelve un string listo para mandar como `user` message a la IA.
 */
export function buildMissingFilesPrompt(missing: MissingImport[]): string {
  // Agrupar por archivo esperado para no pedir el mismo archivo dos veces.
  type Group = {
    expectedPath: string;
    importers: string[];
    needsDefault: boolean;
    needsNamed: Set<string>;
  };
  const byPath = new Map<string, Group>();
  for (const m of missing) {
    let g = byPath.get(m.expectedPath);
    if (!g) {
      g = {
        expectedPath: m.expectedPath,
        importers: [],
        needsDefault: false,
        needsNamed: new Set(),
      };
      byPath.set(m.expectedPath, g);
    }
    if (!g.importers.includes(m.importerPath)) g.importers.push(m.importerPath);
    if (m.missingDefault) g.needsDefault = true;
    for (const s of m.missingNamedSymbols) g.needsNamed.add(s);
  }

  const lines: string[] = [
    `Tu generación dejó imports rotos que rompen el preview. Necesito que generes EXCLUSIVAMENTE los archivos faltantes con los exports requeridos. NO regeneres nada más.`,
    ``,
    `Archivos faltantes:`,
  ];
  for (const g of byPath.values()) {
    const importersList = g.importers.map((p) => `\`${p}\``).join(', ');
    const exportsList: string[] = [];
    if (g.needsDefault) exportsList.push('default export');
    if (g.needsNamed.size > 0) {
      exportsList.push(`named: ${Array.from(g.needsNamed).join(', ')}`);
    }
    lines.push(
      `- \`${g.expectedPath}\` -> usado por ${importersList} -> exports requeridos: ${exportsList.join(' + ')}`,
    );
  }
  lines.push(
    '',
    'IMPORTANTE: devolveme un JSON con la forma { "files": { "<path>": "<contenido completo del archivo>" } }. NADA más fuera del JSON.',
    'Los archivos deben ser código TS/TSX válido, con los exports tipo y nombre exactos que listé.',
    'Si necesitas referencias visuales, los datos pueden ser hardcoded acorde al rubro del negocio. No inventes nuevos imports — usa solo lo que ya existe en el proyecto.',
  );

  return lines.join('\n');
}
