import * as fs from 'fs/promises';
import { join, dirname } from 'path';

async function writeIfMissing(filePath: string, contents: string) {
  try {
    await fs.access(filePath);
    return;
  } catch {
    /* continue */
  }
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

// Escribe SOLO si el contenido cambio. Critico: reescribir vite.config.ts /
// index.html con el mismo contenido igual hace que Vite reinicie el server
// (mira mtime) y el preview se cae en cada sync. Comparar evita el loop.
async function writeAlways(filePath: string, contents: string) {
  try {
    const current = await fs.readFile(filePath, 'utf8');
    if (current === contents) return;
  } catch {
    /* no existe: se crea */
  }
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

const PKG = {
  name: 'plia-studio-preview',
  private: true,
  version: '0.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
  },
  // Todo va en dependencies (no devDependencies) a proposito: el backend puede
  // correr con NODE_ENV=production y npm omitiria las devDependencies, dejando
  // sin instalar vite/tailwind. Aqui "produccion" es siempre un dev server.
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'framer-motion': '^11.0.0',
    'lucide-react': '^0.400.0',
    // Estandar de la industria para el helper cn(); el modelo los usa SIEMPRE.
    clsx: '^2.1.1',
    'tailwind-merge': '^2.5.4',
    'class-variance-authority': '^0.7.0',
    'html-to-image': '^1.11.11',
    '@vitejs/plugin-react': '^4.3.1',
    autoprefixer: '^10.4.19',
    postcss: '^8.4.38',
    tailwindcss: '^3.4.4',
    typescript: '^5.4.5',
    vite: '^5.3.1',
  },
};

const VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    allowedHosts: true,
    hmr: { overlay: true },
  },
  clearScreen: false,
});
`;

const INDEX_HTML = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PLIA Studio Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const MAIN_TSX = `import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as Entry from './AppMain';

const App: React.ComponentType =
  (Entry as any).default ||
  (Entry as any).AppMain ||
  (Entry as any).App ||
  (() => React.createElement('div', { style: { padding: 32, fontFamily: 'sans-serif' } }, 'No se encontro un componente exportado en AppMain.tsx'));

createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null, React.createElement(App)),
);

// Capturador de thumbnail: el Studio (parent) envia { type: 'PLIA_CAPTURE' }
// y respondemos con la imagen del DOM (estilo Dyad). Cross-origin OK.
window.addEventListener('message', async (e: MessageEvent) => {
  if (!e.data || e.data.type !== 'PLIA_CAPTURE') return;
  try {
    const { toPng } = await import('html-to-image');
    const target = (document.getElementById('root') as HTMLElement) || document.body;
    const dataUrl = await toPng(target, {
      cacheBust: true,
      pixelRatio: 0.6,
      backgroundColor:
        getComputedStyle(document.body).backgroundColor || '#0a0a0a',
      filter: (n: any) =>
        !(n && n.tagName === 'IFRAME'),
    });
    window.parent.postMessage({ type: 'PLIA_SHOT', dataUrl }, '*');
  } catch (err) {
    window.parent.postMessage({ type: 'PLIA_SHOT_ERROR' }, '*');
  }
});
`;

const INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { min-height: 100vh; margin: 0; }
`;

const TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
`;

const POSTCSS_CONFIG = `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`;

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowJs": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
`;

const PLACEHOLDER_APPMAIN = `export default function AppMain() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
      Esperando codigo generado por la IA...
    </div>
  );
}
`;

/**
 * Crea (idempotente) un proyecto Vite + React + Tailwind minimo en projectPath.
 * Equivalente al scaffoldBasicNextApp de Claudable, adaptado a los componentes
 * TSX sueltos que genera la IA de PLIA (entrada: src/AppMain.tsx).
 */
export async function scaffoldViteApp(projectPath: string): Promise<void> {
  await fs.mkdir(join(projectPath, 'src'), { recursive: true });

  await writeAlways(join(projectPath, 'package.json'), `${JSON.stringify(PKG, null, 2)}\n`);
  await writeAlways(join(projectPath, 'vite.config.ts'), VITE_CONFIG);
  await writeAlways(join(projectPath, 'src', 'main.tsx'), MAIN_TSX);
  await writeAlways(join(projectPath, 'postcss.config.js'), POSTCSS_CONFIG);
  await writeAlways(join(projectPath, 'tsconfig.json'), TSCONFIG);
  // index.html / tailwind.config.js / index.css los REESCRIBE applyDesignSystem
  // con el design system. Aqui solo se crean si faltan (placeholder), para no
  // pelearnos por el contenido y disparar reloads infinitos de Vite.
  await writeIfMissing(join(projectPath, 'index.html'), INDEX_HTML);
  await writeIfMissing(join(projectPath, 'tailwind.config.js'), TAILWIND_CONFIG);
  await writeIfMissing(join(projectPath, 'src', 'index.css'), INDEX_CSS);
  await writeIfMissing(join(projectPath, 'src', 'AppMain.tsx'), PLACEHOLDER_APPMAIN);
}

