/**
 * CATÁLOGO de la librería 21st importada localmente.
 * Escanea backend/design-library-source/ y genera un índice por categoría
 * (componente raíz + nº de archivos), para tener registrada TODA la librería y
 * poder auditar qué tenemos. Salida: design-library-source/_catalog.json
 *
 * Uso: node scripts/build-21st-catalog.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'design-library-source');

function rootName(file) {
  // author__component(__subpart).tsx  →  author__component
  const base = file.replace(/\.(tsx|ts|css|jsx)$/i, '');
  const parts = base.split('__');
  return parts.length >= 2 ? `${parts[0]}__${parts[1]}` : base;
}

function main() {
  if (!fs.existsSync(SRC)) { console.error('No existe', SRC); process.exit(1); }
  const cats = fs.readdirSync(SRC).filter((d) => fs.statSync(path.join(SRC, d)).isDirectory());
  const catalog = {};
  let totalFiles = 0, totalComponents = 0;

  for (const cat of cats) {
    const dir = path.join(SRC, cat);
    const files = fs.readdirSync(dir).filter((f) => /\.(tsx|jsx)$/i.test(f));
    const groups = {};
    for (const f of files) {
      const r = rootName(f);
      (groups[r] = groups[r] || []).push(f);
    }
    const components = Object.keys(groups).sort().map((name) => ({
      name,
      author: name.split('__')[0],
      files: groups[name].length,
    }));
    catalog[cat] = { count: components.length, files: files.length, components };
    totalFiles += files.length;
    totalComponents += components.length;
  }

  const out = { generatedAt: new Date().toISOString(), totals: { categories: cats.length, components: totalComponents, files: totalFiles }, categories: catalog };
  fs.writeFileSync(path.join(SRC, '_catalog.json'), JSON.stringify(out, null, 2));

  console.log(`\n📚 Catálogo 21st — ${cats.length} categorías · ${totalComponents} componentes · ${totalFiles} archivos\n`);
  for (const cat of cats) {
    console.log(`  ${cat.padEnd(14)} ${String(catalog[cat].count).padStart(4)} componentes  (${catalog[cat].files} archivos)`);
  }
  console.log(`\n→ design-library-source/_catalog.json\n`);
}

main();
