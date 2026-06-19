/**
 * INSTALADOR/ADAPTADOR de bloques 21st → scaffold de iachat (React).
 * Auto-selecciona SECCIONES compatibles (deps ya instaladas), las adapta para
 * Vite (quita "use client", next/image→img, next/link→Link, imports relativos
 * shadcn→@/components/ui/*) y las copia a scaffolds/.../src/components/blocks/.
 * Luego AUTO-VERIFICA con `tsc` y descarta (quarantine) los que no compilan,
 * iterando hasta que el typecheck pase. Manifest final: _installed-blocks.json.
 *
 * Uso: node scripts/install-21st-blocks.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, '..', 'design-library-source');
const SCAFFOLD = path.join(__dirname, '..', 'scaffolds', 'plia-studio-base');
const BLOCKS_DIR = path.join(SCAFFOLD, 'src', 'components', 'blocks');

const SHADCN = new Set(['accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge', 'breadcrumb', 'button', 'calendar', 'card', 'carousel', 'chart', 'checkbox', 'collapsible', 'command', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 'form', 'hover-card', 'input', 'input-otp', 'label', 'menubar', 'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group', 'resizable', 'scroll-area', 'select', 'separator', 'sheet', 'sidebar', 'skeleton', 'slider', 'sonner', 'switch', 'table', 'tabs', 'textarea', 'toast', 'toaster', 'toggle', 'toggle-group', 'tooltip']);

// Categorías de sección y cuántas tomar de cada una.
const SECTION_CATS = { hero: 20, heroes: 14, pricing: 16, testimonials: 14, card: 14, carousel: 8, text: 6, navbar: 22 };
// Para la categoría navbar (incluye navs Y footers): filtro propio.
const NAV_INCLUDE = ['nav', 'footer', 'header', 'menu', 'sidebar', 'dock', 'tabbar', 'topbar'];
const NAV_ATOM = ['toolbar', 'menu-item', 'list-item', 'dropdown', 'breadcrumb', 'pagination', 'command', 'tab-', 'search', 'send', 'attachment', 'input', 'otp', 'avatar', 'badge', 'button', 'tooltip', 'notification'];
const SECTION_KW = ['hero', 'pricing', 'price', 'testimonial', 'feature', 'bento', 'cta', 'footer', 'header', 'nav', 'gallery', 'stat', 'faq', 'contact', 'team', 'logo', 'marquee', 'showcase', 'banner', 'section', 'review', 'quote', 'about', 'spotlight', 'aurora', 'highlight', 'grid', 'lamp', 'typewriter', 'flip', 'cards'];
const ATOM_KW = ['button', 'btn', 'input', 'otp', 'send', 'toolbar', 'dropdown', 'tooltip', 'badge', 'switch', 'checkbox', 'toggle', 'menu-item', 'list-item', 'avatar', 'chip', 'spinner', 'loader', 'skeleton', 'breadcrumb', 'pagination', 'popover', 'dialog', 'modal', 'sheet', 'drawer', 'command', 'picker', '-select', 'star', 'icon', 'cursor', 'notification', 'calendar', 'date-', 'color', '-slider', 'range', 'accordion', 'collapsible', 'separator', 'progress', 'upload', 'search', 'copy', 'terminal', 'chat', '-message', 'comment', 'sidebar', 'tree', 'cookie', 'toast', 'otps', 'tags', 'tab-', 'bar', 'pill', 'counter', 'number-', 'clock', 'timer'];

const hasKw = (name, kws) => kws.some((k) => name.toLowerCase().includes(k));

function pascal(componentSeg) {
  return componentSeg.split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('').replace(/[^A-Za-z0-9]/g, '');
}

function adapt(code) {
  let c = code;
  c = c.replace(/^\s*['"]use (client|server)['"];?\s*/m, '');
  c = c.replace(/import\s+Image\s+from\s+["']next\/image["'];?\s*/g, '');
  c = c.replace(/<Image(\s)/g, '<img$1').replace(/<\/Image>/g, '</img>');
  if (/from\s+["']next\/link["']/.test(c)) {
    c = c.replace(/import\s+Link\s+from\s+["']next\/link["'];?/g, 'import { Link } from "react-router-dom";');
    c = c.replace(/(<Link[^>]*?)\shref=/g, '$1 to=');
  }
  c = c.replace(/import\s+\{[^}]*\}\s+from\s+["']next\/navigation["'];?\s*/g,
    'const useRouter=()=>({push:(_:string)=>{},replace:(_:string)=>{},back:()=>{}});const usePathname=()=>"/";const useSearchParams=()=>new URLSearchParams();\n');
  c = c.replace(/from\s+["'](?:\.\.?\/)+(?:components\/ui\/)?([a-z0-9-]+)["']/g,
    (m, name) => (SHADCN.has(name) ? `from "@/components/ui/${name}"` : m));
  return c;
}

function detectExport(code, fallback) {
  let m;
  if ((m = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/))) return { name: m[1], isDefault: true };
  if (/export\s+default\s+/.test(code)) return { name: fallback, isDefault: true };
  if ((m = code.match(/export\s+(?:const|function)\s+([A-Z][A-Za-z0-9_]+)/))) return { name: m[1], isDefault: false };
  if ((m = code.match(/export\s*\{\s*([A-Z][A-Za-z0-9_]+)/))) return { name: m[1], isDefault: false };
  return { name: fallback, isDefault: false };
}

const lastSeg = (file) => file.replace(/\.tsx$/, '').split('__').pop();
function groupFiles(catDir, root) {
  return fs.readdirSync(catDir).filter((f) => f.endsWith('.tsx') && (f === root + '.tsx' || f.startsWith(root + '__')));
}
function mainFileOf(catDir, files, root) {
  const short = root.split('__')[1];
  const byShort = files.find((f) => lastSeg(f) === short);
  if (byShort) return byShort;
  const flat = files.find((f) => f === root + '.tsx');
  if (flat) return flat;
  return files.slice().sort((a, b) => fs.statSync(path.join(catDir, b)).size - fs.statSync(path.join(catDir, a)).size)[0];
}

function selectCandidates() {
  const compat = JSON.parse(fs.readFileSync(path.join(SRC, '_compat.json'), 'utf-8'));
  const picks = [];
  const usedNames = new Set();
  for (const [c, limit] of Object.entries(SECTION_CATS)) {
    const r = compat.categories[c];
    if (!r) continue;
    let count = 0;
    for (const comp of r.components) {
      if (count >= limit) break;
      // compatible (deps del scaffold) + nextAdapt (Next.js → el adapter lo convierte).
      if (comp.cls !== 'compatible' && comp.cls !== 'nextAdapt') continue;
      const short = comp.name.split('__')[1] || comp.name;
      let type, ok;
      if (c === 'navbar') {
        ok = hasKw(short, NAV_INCLUDE) && !hasKw(short, NAV_ATOM);
        type = short.toLowerCase().includes('footer') ? 'footer' : 'nav';
      } else {
        ok = (['hero', 'heroes', 'pricing', 'testimonials'].includes(c) || hasKw(short, SECTION_KW)) && !hasKw(short, ATOM_KW);
        type = c === 'heroes' ? 'hero' : c;
      }
      if (!ok) continue;
      let name = pascal(short);
      if (!name || name.length < 3) continue;
      if (usedNames.has(name)) name += pascal(comp.name.split('__')[0]).slice(0, 4);
      if (usedNames.has(name)) continue;
      usedNames.add(name);
      picks.push({ cat: c, root: comp.name, name, type });
      count++;
    }
  }
  return picks;
}

function tscErrors() {
  try {
    execSync('npx tsc -p tsconfig.app.json --noEmit', { cwd: SCAFFOLD, stdio: 'pipe' });
    return [];
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    const bad = new Set();
    // captura el bloque: archivo plano (Name.tsx) o el primer segmento de una subcarpeta (Name/...).
    for (const m of out.matchAll(/src[\\/]components[\\/]blocks[\\/]([A-Za-z0-9_]+)/g)) bad.add(m[1]);
    return [...bad];
  }
}

function main() {
  if (fs.existsSync(BLOCKS_DIR)) for (const f of fs.readdirSync(BLOCKS_DIR)) {
    const p = path.join(BLOCKS_DIR, f);
    if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    else if (f.endsWith('.tsx')) fs.unlinkSync(p);
  }
  fs.mkdirSync(BLOCKS_DIR, { recursive: true });

  const picks = selectCandidates();
  console.log(`\n🧩 Candidatos seleccionados: ${picks.length}. Adaptando + copiando…`);
  const meta = {};
  for (const b of picks) {
    const catDir = path.join(SRC, b.cat);
    const files = groupFiles(catDir, b.root);
    if (!files.length) continue;
    const main = mainFileOf(catDir, files, b.root);
    const mainAdapted = adapt(fs.readFileSync(path.join(catDir, main), 'utf-8'));
    const exp = detectExport(mainAdapted, b.name);
    if (files.length === 1) {
      fs.writeFileSync(path.join(BLOCKS_DIR, `${b.name}.tsx`), mainAdapted, 'utf-8');
    } else {
      // grupo multi-archivo → subcarpeta blocks/<Name>/ (main=index.tsx, hermanos no-shadcn junto a él)
      const dir = path.join(BLOCKS_DIR, b.name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.tsx'), mainAdapted, 'utf-8');
      for (const f of files) {
        if (f === main) continue;
        const seg = lastSeg(f);
        if (SHADCN.has(seg)) continue; // el adapter remapea ./<shadcn> → @/components/ui/*
        fs.writeFileSync(path.join(dir, `${seg}.tsx`), adapt(fs.readFileSync(path.join(catDir, f), 'utf-8')), 'utf-8');
      }
    }
    meta[b.name] = { block: b.name, type: b.type, export: exp.name, isDefault: exp.isDefault, import: `@/components/blocks/${b.name}`, source: `${b.cat}/${b.root} (${files.length} arch.)` };
  }

  // AUTO-QUARANTINE: descarta los que no compilan, iterando.
  console.log(`🔬 Verificando con tsc y descartando los que no compilan…`);
  for (let i = 0; i < 8; i++) {
    const bad = tscErrors();
    if (!bad.length) { console.log(`  ✓ typecheck limpio en la iteración ${i + 1}`); break; }
    console.log(`  iteración ${i + 1}: descartando ${bad.length} con error (${bad.slice(0, 6).join(', ')}${bad.length > 6 ? '…' : ''})`);
    for (const name of bad) {
      const flat = path.join(BLOCKS_DIR, `${name}.tsx`);
      const folder = path.join(BLOCKS_DIR, name);
      if (fs.existsSync(flat)) fs.unlinkSync(flat);
      else if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) fs.rmSync(folder, { recursive: true, force: true });
      delete meta[name];
    }
  }

  const manifest = Object.values(meta);
  fs.writeFileSync(path.join(SRC, '_installed-blocks.json'), JSON.stringify(manifest, null, 2));
  const byType = {};
  manifest.forEach((m) => (byType[m.type] = (byType[m.type] || 0) + 1));
  console.log(`\n📦 ${manifest.length} bloques 21st instalados y VERIFICADOS en src/components/blocks/`);
  console.log(`   Por tipo: ${JSON.stringify(byType)}`);
  console.log(`   Manifest: design-library-source/_installed-blocks.json\n`);
}

main();