// Lista blanca: nunca dejamos que la IA pise paquetes del core del scaffold.
const PROTECTED_DEPS = new Set([
  'react',
  'react-dom',
  'vite',
  '@vitejs/plugin-react',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'typescript',
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
  for (const [name, version] of Object.entries(extra)) {
    if (PROTECTED_DEPS.has(name)) continue;
    if (typeof version !== 'string' || !version.trim()) continue;
    // Solo nombres de paquete npm validos.
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) {
      continue;
    }
    pkg.dependencies[name] = version;
  }
  await writeAlways(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function safeColor(v: any, fallback: string): string {
  if (typeof v !== 'string') return fallback;
  const s = v.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
  if (/^(rgb|hsl)a?\([0-9.,%\s/]+\)$/i.test(s)) return s;
  return fallback;
}

function safeFont(v: any, fallback: string): string {
  if (typeof v !== 'string') return fallback;
  const s = v.trim().replace(/['"\\<>{}]/g, '');
  return s.length > 0 && s.length < 40 ? s : fallback;
}

function fontQuery(name: string): string {
  return encodeURIComponent(name).replace(/%20/g, '+');
}

/**
 * Hornea el design system que decidio la IA en el proyecto: colores
 * semanticos en Tailwind (bg-primary, text-text, etc.), tipografias
 * via Google Fonts y variables CSS. Asi el output sale on-brand aunque
 * el modelo sea mas debil (se acaba el "todo blanco y negro generico").
 */
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
  const heading = safeFont(ds.fonts?.heading, 'Poppins');
  const body = safeFont(ds.fonts?.body, 'Inter');

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${palette.primary}',
        secondary: '${palette.secondary}',
        accent: '${palette.accent}',
        bg: '${palette.bg}',
        surface: '${palette.surface}',
        text: '${palette.text}',
      },
      fontFamily: {
        heading: ['${heading}', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['${body}', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`;
  await writeAlways(join(projectPath, 'tailwind.config.js'), tailwindConfig);

  const fontsHref = `https://fonts.googleapis.com/css2?family=${fontQuery(
    heading,
  )}:wght@400;500;600;700;800;900&family=${fontQuery(
    body,
  )}:wght@300;400;500;600;700&display=swap`;
  const indexHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PLIA Studio Preview</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${fontsHref}" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  await writeAlways(join(projectPath, 'index.html'), indexHtml);

  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: ${palette.primary};
  --color-secondary: ${palette.secondary};
  --color-accent: ${palette.accent};
  --color-bg: ${palette.bg};
  --color-surface: ${palette.surface};
  --color-text: ${palette.text};
}

html, body, #root { min-height: 100vh; margin: 0; }
body {
  background-color: ${palette.bg};
  color: ${palette.text};
  font-family: '${body}', ui-sans-serif, system-ui, sans-serif;
}
h1, h2, h3, h4, h5, h6 { font-family: '${heading}', ui-sans-serif, system-ui, sans-serif; }
`;
  await writeAlways(join(projectPath, 'src', 'index.css'), indexCss);
}

/**
 * Escribe los archivos generados por la IA dentro de <projectPath>/src.
 * Normaliza las rutas ("/AppMain.tsx" -> "src/AppMain.tsx") y garantiza
 * que exista un AppMain.tsx de entrada. Las entradas reservadas
 * "__deps__.json" y "__design__.json" se procesan aparte (no son fuente).
 */
export async function writeGeneratedFiles(
  projectPath: string,
  files: Record<string, string>,
): Promise<void> {
  const srcDir = join(projectPath, 'src');
  await fs.mkdir(srcDir, { recursive: true });

  const entries = Object.entries(files || {}).filter(
    ([, content]) => typeof content === 'string',
  );

  let hasAppMain = false;
  const writtenTsx: string[] = [];

  for (const [rawPath, content] of entries) {
    let rel = rawPath.replace(/^\/+/, '').trim();

    // Entrada reservada: dependencias declaradas por la IA. No es un archivo
    // fuente; se fusiona en el package.json raiz (scaffold flexible).
    if (rel === '__deps__.json' || rel === 'package.dependencies.json') {
      await mergeDependencies(projectPath, content);
      continue;
    }

    // Entrada reservada: design system. Se hornea en tailwind.config.js,
    // index.html (Google Fonts) e index.css (variables/base).
    if (rel === '__design__.json') {
      await applyDesignSystem(projectPath, content);
      continue;
    }

    if (!rel || rel === '/') rel = 'AppMain.tsx';

    // Evitar escapar del directorio del proyecto.
    const target = join(srcDir, rel);
    if (!target.startsWith(srcDir)) continue;

    // Fix determinista de rutas: un archivo en la raiz de src/ (ej.
    // AppMain.tsx) que importe '../components|data|lib|hooks/...' escapa de
    // src/ y rompe el build. Debe ser './...'. Solo aplica a archivos raiz.
    let finalContent = content;
    if (!rel.includes('/')) {
      finalContent = finalContent.replace(
        /((?:from\s+|import\(\s*|import\s+)['"`])\.\.\/(components|data|lib|hooks|context|utils|styles|assets)\//g,
        '$1./$2/',
      );
    }

    await writeAlways(target, finalContent);

    if (/\.(tsx|jsx)$/i.test(rel)) writtenTsx.push(rel);
    if (rel === 'AppMain.tsx') hasAppMain = true;
  }

  // Si la IA no genero AppMain.tsx pero hay otro componente, lo reexportamos.
  if (!hasAppMain && writtenTsx.length > 0) {
    const first = writtenTsx[0].replace(/\.(tsx|jsx)$/i, '');
    const reexport = `import * as Mod from './${first}';\nconst App: any = (Mod as any).default || (Mod as any).AppMain || (Mod as any).App;\nexport default App;\n`;
    await writeAlways(join(srcDir, 'AppMain.tsx'), reexport);
  }
}
