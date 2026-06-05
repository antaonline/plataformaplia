import * as fs from 'fs/promises';
import { join, dirname } from 'path';

/**
 * Sprint 3 — Preview alineado con plia-studio-base.
 *
 * El preview en vivo (Vite dev server por proyecto) ahora usa EL MISMO
 * scaffold que el publish: backend/scaffolds/plia-studio-base/. Asi todo
 * lo que la IA genera (shadcn imports, react-router, react-query,
 * framer-motion, recharts...) tiene sus deps disponibles y funciona en
 * el preview tal cual va a funcionar al publicar.
 *
 * Requiere haber corrido UNA vez en el servidor:
 *   cd backend/scaffolds/plia-studio-base && npm install
 *
 * Despues cada preview tarda <1s en init (solo copia + symlink), ya que
 * todos comparten el mismo node_modules del scaffold maestro.
 */

const SCAFFOLD_DIR = () =>
  join(process.cwd(), 'scaffolds', 'plia-studio-base');

const EXCLUDE_FROM_COPY = new Set([
  'node_modules',
  'dist',
  '.git',
  'pnpm-lock.yaml',
  'package-lock.json',
  '.plia-deps',
]);

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function writeAlways(filePath: string, contents: string) {
  // Solo escribe si el contenido cambio. Critico para no triggerear Vite
  // HMR en cada sync con el mismo contenido.
  try {
    const current = await fs.readFile(filePath, 'utf8');
    if (current === contents) return;
  } catch {
    /* no existe */
  }
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

async function copyRecursive(src: string, dst: string): Promise<void> {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_FROM_COPY.has(entry.name)) continue;
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(s, d);
    } else if (entry.isSymbolicLink()) {
      try {
        const real = await fs.realpath(s);
        const st = await fs.stat(real);
        if (st.isDirectory()) {
          await copyRecursive(real, d);
        } else {
          await fs.copyFile(real, d);
        }
      } catch {
        /* broken symlink */
      }
    } else {
      // Solo copiar si no existe o difiere para no triggerear Vite HMR.
      try {
        const current = await fs.readFile(d, 'utf8');
        const next = await fs.readFile(s, 'utf8');
        if (current === next) continue;
      } catch {
        /* destino no existe o no es texto */
      }
      await fs.copyFile(s, d);
    }
  }
}

async function ensureNodeModulesSymlink(projectPath: string): Promise<void> {
  const master = join(SCAFFOLD_DIR(), 'node_modules');
  const link = join(projectPath, 'node_modules');
  if (await pathExists(link)) return;
  if (!(await pathExists(master))) return;
  try {
    // junction en Windows (sin admin), symlink dir en POSIX.
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    await fs.symlink(master, link, type as any);
  } catch (err: any) {
    // Si fallan los symlinks (filesystem raro), el caller hara npm install.
  }
}

/**
 * Crea (idempotente) el proyecto Vite + React + shadcn/ui en `projectPath`
 * copiando desde el scaffold maestro `plia-studio-base/`.
 */
export async function scaffoldViteApp(projectPath: string): Promise<void> {
  const master = SCAFFOLD_DIR();
  if (!(await pathExists(master))) {
    throw new Error(
      `Scaffold maestro no encontrado en ${master}. Setup: cd backend/scaffolds/plia-studio-base && npm install`,
    );
  }
  await fs.mkdir(projectPath, { recursive: true });
  await copyRecursive(master, projectPath);
  await ensureNodeModulesSymlink(projectPath);
}

// ─── Lista blanca de deps que la IA NO puede pisar ────────────────────
const PROTECTED_DEPS = new Set([
  'react',
  'react-dom',
  'react-router-dom',
  'vite',
  '@vitejs/plugin-react-swc',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'typescript',
  '@tanstack/react-query',
  'react-hook-form',
  '@hookform/resolvers',
  'zod',
  'framer-motion',
  'lucide-react',
  'recharts',
  'sonner',
  'cmdk',
  'next-themes',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'tailwindcss-animate',
  'vaul',
  'embla-carousel-react',
  'date-fns',
  'react-day-picker',
  'input-otp',
  'react-resizable-panels',
]);

