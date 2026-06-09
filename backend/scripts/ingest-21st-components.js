/**
 * INGESTA DE COMPONENTES 21ST.DEV → biblioteca local de Plia
 * ──────────────────────────────────────────────────────────
 * Descarga el código fuente real de componentes de 21st.dev (vía su registro
 * shadcn) y los guarda localmente para usarlos en iachat (PliaStudio React).
 *
 * USO:
 *   1. Pega tus URLs (una por línea) en: backend/scripts/21st-urls.txt
 *      Formato aceptado:
 *        https://21st.dev/community/components/<autor>/<componente>/<variante>
 *        (o directamente https://21st.dev/r/<autor>/<componente>)
 *   2. Ejecuta:  node scripts/ingest-21st-components.js
 *      Opcional categoría:  node scripts/ingest-21st-components.js heroes
 *
 * SALIDA:
 *   - backend/design-library-source/<categoria>/<autor>__<componente>.tsx
 *   - backend/design-library-source/<categoria>/_dependencies.json  (resumen de deps npm)
 *
 * NOTA: respeta los Términos de 21st.dev. Las dependencias reportadas deben
 * instalarse en el scaffold (plia-studio-base/package.json) para que los
 * componentes pesados (three.js, ogl, gsap, cobe...) funcionen en iachat.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CATEGORY = process.argv[2] || 'misc';
const URLS_FILE = path.join(__dirname, '21st-urls.txt');
const OUT_DIR = path.join(__dirname, '..', 'design-library-source', CATEGORY);
const API_KEY = process.env.TWENTYFIRST_API_KEY || ''; // opcional, si el registro lo pide

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** community URL → registry URL  (/community/components/a/c/v → /r/a/c) */
function toRegistryUrl(line) {
  const url = line.trim();
  if (!url || url.startsWith('#')) return null;
  if (/\/r\//.test(url)) return url; // ya es registry
  const m = url.match(/21st\.dev\/community\/components\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return `https://21st.dev/r/${m[1]}/${m[2]}`;
}

function slugFromRegistry(regUrl) {
  const m = regUrl.match(/\/r\/([^/]+)\/([^/?#]+)/);
  return m ? `${m[1]}__${m[2]}` : 'unknown__component';
}

async function fetchRegistry(regUrl) {
  const headers = { Accept: 'application/json' };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
  const res = await axios.get(regUrl, { headers, timeout: 30000 });
  return res.data;
}

async function main() {
  if (!fs.existsSync(URLS_FILE)) {
    console.error(`No existe ${URLS_FILE}. Crea ese archivo y pega las URLs (una por línea).`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const lines = fs.readFileSync(URLS_FILE, 'utf-8').split('\n');
  const regUrls = [...new Set(lines.map(toRegistryUrl).filter(Boolean))];
  console.log(`Categoría: ${CATEGORY} — ${regUrls.length} componentes únicos a descargar.\n`);

  const allDeps = {}; // dep → cuántos componentes la usan
  const ok = [];
  const failed = [];

  for (let i = 0; i < regUrls.length; i++) {
    const regUrl = regUrls[i];
    const slug = slugFromRegistry(regUrl);
    process.stdout.write(`[${i + 1}/${regUrls.length}] ${slug} ... `);
    try {
      const data = await fetchRegistry(regUrl);
      const files = Array.isArray(data?.files) ? data.files : [];
      if (!files.length) throw new Error('sin files');

      // Guardar cada archivo del componente (normalmente 1 .tsx, a veces utils)
      let saved = 0;
      for (const f of files) {
        const content = f?.content;
        if (!content) continue;
        const baseName = (f.path || `${slug}.tsx`).split('/').pop();
        const outName = files.length > 1 ? `${slug}__${baseName}` : `${slug}.tsx`;
        fs.writeFileSync(path.join(OUT_DIR, outName), content, 'utf-8');
        saved++;
      }

      // Acumular dependencias npm
      const deps = Array.isArray(data?.dependencies) ? data.dependencies : [];
      for (const d of deps) allDeps[d] = (allDeps[d] || 0) + 1;

      ok.push({ slug, files: saved, deps });
      console.log(`OK (${saved} archivo/s${deps.length ? `, deps: ${deps.join(', ')}` : ''})`);
    } catch (e) {
      failed.push({ slug, error: e?.response?.status || e?.message });
      console.log(`FALLO (${e?.response?.status || e?.message})`);
    }
    await sleep(250); // rate limit amable
  }

  // Resumen de dependencias
  const depsSorted = Object.entries(allDeps).sort((a, b) => b[1] - a[1]);
  fs.writeFileSync(
    path.join(OUT_DIR, '_dependencies.json'),
    JSON.stringify({ totalComponents: ok.length, dependencies: Object.fromEntries(depsSorted), failed }, null, 2),
    'utf-8',
  );

  console.log(`\n──────────────────────────────────────────`);
  console.log(`✅ Descargados: ${ok.length}   ❌ Fallidos: ${failed.length}`);
  console.log(`📦 Dependencias npm a instalar en el scaffold:`);
  depsSorted.forEach(([d, n]) => console.log(`   ${d}  (${n} componentes)`));
  console.log(`\nGuardado en: ${OUT_DIR}`);
  console.log(`Resumen de deps: ${path.join(OUT_DIR, '_dependencies.json')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
