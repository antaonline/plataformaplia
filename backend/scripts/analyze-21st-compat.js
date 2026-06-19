/**
 * ANÁLISIS DE COMPATIBILIDAD de los componentes 21st con el scaffold de iachat.
 * Parsea los imports de cada componente y los clasifica:
 *   - compatible  → solo usa deps YA instaladas en el scaffold (usable tal cual)
 *   - nextAdapt   → usa next/image|next/link ("use client") → adaptable con find/replace
 *   - needsDeps   → usa librerías NO instaladas (three, gsap, motion, @hugeicons…)
 * Salida: design-library-source/_compat.json + resumen por categoría.
 *
 * Uso: node scripts/analyze-21st-compat.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'design-library-source');
const SCAFFOLD_PKG = path.join(__dirname, '..', 'scaffolds', 'plia-studio-base', 'package.json');

// Set de deps permitidas = las instaladas en el scaffold + built-ins de React/Vite.
const pkg = JSON.parse(fs.readFileSync(SCAFFOLD_PKG, 'utf-8'));
const ALLOWED = new Set([
  ...Object.keys(pkg.dependencies || {}),
  'react', 'react-dom', 'react/jsx-runtime', 'react-router-dom',
]);
// next/* es adaptable (no "permitido" pero recuperable).
const NEXT = new Set(['next']);

const rootOf = (spec) => {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
};
const isInternal = (spec) => spec.startsWith('.') || spec.startsWith('@/');

function importsOf(content) {
  const out = new Set();
  const re = /(?:import|export)[^'"]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(content))) {
    const spec = m[1] || m[2] || m[3];
    if (spec && !isInternal(spec)) out.add(rootOf(spec));
  }
  return out;
}

function rootName(file) {
  const base = file.replace(/\.(tsx|ts|css|jsx)$/i, '');
  const parts = base.split('__');
  return parts.length >= 2 ? `${parts[0]}__${parts[1]}` : base;
}

function main() {
  const cats = fs.readdirSync(SRC).filter((d) => fs.statSync(path.join(SRC, d)).isDirectory());
  const result = {};
  let tCompat = 0, tNext = 0, tDeps = 0, tTotal = 0;

  for (const cat of cats) {
    const dir = path.join(SRC, cat);
    const files = fs.readdirSync(dir).filter((f) => /\.(tsx|jsx)$/i.test(f));
    const groups = {};
    for (const f of files) (groups[rootName(f)] = groups[rootName(f)] || []).push(f);

    const comps = [];
    for (const [name, fl] of Object.entries(groups)) {
      const deps = new Set();
      for (const f of fl) {
        try { importsOf(fs.readFileSync(path.join(dir, f), 'utf-8')).forEach((d) => deps.add(d)); } catch {}
      }
      const missing = [...deps].filter((d) => !ALLOWED.has(d) && !NEXT.has(d));
      const usesNext = [...deps].some((d) => NEXT.has(d));
      let cls;
      if (missing.length === 0 && !usesNext) cls = 'compatible';
      else if (missing.length === 0 && usesNext) cls = 'nextAdapt';
      else cls = 'needsDeps';
      comps.push({ name, cls, missing });
    }
    const compat = comps.filter((c) => c.cls === 'compatible').length;
    const next = comps.filter((c) => c.cls === 'nextAdapt').length;
    const needs = comps.filter((c) => c.cls === 'needsDeps').length;
    result[cat] = { total: comps.length, compatible: compat, nextAdapt: next, needsDeps: needs, components: comps };
    tCompat += compat; tNext += next; tDeps += needs; tTotal += comps.length;
  }

  fs.writeFileSync(path.join(SRC, '_compat.json'), JSON.stringify({ generatedAt: new Date().toISOString(), totals: { total: tTotal, compatible: tCompat, nextAdapt: tNext, needsDeps: tDeps }, categories: result }, null, 2));

  console.log(`\n🔬 Compatibilidad con el scaffold de iachat (${tTotal} componentes)\n`);
  console.log(`  ✅ compatible (usable tal cual):  ${tCompat}`);
  console.log(`  🔧 nextAdapt (Next.js → adaptar): ${tNext}`);
  console.log(`  📦 needsDeps (libs no instaladas): ${tDeps}\n`);
  console.log('  Por categoría (compatible / nextAdapt / needsDeps):');
  for (const cat of cats) {
    const r = result[cat];
    console.log(`    ${cat.padEnd(14)} ${String(r.compatible).padStart(4)} / ${String(r.nextAdapt).padStart(4)} / ${String(r.needsDeps).padStart(4)}  (de ${r.total})`);
  }
  console.log(`\n→ design-library-source/_compat.json\n`);
}

main();