async function mergeDependencies(
  projectPath: string,
  rawJson: string,
): Promise<void> {
  let extra: Record<string, string>;
  try {
    extra = JSON.parse(rawJson);
  } catch {
    return;
  }
  if (!extra || typeof extra !== 'object') return;

  const pkgPath = join(projectPath, 'package.json');
  let pkg: any;
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  } catch {
    return;
  }
  pkg.dependencies = pkg.dependencies || {};
  let touched = false;
  for (const [name, version] of Object.entries(extra)) {
    if (PROTECTED_DEPS.has(name)) continue;
    if (typeof version !== 'string' || !version.trim()) continue;
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) {
      continue;
    }
    pkg.dependencies[name] = version;
    touched = true;
  }
  if (touched) {
    await writeAlways(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }
}

/**
 * Mergea el contenido que la IA quiso poner en src/lib/utils.ts con el del
 * scaffold. Preserva intacta la función `cn` (que TODOS los componentes
 * shadcn importan via "@/lib/utils") y apenda las exports extras de la IA
 * (constantes, helpers, datos del proyecto).
 *
 * Si la IA accidentalmente redefinió `cn` o duplicó imports de clsx/
 * tailwind-merge, los quitamos antes de mergear para no tener errores de
 * "duplicate identifier".
 *
 * Si el archivo del scaffold no se puede leer por alguna razon, fallback:
 * escribimos un cn minimo + el contenido de la IA.
 */
