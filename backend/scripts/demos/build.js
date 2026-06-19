/**
 * GENERADOR DE DEMOS — plia.pe/ejemplos
 * ─────────────────────────────────────
 * Por cada sector (sectors.js): resuelve imágenes reales de Pexels, arma el
 * <head> canónico de PLIA (Tailwind CDN + Google Fonts + variables :root +
 * .reveal) y ensambla los bloques (blocks.js) según el plan del sector.
 * Salida: demos-build/d-<slug>/index.html  +  demos-build/manifest.json
 *
 * No gasta tokens de IA: el "cerebro" es el contenido curado por sector.
 * Uso:  node scripts/demos/build.js            (todos)
 *       node scripts/demos/build.js juridico   (uno o varios por slug)
 */
const fs = require('fs');
const path = require('path');
const B = require('./blocks');
const pex = require('./pexels');
const SECTORS = require('./sectors');

const OUT = path.join(__dirname, '..', '..', 'demos-build');
const BASE_DOMAIN = process.env.DEMO_BASE_DOMAIN || 'plia.pe';

/** <head> idéntico al que emite el motor + noindex (demo, no debe indexarse). */
function head(s) {
  const hf = s.fonts.heading.replace(/ /g, '+');
  const bf = s.fonts.body.replace(/ /g, '+');
  const p = s.palette;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${B.esc(s.brand)} — ${B.esc(s.label)}</title>
<meta name="description" content="${B.esc(s.sub)}">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${hf}:wght@400;600;700;800;900&family=${bf}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--primary:${p.primary};--secondary:${p.secondary};--accent:${p.accent};--bg:${p.bg};--text:${p.text}}
html{scroll-behavior:smooth}
body{font-family:'${s.fonts.body}',system-ui,sans-serif;background:var(--bg);color:var(--text);margin:0;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'${s.fonts.heading}',serif}
/* Reveal A PRUEBA DE FALLOS: visible por defecto; solo se "arma" (oculta) si el JS corre (.js). */
.reveal{opacity:1;transform:none;transition:opacity .55s cubic-bezier(.2,.7,.2,1),transform .55s cubic-bezier(.2,.7,.2,1)}
.js .reveal{opacity:0;transform:translateY(34px)}
.js .reveal.in{opacity:1;transform:none}
.tilt{transition:transform .25s cubic-bezier(.2,.7,.2,1);will-change:transform}
[data-parallax]{will-change:transform}
::selection{background:var(--primary);color:#fff}
</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<!-- DEMO generado por PLIA · plia.pe -->`;
}

/**
 * Capa de EFECTOS PREMIUM (vanilla + GSAP por CDN): reveal con stagger, parallax
 * en hero, count-up de stats, tilt 3D en cards y smooth scroll (Lenis).
 * Progressive enhancement: si GSAP/JS no carga, el contenido se ve igual.
 */
function closing() {
  return `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script>
(function(){
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
ready(function(){
  var G=window.gsap, ST=window.ScrollTrigger;
  // ---- REVEAL (GSAP→IntersectionObserver→visible) ----
  if(G&&ST){
    G.registerPlugin(ST);
    G.utils.toArray('.reveal').forEach(function(el){ST.create({trigger:el,start:'top 88%',once:true,onEnter:function(){el.classList.add('in');}});});
  } else if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  } else { document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');}); }
  setTimeout(function(){document.querySelectorAll('.reveal:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight+250)el.classList.add('in');});},2500);

  if(G&&ST){
    // ---- PARALLAX en imágenes de hero ----
    G.utils.toArray('[data-parallax]').forEach(function(img){
      var sec=img.closest('section')||img;
      G.fromTo(img,{yPercent:-7},{yPercent:13,ease:'none',scrollTrigger:{trigger:sec,start:'top bottom',end:'bottom top',scrub:true}});
    });
    // ---- COUNT-UP de stats ----
    G.utils.toArray('[data-count]').forEach(function(el){
      var raw=el.getAttribute('data-count');var m=raw.match(/^(\\D*)([\\d.,]+)(.*)$/);if(!m)return;
      var pre=m[1],ns=m[2],suf=m[3],comma=ns.indexOf(',')>-1,dec=(ns.split('.')[1]||'').length,target=parseFloat(ns.replace(/,/g,''));
      if(isNaN(target))return;var o={v:0};
      ST.create({trigger:el,start:'top 92%',once:true,onEnter:function(){G.to(o,{v:target,duration:1.7,ease:'power2.out',onUpdate:function(){var v=o.v.toFixed(dec);if(comma)v=Number(v).toLocaleString('en-US');el.textContent=pre+v+suf;}});}});
    });
  }
  // ---- TILT 3D en cards (sin dependencias) ----
  if(!matchMedia('(hover:none)').matches){
    document.querySelectorAll('.tilt').forEach(function(c){
      c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateX('+(-y*5).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg) translateY(-5px)';});
      c.addEventListener('mouseleave',function(){c.style.transform='';});
    });
  }
  // (scroll nativo — sin smooth-scroll, navegación rápida)
  // ---- FORM demo ----
  document.querySelectorAll('form[data-plia-contact]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var m=f.querySelector('[data-plia-msg]');if(m){m.style.display='block';m.textContent='¡Gracias! Este es un demo de PLIA — en tu web real recibirías este mensaje.';m.style.color='#16a34a';}f.reset();});});
});
})();
</script>
</body></html>`;
}

/** Resuelve todas las imágenes Pexels que el sector declara. */
async function resolveImages(s) {
  const px = s.pexels || {};
  const img = {};
  if (px.hero) img.hero = await pex.photo(px.hero, 'landscape', 1800);
  if (px.about) img.about = await pex.photo(px.about, 'portrait', 1200);
  if (px.gallery) img.gallery = await pex.photos(px.gallery.join(' '), px.gallery.length, 'landscape', 1000).then(
    async (arr) => arr.length >= px.gallery.length ? arr : Promise.all(px.gallery.map((q) => pex.photo(q, 'landscape', 1000)))
  ).catch(() => Promise.all(px.gallery.map((q) => pex.photo(q, 'landscape', 1000))));
  // galería y cards: una foto por query para máxima relevancia
  if (px.gallery) img.gallery = await Promise.all(px.gallery.map((q) => pex.photo(q, 'landscape', 1100)));
  if (px.cards) img.cards = await Promise.all(px.cards.map((q) => pex.photo(q, 'landscape', 1000)));
  if (px.team) img.team = await Promise.all(px.team.map((q) => pex.photo(q, 'portrait', 800)));
  return img;
}

async function buildSector(s) {
  s.img = await resolveImages(s);
  s.whatsappHref = s.whatsappHref || '#';
  const body = (s.plan || []).map((blockName) => {
    const fn = B[blockName];
    if (!fn) { console.warn(`  ⚠ bloque desconocido: ${blockName}`); return ''; }
    return fn(s);
  }).join('\n');

  const html = head(s) + '\n' + body + '\n' + closing();
  const dir = path.join(OUT, `d-${s.slug}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  console.log(`  ✓ d-${s.slug}  (${(html.length / 1024).toFixed(0)} KB)`);
  return {
    slug: s.slug,
    brand: s.brand,
    label: s.label,
    category: s.category,
    subdomain: `d-${s.slug}.${BASE_DOMAIN}`,
    url: `https://d-${s.slug}.${BASE_DOMAIN}`,
    thumb: s.img.hero,
    accent: s.palette.primary,
  };
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? SECTORS.filter((s) => only.includes(s.slug)) : SECTORS;
  if (!list.length) { console.error('No hay sectores que coincidan con:', only); process.exit(1); }

  fs.mkdirSync(OUT, { recursive: true });
  console.log(`\n🏗  Generando ${list.length} demo(s) en ${OUT}\n`);
  const manifest = [];
  for (const s of list) {
    try { manifest.push(await buildSector(s)); }
    catch (e) { console.error(`  ✗ d-${s.slug}: ${e.message}`); }
  }

  // Merge en el manifest existente (para builds parciales)
  const manifestPath = path.join(OUT, 'manifest.json');
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')); } catch {}
  const bySlug = new Map(prev.map((m) => [m.slug, m]));
  manifest.forEach((m) => bySlug.set(m.slug, m));
  const merged = [...bySlug.values()].sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
  fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));

  // Copia el manifest al frontend (estático) para la galería plia.pe/ejemplos.
  const frontendPublic = path.join(__dirname, '..', '..', '..', 'frontend', 'public');
  if (fs.existsSync(frontendPublic)) {
    fs.writeFileSync(path.join(frontendPublic, 'demos-manifest.json'), JSON.stringify(merged));
    console.log(`📤 manifest copiado a frontend/public/demos-manifest.json`);
  }
  console.log(`\n📦 manifest.json actualizado (${merged.length} demos en total)\n`);
}

main();