async function mergeUtilsTs(
  _projectPath: string,
  aiContent: string,
): Promise<string> {
  const scaffoldHeader = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  // Sanitizar el contenido de la IA:
  //  1. Quitar imports duplicados de clsx / tailwind-merge.
  //  2. Quitar redefiniciones de `cn` (function o const).
  //  3. Quitar líneas vacías al inicio.
  let cleaned = aiContent;
  cleaned = cleaned.replace(
    /^\s*import\s+[^;]*?from\s+["']clsx["'][^;]*;?\s*$/gm,
    '',
  );
  cleaned = cleaned.replace(
    /^\s*import\s+[^;]*?from\s+["']tailwind-merge["'][^;]*;?\s*$/gm,
    '',
  );
  // export function cn(...) { ... }  — multilínea, balanceada con un cierre.
  cleaned = cleaned.replace(
    /export\s+function\s+cn\s*\([\s\S]*?\}\s*\n?/g,
    '',
  );
  // export const cn = ... ; (una linea o multilinea hasta el cierre con ;)
  cleaned = cleaned.replace(
    /export\s+const\s+cn\s*=[\s\S]*?;\s*\n?/g,
    '',
  );
  // Limpiar líneas vacías consecutivas al inicio
  cleaned = cleaned.replace(/^\s*\n+/, '');

  // Si después de limpiar no queda nada útil (la IA solo había emitido cn
  // y nada mas), devolvemos solo el scaffold.
  if (!cleaned.trim()) {
    return scaffoldHeader;
  }

  return `${scaffoldHeader}\n// ─── Constants/helpers added by AI ────────────────────────────────────\n${cleaned}\n`;
}

/**
 * Vuelca los archivos generados por la IA en el workspace.
 * - Soporta paths con o sin prefijo `src/` (la IA usa `src/...` en Sprint 1+).
 * - Bloquea path-traversal (../).
 * - Protege archivos del scaffold (package.json, vite.config.ts, etc.).
 * - Procesa entradas especiales `__deps__.json` (merge a package.json) y
 *   `__design__.json` (sobreescribe colores en index.css via CSS variables).
 */
export async function writeGeneratedFiles(
  projectPath: string,
  files: Record<string, string>,
): Promise<void> {
  // Primero normalizamos paths y filtramos archivos especiales. Construimos
  // un mapa { relPath -> content } para luego analizar imports/exports
  // CRUZADOS entre los archivos (sin esto, un componente que solo tiene
  // `export default Foo` mata el preview cuando otra pagina lo importa como
  // `import { Foo } from "..."` — bug clasico de la IA).
  const normalized: Array<{ rel: string; content: string }> = [];
  for (const [rawPath, content] of Object.entries(files || {})) {
    if (typeof content !== 'string') continue;

    let rel = rawPath
      .replace(/^\.?\/+/, '')
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/');

    // Entradas especiales.
    if (rel === '__deps__.json' || rel === 'package.dependencies.json') {
      await mergeDependencies(projectPath, content);
      continue;
    }
    if (rel === '__design__.json') {
      await applyDesignSystem(projectPath, content);
      continue;
    }

    // COMPAT (proyectos legacy Sprint 0): el modelo viejo emitia AppMain.tsx
    // como entry point del scaffold Babel-CDN. El scaffold Vite actual carga
    // src/pages/Index.tsx (lo importa App.tsx). Sin este rename, los chats
    // ya creados antes de Sprint 3 muestran pantalla blanca porque AppMain
    // queda generado pero nadie lo importa.
    if (/^(src\/)?AppMain\.tsx$/i.test(rel)) {
      rel = 'src/pages/Index.tsx';
    }

    // Auto-prefijar src/ si la IA mando un path sin prefijo (compat legacy:
    // ej. "AppMain.tsx", "components/Hero.tsx" — codigo viejo pre-Sprint 1).
    if (!/^(src|public)\//.test(rel)) {
      rel = `src/${rel}`;
    }

    normalized.push({ rel, content });
  }

  // Normalizar exports cruzados: si A.tsx solo exporta default pero B.tsx
  // lo importa como named (o viceversa), agregamos el shim faltante.
  const fixed = normalizeCrossExports(normalized);

  for (const { rel, content } of fixed) {
    // Anti path-traversal y proteccion de configs/UI base.
    const target = join(projectPath, rel);
    if (!target.startsWith(projectPath)) continue;

    // Archivos CORE del scaffold que NO se pueden sobreescribir. Si la IA
    // intenta pisarlos rompe la app entera (caso clasico: src/lib/utils.ts
    // tiene la funcion `cn` que TODOS los componentes shadcn usan — si la
    // IA lo pisa con sus propias constantes, todos los shadcn revientan
    // con TypeError y la pantalla queda en blanco silencioso).
    //
    // Si la IA realmente necesita constantes/helpers, los pone en otro
    // archivo (src/lib/constants.ts, src/lib/<otro>.ts, etc.).
    if (/^src\/components\/ui\//.test(rel)) {
      this.logger?.warn?.(`[scaffold] bloqueado intento de pisar shadcn: ${rel}`);
      continue;
    }
    // CASO ESPECIAL src/lib/utils.ts: la IA suele meter aqui constantes
    // del proyecto (COMPANY_NAME, COLORS, etc.) que OTROS componentes
    // importan via "@/lib/utils". Bloquear el write sin mas rompe la app.
    // Pero pisarlo directo tambien rompe (mata la funcion `cn` que TODOS
    // los shadcn usan). Solucion: MERGE — preservamos el cn original del
    // scaffold y apendamos las exports extras de la IA.
    if (rel === 'src/lib/utils.ts') {
      const merged = await mergeUtilsTs(projectPath, content);
      await writeAlways(target, merged);
      continue;
    }

    const CORE_PROTECTED = new Set([
      'src/main.tsx',         // entry point del bundle Vite
      'src/vite-env.d.ts',    // tipos Vite
      'src/globals.css',      // gestionado via __design__.json
      'src/index.css',        // gestionado via __design__.json
    ]);
    if (CORE_PROTECTED.has(rel)) {
      // Solo logueamos a stdout via console.warn — sin logger inyectado
      // aqui para no romper la signature del helper.
      console.warn(
        `[scaffold] bloqueado intento de pisar archivo CORE: ${rel}. ` +
          `Si la IA queria poner constantes ahi, deberia usar otro nombre.`,
      );
      continue;
    }
    if (
      rel === 'package.json' ||
      rel === 'vite.config.ts' ||
      rel === 'tsconfig.json' ||
      rel === 'tailwind.config.ts' ||
      rel === 'postcss.config.js' ||
      rel === 'index.html' ||
      rel === 'components.json'
    ) {
      continue;
    }

    await writeAlways(target, content);
  }
}

// ─── Normalizador de exports cruzados ─────────────────────────────────
// La IA mezcla "export default X" en un archivo con "import { X } from ..."
// en otro. Si no arreglamos eso, Vite tira:
//   SyntaxError: The requested module '/X.tsx' does not provide an export
//   named 'X'
// y la pantalla queda en blanco.
//
// Algoritmo:
// 1) Por cada archivo tsx/ts, extraer:
//    - default export name (si tiene)
//    - named exports
// 2) Por cada archivo, leer imports de OTROS archivos del proyecto (@/...).
//    - Detectar si se usa default import o named import.
// 3) Si A importa { Foo } de "./B" pero B solo tiene `export default Foo`
//    -> agregar `export { Foo };` al final de B.
// 4) Si A importa Bar de "./B" pero B solo tiene `export const Bar = ...`
//    -> agregar `export default Bar;` al final de B.
function normalizeCrossExports(
  files: Array<{ rel: string; content: string }>,
): Array<{ rel: string; content: string }> {
  // Index para lookup por path-resuelto (ej. "components/sections/Footer").
  const byKey: Record<string, { rel: string; content: string; idx: number }> = {};
  files.forEach((f, idx) => {
    // key: relativo a src/ y sin extension. ej. components/sections/Footer
    const key = f.rel
      .replace(/^src\//, '')
      .replace(/\.(tsx|ts|jsx|js)$/i, '');
    byKey[key] = { rel: f.rel, content: f.content, idx };
  });

  // Tracking de exports REQUERIDOS por terceros: para cada archivo,
  // que nombres necesitan estar exportados como default y/o named.
  const neededDefault: Record<number, string> = {}; // idx -> name esperado
  const neededNamed: Record<number, Set<string>> = {};

  const importRe =
    /import\s+(?:(\w+)\s*(?:,\s*\{([^}]+)\})?|\{([^}]+)\})\s+from\s+["']@\/([^"']+)["']/g;

  for (const f of files) {
    let m: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((m = importRe.exec(f.content)) !== null) {
      const defImport = m[1];
      const namedFromMixed = m[2];
      const namedOnly = m[3];
      const target = m[4];

      // Resolver el target: probar con y sin extension, y con /index.
      const candidates = [
        target,
        `${target}/index`,
      ];
      let hit: { rel: string; content: string; idx: number } | undefined;
      for (const c of candidates) {
        if (byKey[c]) {
          hit = byKey[c];
          break;
        }
      }
      if (!hit) continue;

      if (defImport) {
        neededDefault[hit.idx] = defImport;
      }
      const namedList = (namedFromMixed || namedOnly || '')
        .split(',')
        .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean);
      if (namedList.length) {
        if (!neededNamed[hit.idx]) neededNamed[hit.idx] = new Set();
        for (const n of namedList) neededNamed[hit.idx].add(n);
      }
    }
  }

  // Detectar lo que CADA archivo ya exporta y agregar shims si falta.
  return files.map((f, idx) => {
    let content = f.content;
    const hasDefault = /export\s+default\s+/.test(content);
    const defaultName = (() => {
      const m =
        content.match(/export\s+default\s+function\s+(\w+)/) ||
        content.match(/export\s+default\s+class\s+(\w+)/) ||
        content.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
      return m ? m[1] : null;
    })();

    const namedExports = new Set<string>();
    const namedReDecl = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
    let mm: RegExpExecArray | null;
    while ((mm = namedReDecl.exec(content)) !== null) {
      namedExports.add(mm[1]);
    }
    const namedReGroup = /export\s*\{\s*([^}]+)\s*\}/g;
    while ((mm = namedReGroup.exec(content)) !== null) {
      mm[1]
        .split(',')
        .map((s) => s.trim().split(/\s+as\s+/).pop()!.trim())
        .filter(Boolean)
        .forEach((n) => namedExports.add(n));
    }

    const additions: string[] = [];

    // Si alguien lo importa como default pero no tiene default:
    if (!hasDefault && neededDefault[idx]) {
      const want = neededDefault[idx];
      if (namedExports.has(want)) {
        additions.push(`export default ${want};`);
      }
    }

    // Si alguien lo importa como named pero solo tiene default:
    if (neededNamed[idx]) {
      const want = neededNamed[idx];
      for (const n of want) {
        if (namedExports.has(n)) continue; // ya exportado
        // Si el default tiene ese mismo nombre, re-exportamos.
        if (defaultName === n) {
          additions.push(`export { ${n} };`);
        }
      }
    }

    if (additions.length) {
      content = `${content.trimEnd()}\n\n// auto-shim: exports normalizados para imports cruzados\n${additions.join('\n')}\n`;
    }
    return { rel: f.rel, content };
  });
}

// ─── Design system: inyecta colores como CSS variables en index.css ───
function safeColor(v: any, fallback: string): string {
  if (typeof v !== 'string') return fallback;
  const s = v.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
  if (/^(rgb|hsl)a?\([0-9.,%\s/]+\)$/i.test(s)) return s;
  return fallback;
}

function hexToHsl(hex: string): string {
  // Convierte #RRGGBB a "H S% L%" (formato que Tailwind shadcn usa).
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return '0 0% 50%';
  const num = parseInt(m[1], 16);
  let r = ((num >> 16) & 255) / 255;
  let g = ((num >> 8) & 255) / 255;
  let b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

async function applyDesignSystem(
  projectPath: string,
  rawJson: string,
): Promise<void> {
  let ds: any;
  try {
    ds = JSON.parse(rawJson);
  } catch {
    return;
  }
  if (!ds || typeof ds !== 'object') return;

  const p = ds.palette || {};
  const palette = {
    primary: safeColor(p.primary, '#6366f1'),
    secondary: safeColor(p.secondary, '#1e293b'),
    accent: safeColor(p.accent, '#f59e0b'),
    bg: safeColor(p.bg, '#0a0a0a'),
    surface: safeColor(p.surface, '#141414'),
    text: safeColor(p.text, '#f8fafc'),
  };

  // index.css inyecta las CSS variables que usa shadcn/ui (background,
  // foreground, primary, secondary, accent, card, etc.) con los colores
  // del proyecto. shadcn las lee automaticamente.
  const indexCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  :root {\n    --background: ${hexToHsl(palette.bg)};\n    --foreground: ${hexToHsl(palette.text)};\n    --card: ${hexToHsl(palette.surface)};\n    --card-foreground: ${hexToHsl(palette.text)};\n    --popover: ${hexToHsl(palette.surface)};\n    --popover-foreground: ${hexToHsl(palette.text)};\n    --primary: ${hexToHsl(palette.primary)};\n    --primary-foreground: ${hexToHsl(palette.text)};\n    --secondary: ${hexToHsl(palette.secondary)};\n    --secondary-foreground: ${hexToHsl(palette.text)};\n    --muted: ${hexToHsl(palette.surface)};\n    --muted-foreground: ${hexToHsl(palette.text)};\n    --accent: ${hexToHsl(palette.accent)};\n    --accent-foreground: ${hexToHsl(palette.text)};\n    --destructive: 0 84% 60%;\n    --destructive-foreground: 0 0% 100%;\n    --border: ${hexToHsl(palette.surface)};\n    --input: ${hexToHsl(palette.surface)};\n    --ring: ${hexToHsl(palette.primary)};\n    --radius: 0.5rem;\n  }\n}\n\nhtml, body, #root { min-height: 100vh; margin: 0; }\nbody { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }\n`;
  await writeAlways(join(projectPath, 'src', 'index.css'), indexCss);

  // Renombrar el viejo globals.css si la copia del scaffold lo dejo.
  // (El scaffold trae src/globals.css; nuestro main.tsx lo importa.)
  try {
    const oldPath = join(projectPath, 'src', 'globals.css');
    if (await pathExists(oldPath)) {
      const content = await fs.readFile(oldPath, 'utf-8');
      // Si el index.css es nuevo, reemplazamos globals.css por la version con design system.
      await writeAlways(oldPath, indexCss);
      void content;
    }
  } catch {
    /* ignore */
  }
}
