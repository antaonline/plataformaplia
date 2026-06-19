/**
 * Librería de BLOQUES premium para los demos.
 * Cada bloque devuelve HTML autocontenido que usa las variables CSS (:root)
 * --primary --secondary --accent --bg --text y clases Tailwind (CDN), en el
 * mismo formato que emite el motor real de PLIA. Animación de entrada: .reveal.
 *
 * Un "demo" = nav + [secuencia de bloques elegida por el sector] + footer.
 */

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Rotación con semilla (slug) → cada sector elige una variante estable y distinta. */
const hashStr = (s = '') => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
const variant = (seed, salt, n) => hashStr(String(seed) + salt) % n;

/* Texturas/fondos sutiles que ROTAN por sector (destilados de los fondos 21st).
 * Devuelven el `style` completo de un <div class="absolute inset-0">. */
const BG_PATTERNS = [
  'background-image:linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px);background-size:22px 22px;opacity:.06', // cuadrícula
  'background-image:radial-gradient(var(--text) 1.2px,transparent 1.2px);background-size:20px 20px;opacity:.08', // puntos
  'background-image:repeating-linear-gradient(45deg,var(--text) 0,var(--text) 1px,transparent 1px,transparent 13px);opacity:.05', // diagonales
  'background-image:repeating-linear-gradient(45deg,var(--text) 0 1px,transparent 1px 16px),repeating-linear-gradient(-45deg,var(--text) 0 1px,transparent 1px 16px);opacity:.045', // crosshatch
  'background-image:radial-gradient(circle at 25% 15%,color-mix(in srgb,var(--primary) 26%,transparent),transparent 55%),radial-gradient(circle at 85% 90%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 55%);opacity:.6', // glow de color
  'background-image:radial-gradient(var(--text) 0.8px,transparent 0.8px),radial-gradient(var(--text) 0.8px,transparent 0.8px);background-size:30px 30px;background-position:0 0,15px 15px;opacity:.06', // puntos doble
];
const patternStyle = (s) => BG_PATTERNS[variant(s.slug, 'bgpat', BG_PATTERNS.length)];

/* ── helpers de estilo ───────────────────────────────────────── */
const eyebrow = (t, color = 'var(--primary)') =>
  `<p class="reveal text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:${color}">${esc(t)}</p>`;

const btn = (label, opts = {}) => {
  const solid = opts.outline
    ? `border-2 px-7 py-3.5 rounded-full font-semibold transition hover:scale-[1.03]`
    : `px-7 py-3.5 rounded-full font-semibold transition hover:scale-[1.03] shadow-lg`;
  const style = opts.outline
    ? `border-color:var(--primary);color:var(--primary)`
    : `background:var(--primary);color:#fff;box-shadow:0 12px 30px -8px var(--primary)`;
  return `<a href="${opts.href || '#contacto'}" class="inline-block ${solid}" style="${style}">${esc(label)}</a>`;
};

const ICONS = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-5 h-5"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 inline"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
};

/* ── NAV ─────────────────────────────────────────────────────── */
const slugify = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
// Mapea la etiqueta del menú al id REAL de la sección (los bloques definen ids fijos).
const ANCHOR = {
  inicio: 'top', home: 'top',
  carta: 'menu', menu: 'menu',
  propiedades: 'catalogo', catalogo: 'catalogo', productos: 'catalogo', coleccion: 'catalogo', vehiculos: 'catalogo', autos: 'catalogo', destinos: 'catalogo', paquetes: 'catalogo',
  portafolio: 'galeria', proyectos: 'galeria', trabajos: 'galeria', galeria: 'galeria',
  servicios: 'servicios', areasdepractica: 'servicios', especialidades: 'servicios', tratamientos: 'servicios', programas: 'servicios', cursos: 'servicios', soluciones: 'servicios', clases: 'servicios',
  nosotros: 'nosotros', sobrenosotros: 'nosotros', historia: 'nosotros', quienessomos: 'nosotros', conocenos: 'nosotros',
  equipo: 'equipo', doctores: 'equipo', profesionales: 'equipo', staff: 'equipo', medicos: 'equipo',
  planes: 'planes', precios: 'planes', membresias: 'planes', tarifas: 'planes', paquetesplanes: 'planes',
  proceso: 'proceso', metodologia: 'proceso',
  contacto: 'contacto', reservar: 'contacto', reservas: 'contacto', cita: 'contacto', citas: 'contacto', ubicacion: 'contacto', cotizar: 'contacto', cotizacion: 'contacto',
};
const anchorFor = (label) => { const k = slugify(label); return ANCHOR[k] || k; };
const navLinks = (s) => (s.nav || ['Inicio', 'Servicios', 'Nosotros', 'Contacto'])
  .map((l) => `<a href="#${anchorFor(l)}" class="hover:opacity-60 transition">${esc(l)}</a>`).join('');
const brandLink = (s) => `<a href="#top" class="font-extrabold text-xl tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</a>`;
const navCtaBtn = (s) => `<a href="#contacto" class="text-sm font-semibold px-5 py-2.5 rounded-full" style="background:var(--primary);color:#fff">${esc(s.navCta || 'Contáctanos')}</a>`;

function navStandard(s) {
  return `<header class="sticky top-0 z-50 backdrop-blur-md" style="background:color-mix(in srgb,var(--bg) 82%,transparent);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)">
  <nav class="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">${brandLink(s)}<div class="hidden md:flex items-center gap-8 text-sm font-medium">${navLinks(s)}</div>${navCtaBtn(s)}</nav>
</header>`;
}
function navCenteredLogo(s) {
  const links = (s.nav || []).slice(0, 4).map((l) => `<a href="#${anchorFor(l)}" class="hover:opacity-60 transition">${esc(l)}</a>`);
  const half = Math.ceil(links.length / 2);
  return `<header class="sticky top-0 z-50 backdrop-blur-md" style="background:color-mix(in srgb,var(--bg) 84%,transparent);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)">
  <nav class="max-w-7xl mx-auto px-6 h-[72px] grid grid-cols-3 items-center text-sm font-medium"><div class="flex gap-6">${links.slice(0, half).join('')}</div><div class="text-center font-extrabold text-xl tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div><div class="flex justify-end gap-6 items-center">${links.slice(half).join('')}<a href="#contacto" class="font-semibold" style="color:var(--primary)">${esc(s.navCta || 'Contáctanos')}</a></div></nav>
</header>`;
}
function navFloatingPill(s) {
  return `<div class="sticky top-4 z-50 px-4"><nav class="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between rounded-full backdrop-blur-md shadow-lg" style="background:color-mix(in srgb,var(--bg) 80%,transparent);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">${brandLink(s)}<div class="hidden md:flex items-center gap-7 text-sm font-medium">${navLinks(s)}</div>${navCtaBtn(s)}</nav></div>`;
}
function navMinimal(s) {
  return `<header class="sticky top-0 z-50 backdrop-blur-md" style="background:color-mix(in srgb,var(--bg) 85%,transparent)">
  <nav class="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between"><div class="font-extrabold text-xl tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div><div class="flex items-center gap-7 text-sm font-medium">${navLinks(s)}<a href="#contacto" class="px-4 py-2 rounded-full font-semibold" style="border:1.5px solid var(--primary);color:var(--primary)">${esc(s.navCta || 'Contacto')}</a></div></nav>
</header>`;
}
const NAV_VARIANTS = [navStandard, navCenteredLogo, navFloatingPill, navMinimal];
function nav(s) {
  const idx = Number.isInteger(s.navVariant) ? s.navVariant : variant(s.slug, 'nav', NAV_VARIANTS.length);
  return NAV_VARIANTS[idx % NAV_VARIANTS.length](s);
}

/* ── HEROES (dispatchers con sub-variantes que rotan por sector) ── */
const heroPillsRow = (s) => `<div class="reveal mt-10 flex flex-wrap items-center gap-6 text-sm opacity-70">${(s.heroPills || []).map((p) => `<span class="flex items-center gap-2"><span style="color:var(--primary)">${ICONS.check}</span>${esc(p)}</span>`).join('')}</div>`;
const heroCtasLight = (s, sec = '#servicios', l2 = 'Ver más') => `<div class="reveal mt-9 flex flex-wrap gap-4">${btn(s.cta1)}${btn(s.cta2 || l2, { outline: true, href: sec })}</div>`;
const heroImg = (s, cls) => `<img src="${s.img.hero}" alt="" class="${cls}">`;

// FULL-BLEED: texto a la izquierda
function heroFullBgLeft(s) {
  return `<section id="top" class="relative min-h-[92vh] flex items-center"><div class="absolute inset-0 overflow-hidden">${heroImg(s, 'w-full h-full object-cover scale-110').replace('<img ', '<img data-parallax ')}<div class="absolute inset-0" style="background:linear-gradient(105deg,color-mix(in srgb,var(--secondary) 88%,transparent) 0%,color-mix(in srgb,var(--secondary) 55%,transparent) 55%,transparent 100%)"></div></div>
  <div class="relative max-w-7xl mx-auto px-6 w-full"><div class="max-w-2xl text-white">${eyebrow(s.eyebrow, '#fff')}<h1 class="reveal text-5xl md:text-7xl font-black leading-[1.02] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-6 text-lg md:text-xl text-white/85 max-w-xl leading-relaxed">${esc(s.sub)}</p><div class="reveal mt-9 flex flex-wrap gap-4">${btn(s.cta1)}<a href="#servicios" class="inline-block border-2 border-white text-white px-7 py-3.5 rounded-full font-semibold transition hover:scale-[1.03]">${esc(s.cta2 || 'Conoce más')}</a></div></div></div></section>`;
}
// FULL-BLEED: texto centrado
function heroFullBgCentered(s) {
  return `<section id="top" class="relative min-h-[90vh] flex items-center text-center"><div class="absolute inset-0 overflow-hidden">${heroImg(s, 'w-full h-full object-cover scale-110').replace('<img ', '<img data-parallax ')}<div class="absolute inset-0" style="background:linear-gradient(to top,color-mix(in srgb,var(--secondary) 90%,transparent),color-mix(in srgb,var(--secondary) 50%,transparent) 60%,color-mix(in srgb,var(--secondary) 30%,transparent))"></div></div>
  <div class="relative max-w-4xl mx-auto px-6 text-white">${eyebrow(s.eyebrow, '#fff')}<h1 class="reveal text-5xl md:text-7xl font-black leading-[1.02] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">${esc(s.sub)}</p><div class="reveal mt-9 flex justify-center flex-wrap gap-4">${btn(s.cta1)}<a href="#servicios" class="inline-block border-2 border-white text-white px-7 py-3.5 rounded-full font-semibold transition hover:scale-[1.03]">${esc(s.cta2 || 'Conoce más')}</a></div></div></section>`;
}
// SPLIT: imagen a la derecha
function heroSplitRight(s) {
  return `<section id="top" class="relative overflow-hidden"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[88vh] py-20"><div>${eyebrow(s.eyebrow)}<h1 class="reveal text-5xl md:text-6xl xl:text-7xl font-black leading-[1.03] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-6 text-lg leading-relaxed opacity-75 max-w-lg">${esc(s.sub)}</p>${heroCtasLight(s, '#servicios', 'Ver servicios')}${heroPillsRow(s)}</div><div class="reveal relative"><div class="absolute -inset-4 rounded-[2rem] opacity-20" style="background:var(--accent)"></div>${heroImg(s, 'relative rounded-[2rem] shadow-2xl w-full aspect-[4/5] object-cover')}</div></div></section>`;
}
// SPLIT: imagen a la izquierda (invertido)
function heroSplitLeft(s) {
  return `<section id="top" class="relative overflow-hidden"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[88vh] py-20"><div class="reveal relative lg:order-1 order-2"><div class="absolute -inset-4 rounded-[2rem] opacity-20" style="background:var(--accent)"></div>${heroImg(s, 'relative rounded-[2rem] shadow-2xl w-full aspect-[5/4] object-cover')}</div><div class="lg:order-2 order-1">${eyebrow(s.eyebrow)}<h1 class="reveal text-5xl md:text-6xl xl:text-7xl font-black leading-[1.03] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-6 text-lg leading-relaxed opacity-75 max-w-lg">${esc(s.sub)}</p>${heroCtasLight(s, '#servicios', 'Ver servicios')}${heroPillsRow(s)}</div></div></section>`;
}
// SPLIT con métricas inline
function heroSplitStats(s) {
  const st = (s.stats || []).slice(0, 3);
  return `<section id="top" class="relative overflow-hidden"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[86vh] py-20"><div>${eyebrow(s.eyebrow)}<h1 class="reveal text-5xl md:text-6xl font-black leading-[1.04] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-6 text-lg opacity-75 max-w-lg">${esc(s.sub)}</p>${heroCtasLight(s)}<div class="reveal mt-10 grid grid-cols-3 gap-6 max-w-md">${st.map((x) => `<div><div class="text-3xl font-black" style="color:var(--primary);font-family:'${s.fonts.heading}',serif">${esc(x.n)}</div><div class="text-xs opacity-60 mt-1">${esc(x.l)}</div></div>`).join('')}</div></div><div class="reveal relative"><div class="absolute -inset-4 rounded-[2rem] opacity-20" style="background:var(--accent)"></div>${heroImg(s, 'relative rounded-[2rem] shadow-2xl w-full aspect-[4/5] object-cover')}</div></div></section>`;
}
// CENTRADO con badge (sin imagen grande — estilo SaaS)
function heroBadgeCentered(s) {
  return `<section id="top" class="relative py-28 md:py-36 text-center overflow-hidden"><div class="absolute inset-0 opacity-[0.04]" style="background-image:radial-gradient(var(--text) 1.2px,transparent 1.2px);background-size:26px 26px;mask-image:radial-gradient(ellipse at center,#000,transparent 72%)"></div><div class="relative max-w-4xl mx-auto px-6"><span class="reveal inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)"><span class="w-1.5 h-1.5 rounded-full" style="background:var(--primary)"></span>${esc(s.eyebrow)}</span><h1 class="reveal text-5xl md:text-7xl font-black leading-[1.02] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-7 text-lg md:text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">${esc(s.sub)}</p><div class="reveal mt-9 flex justify-center flex-wrap gap-4">${btn(s.cta1)}${btn(s.cta2 || 'Ver más', { outline: true, href: '#servicios' })}</div></div></section>`;
}
// MINIMAL con imagen ancha abajo
function heroMinimalImg(s) {
  return `<section id="top" class="pt-24 pb-0 text-center"><div class="max-w-4xl mx-auto px-6">${eyebrow(s.eyebrow)}<h1 class="reveal text-5xl md:text-7xl xl:text-8xl font-black leading-[0.98] tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.h1)}</h1><p class="reveal mt-7 text-lg md:text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">${esc(s.sub)}</p><div class="reveal mt-9 flex justify-center gap-4">${btn(s.cta1)}${btn(s.cta2 || 'Portafolio', { outline: true, href: '#galeria' })}</div></div><div class="reveal mt-16 max-w-6xl mx-auto px-6">${heroImg(s, 'w-full aspect-[16/8] object-cover rounded-[2rem] shadow-2xl')}</div></section>`;
}

const HERO_VARIANTS = {
  heroFullBg: [heroFullBgLeft, heroFullBgCentered],
  heroSplit: [heroSplitRight, heroSplitLeft, heroSplitStats, heroBadgeCentered],
  heroMinimal: [heroMinimalImg, heroBadgeCentered],
};
const heroDispatch = (kind) => (s) => {
  const pool = HERO_VARIANTS[kind];
  return pool[variant(s.slug, 'hero', pool.length)](s);
};
const heroFullBg = heroDispatch('heroFullBg');
const heroSplit = heroDispatch('heroSplit');
const heroMinimal = heroDispatch('heroMinimal');

/* ── STATS (2 variantes + dispatcher) ────────────────────────── */
function statsColored(s) {
  const items = s.stats || [];
  return `<section class="py-16" style="background:color-mix(in srgb,var(--primary) 6%,var(--bg))">
  <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    ${items.map((st) => `<div class="reveal"><div data-count="${esc(st.n)}" class="text-4xl md:text-5xl font-black" style="color:var(--primary);font-family:'${s.fonts.heading}',serif">${esc(st.n)}</div><div class="mt-2 text-sm opacity-65">${esc(st.l)}</div></div>`).join('')}
  </div>
</section>`;
}

function statsDivider(s) {
  const items = s.stats || [];
  return `<section class="py-14"><div class="max-w-6xl mx-auto px-6">
  <div class="grid grid-cols-2 md:grid-cols-4 rounded-3xl overflow-hidden" style="border:1px solid color-mix(in srgb,var(--text) 12%,transparent)">
    ${items.map((st, i) => `<div class="reveal p-8 text-center" style="border-left:${i % 4 === 0 ? '0' : '1px'} solid color-mix(in srgb,var(--text) 10%,transparent);border-top:${i >= 2 ? '1px' : '0'} solid color-mix(in srgb,var(--text) 10%,transparent)">
      <div data-count="${esc(st.n)}" class="text-4xl md:text-5xl font-black tracking-tight" style="color:var(--primary);font-family:'${s.fonts.heading}',serif">${esc(st.n)}</div>
      <div class="mt-2 text-xs opacity-55 uppercase tracking-wide">${esc(st.l)}</div></div>`).join('')}
  </div>
</div></section>`;
}

const STATS_VARIANTS = [statsColored, statsDivider];
function stats(s) {
  return STATS_VARIANTS[variant(s.slug, 'stats', STATS_VARIANTS.length)](s);
}

/* ── SERVICIOS / FEATURES (grid de cards) ────────────────────── */
function servicesHead(s) {
  return `<div class="max-w-2xl mb-12">${eyebrow(s.servicesEyebrow || 'Lo que hacemos')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.servicesTitle)}</h2>
      ${s.servicesSub ? `<p class="reveal mt-4 text-lg opacity-70">${esc(s.servicesSub)}</p>` : ''}
    </div>`;
}
function servicesCards(s) {
  return `<section id="servicios" class="py-24 md:py-32">
  <div class="max-w-7xl mx-auto px-6">
    ${servicesHead(s)}
    <div class="grid md:grid-cols-3 gap-6">
      ${(s.services || []).map((sv) => `<div class="reveal tilt group p-8 rounded-3xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white" style="background:var(--primary)">${ICONS.check}</div>
        <h3 class="text-xl font-bold mb-2">${esc(sv.t)}</h3>
        <p class="opacity-70 leading-relaxed text-[15px]">${esc(sv.d)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}
// 21st-derived: bento con textura de cuadrícula + glow (Ali-Hussein/card-with-grid-pattern, 0xUrvish/bento-card)
function servicesBento(s) {
  const list = s.services || [];
  return `<section id="servicios" class="py-24 md:py-32">
  <div class="max-w-7xl mx-auto px-6">
    ${servicesHead(s)}
    <div class="grid md:grid-cols-3 gap-4">
      ${list.map((sv, i) => {
        const big = i === 0;
        return `<div class="reveal tilt relative overflow-hidden rounded-3xl p-7 ${big ? 'md:col-span-2' : ''}" style="background:color-mix(in srgb,var(--primary) ${big ? 9 : 5}%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <div class="absolute inset-0" style="${patternStyle(s)}"></div>
        <div class="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-20" style="background:var(--primary)"></div>
        <div class="relative">
          <div class="w-11 h-11 rounded-2xl grid place-items-center mb-4 text-white" style="background:var(--primary)">${ICONS.check}</div>
          <h3 class="text-xl font-bold mb-2">${esc(sv.t)}</h3>
          <p class="opacity-70 text-[15px] leading-relaxed ${big ? 'max-w-md' : ''}">${esc(sv.d)}</p>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
</section>`;
}
const SERVICES_VARIANTS = [servicesCards, servicesBento];
function servicesGrid(s) {
  return SERVICES_VARIANTS[variant(s.slug, 'svc', SERVICES_VARIANTS.length)](s);
}

/* ── FEATURE SPLIT (imagen + texto alternado) ────────────────── */
function featureSplit(s, opts = {}) {
  const reverse = opts.reverse;
  return `<section id="nosotros" class="py-24 md:py-28">
  <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
    <div class="reveal ${reverse ? 'lg:order-2' : ''}">
      <img src="${opts.img || s.img.about}" alt="" class="w-full aspect-[5/4] object-cover rounded-[2rem] shadow-xl">
    </div>
    <div class="${reverse ? 'lg:order-1' : ''}">
      ${eyebrow(opts.eyebrow || 'Nosotros')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight leading-tight" style="font-family:'${s.fonts.heading}',serif">${esc(opts.title || s.aboutTitle)}</h2>
      <p class="reveal mt-5 text-lg opacity-75 leading-relaxed">${esc(opts.body || s.aboutBody)}</p>
      <ul class="reveal mt-7 space-y-3">
        ${(opts.bullets || s.aboutBullets || []).map((b) => `<li class="flex gap-3"><span style="color:var(--primary)">${ICONS.check}</span><span class="opacity-80">${esc(b)}</span></li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;
}

/* ── PROCESO (pasos numerados) ───────────────────────────────── */
function process(s) {
  return `<section id="proceso" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))">
  <div class="max-w-7xl mx-auto px-6">
    <div class="max-w-2xl mb-14">${eyebrow('Cómo trabajamos')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.processTitle || 'Nuestro proceso')}</h2></div>
    <div class="grid md:grid-cols-4 gap-8">
      ${(s.process || []).map((p, i) => `<div class="reveal">
        <div class="text-6xl font-black opacity-15" style="font-family:'${s.fonts.heading}',serif">0${i + 1}</div>
        <h3 class="text-xl font-bold mt-2 mb-2">${esc(p.t)}</h3>
        <p class="opacity-70 text-[15px] leading-relaxed">${esc(p.d)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ── GALERÍA (grid de imágenes) ──────────────────────────────── */
/* ── GALERÍA (5 estilos + dispatcher) ────────────────────────── */
const galleryHead = (s) => `<div class="max-w-2xl mb-12">${eyebrow(s.galleryEyebrow || 'Galería')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.galleryTitle || 'Nuestro trabajo')}</h2></div>`;

function galleryMasonryGrid(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">${imgs.map((src, i) => `<div class="reveal overflow-hidden rounded-2xl ${i % 5 === 0 ? 'row-span-2' : ''}"><img src="${src}" alt="" class="w-full h-full object-cover hover:scale-105 transition duration-700 ${i % 5 === 0 ? 'aspect-[3/4]' : 'aspect-square'}"></div>`).join('')}</div>
  </div></section>`;
}
function galleryUniform(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 4%,var(--bg))"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}
    <div class="grid grid-cols-2 md:grid-cols-3 gap-5">${imgs.map((src) => `<div class="reveal group relative overflow-hidden rounded-3xl aspect-[4/3]"><img src="${src}" alt="" class="w-full h-full object-cover group-hover:scale-110 transition duration-700"><div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style="background:linear-gradient(to top,color-mix(in srgb,var(--secondary) 65%,transparent),transparent)"></div></div>`).join('')}</div>
  </div></section>`;
}
function galleryColumns(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}
    <div class="columns-2 md:columns-3 gap-4 [&>div]:mb-4">${imgs.map((src, i) => `<div class="reveal overflow-hidden rounded-2xl break-inside-avoid"><img src="${src}" alt="" class="w-full object-cover hover:scale-105 transition duration-700" style="aspect-ratio:${i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/3'}"></div>`).join('')}</div>
  </div></section>`;
}
function galleryCarousel(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}</div>
    <div class="flex gap-4 overflow-x-auto px-6 pb-4" style="scroll-snap-type:x mandatory;-webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)">${imgs.map((src) => `<div class="reveal shrink-0 w-[280px] md:w-[400px] overflow-hidden rounded-2xl" style="scroll-snap-align:start"><img src="${src}" alt="" class="w-full aspect-[4/3] object-cover hover:scale-105 transition duration-700"></div>`).join('')}</div>
  </section>`;
}
function galleryBentoBig(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg))"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}
    <div class="grid grid-cols-2 md:grid-cols-4 auto-rows-[170px] gap-4">${imgs.map((src, i) => `<div class="reveal overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2' : ''}"><img src="${src}" alt="" class="w-full h-full object-cover hover:scale-105 transition duration-700"></div>`).join('')}</div>
  </div></section>`;
}
function galleryPolaroid(s) {
  const imgs = s.img.gallery || [];
  return `<section id="galeria" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 4%,var(--bg))"><div class="max-w-7xl mx-auto px-6">${galleryHead(s)}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">${imgs.map((src, i) => `<div class="reveal bg-white p-2.5 pb-6 rounded-md shadow-xl ${i % 2 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition duration-300"><img src="${src}" alt="" class="w-full aspect-square object-cover rounded-sm"></div>`).join('')}</div>
  </div></section>`;
}
const GALLERY_VARIANTS = [galleryMasonryGrid, galleryUniform, galleryColumns, galleryCarousel, galleryBentoBig, galleryPolaroid];
function gallery(s) {
  return GALLERY_VARIANTS[variant(s.slug, 'gallery', GALLERY_VARIANTS.length)](s);
}

/* ── MENÚ / LISTA DE PRODUCTOS CON PRECIOS ───────────────────── */
function menu(s) {
  return `<section id="menu" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 6%,var(--bg))">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-14">${eyebrow(s.menuEyebrow || 'Carta', 'var(--accent)')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.menuTitle)}</h2></div>
    <div class="grid md:grid-cols-2 gap-x-14 gap-y-2">
      ${(s.menu || []).map((m) => `<div class="reveal flex items-baseline gap-3 py-4" style="border-bottom:1px dashed color-mix(in srgb,var(--text) 18%,transparent)">
        <div class="flex-1"><h4 class="font-bold text-lg">${esc(m.t)}</h4><p class="opacity-60 text-sm">${esc(m.d)}</p></div>
        <div class="font-black text-lg whitespace-nowrap" style="color:var(--primary)">${esc(m.p)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ── PROPIEDADES / CATÁLOGO (cards con imagen + precio) ───────── */
function cards(s) {
  return `<section id="catalogo" class="py-24 md:py-28">
  <div class="max-w-7xl mx-auto px-6">
    <div class="max-w-2xl mb-12">${eyebrow(s.cardsEyebrow || 'Catálogo')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.cardsTitle)}</h2></div>
    <div class="grid md:grid-cols-3 gap-7">
      ${(s.cards || []).map((c, i) => `<div class="reveal tilt group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <div class="overflow-hidden aspect-[4/3]"><img src="${(s.img.cards || [])[i] || s.img.hero}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-700"></div>
        <div class="p-6">
          ${c.tag ? `<span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary)">${esc(c.tag)}</span>` : ''}
          <h3 class="text-xl font-bold mt-3">${esc(c.t)}</h3>
          <p class="opacity-65 text-sm mt-1.5 leading-relaxed">${esc(c.d)}</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-black text-xl" style="color:var(--primary)">${esc(c.p)}</span>
            <a href="#contacto" class="text-sm font-semibold flex items-center gap-1" style="color:var(--primary)">${esc(s.cardsCta || 'Ver más')} ${ICONS.arrow}</a>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ── PRICING (planes) ────────────────────────────────────────── */
function pricingTiers(s) {
  return `<section id="planes" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-14">${eyebrow('Planes')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.pricingTitle || 'Elige tu plan')}</h2></div>
    <div class="grid md:grid-cols-3 gap-6 items-stretch">
      ${(s.pricing || []).map((p) => `<div class="reveal p-8 rounded-3xl flex flex-col ${p.featured ? 'scale-[1.04] shadow-2xl text-white' : 'shadow-lg'}" style="${p.featured ? 'background:var(--primary)' : 'background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)'}">
        <h3 class="text-lg font-bold ${p.featured ? 'text-white' : ''}">${esc(p.name)}</h3>
        <div class="mt-3 mb-1"><span class="text-4xl font-black" style="font-family:'${s.fonts.heading}',serif">${esc(p.price)}</span><span class="opacity-60 text-sm">${esc(p.per || '/mes')}</span></div>
        <ul class="mt-6 space-y-3 flex-1">${(p.feats || []).map((f) => `<li class="flex gap-2.5 text-[15px] ${p.featured ? 'text-white/90' : 'opacity-75'}">${ICONS.check}<span>${esc(f)}</span></li>`).join('')}</ul>
        <a href="#contacto" class="mt-7 text-center py-3 rounded-full font-semibold ${p.featured ? 'bg-white' : 'text-white'}" style="${p.featured ? 'color:var(--primary)' : 'background:var(--primary)'}">${esc(p.cta || 'Empezar')}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}
// 21st-derived: pricing glassmorphism sobre fondo oscuro (easemize/animated-glassy-pricing, vaib215/dark-gradient-pricing)
function pricingGlass(s) {
  return `<section id="planes" class="py-24 md:py-28" style="background:linear-gradient(180deg,var(--secondary),color-mix(in srgb,var(--secondary) 68%,#000));color:#fff">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-14">${eyebrow('Planes', 'var(--accent)')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight text-white" style="font-family:'${s.fonts.heading}',serif">${esc(s.pricingTitle || 'Elige tu plan')}</h2></div>
    <div class="grid md:grid-cols-3 gap-5 items-stretch">
      ${(s.pricing || []).map((p) => `<div class="reveal p-7 rounded-3xl flex flex-col backdrop-blur ${p.featured ? 'scale-[1.04] shadow-2xl' : ''}" style="background:${p.featured ? 'color-mix(in srgb,var(--primary) 82%,transparent)' : 'rgba(255,255,255,.06)'};border:1px solid rgba(255,255,255,.14)">
        ${p.featured ? `<span class="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3" style="background:var(--accent);color:var(--secondary)">Más popular</span>` : ''}
        <h3 class="text-lg font-bold text-white">${esc(p.name)}</h3>
        <div class="mt-2 mb-1"><span class="text-4xl font-black text-white" style="font-family:'${s.fonts.heading}',serif">${esc(p.price)}</span><span class="text-white/55 text-sm">${esc(p.per || '/mes')}</span></div>
        <ul class="mt-5 space-y-2.5 flex-1">${(p.feats || []).map((f) => `<li class="flex gap-2.5 text-[15px] text-white/85">${ICONS.check}<span>${esc(f)}</span></li>`).join('')}</ul>
        <a href="#contacto" class="mt-6 text-center py-3 rounded-full font-semibold ${p.featured ? 'bg-white' : ''}" style="${p.featured ? 'color:var(--primary)' : 'background:rgba(255,255,255,.12);color:#fff'}">${esc(p.cta || 'Empezar')}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}
const PRICING_VARIANTS = [pricingTiers, pricingGlass];
function pricing(s) {
  return PRICING_VARIANTS[variant(s.slug, 'price', PRICING_VARIANTS.length)](s);
}

/* ── EQUIPO ──────────────────────────────────────────────────── */
function team(s) {
  return `<section id="equipo" class="py-24 md:py-28">
  <div class="max-w-7xl mx-auto px-6">
    <div class="max-w-2xl mb-14">${eyebrow('Equipo')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.teamTitle || 'Quiénes te atienden')}</h2></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      ${(s.team || []).map((t, i) => `<div class="reveal text-center">
        <div class="aspect-square rounded-2xl overflow-hidden mb-4"><img src="${(s.img.team || [])[i] || s.img.about}" alt="" class="w-full h-full object-cover"></div>
        <h4 class="font-bold">${esc(t.n)}</h4><p class="text-sm opacity-60">${esc(t.r)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ── TESTIMONIOS (3 variantes + dispatcher) ──────────────────── */
const _initial = (n = '') => esc((n.trim()[0] || '·').toUpperCase());

function testimonialsCards(s) {
  return `<section class="py-24 md:py-28" style="background:color-mix(in srgb,var(--primary) 6%,var(--bg))">
  <div class="max-w-6xl mx-auto px-6">
    <div class="max-w-2xl mb-12">${eyebrow('Testimonios')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.testiTitle || 'Lo que dicen de nosotros')}</h2></div>
    <div class="grid md:grid-cols-3 gap-6">
      ${(s.testimonials || []).map((t) => `<div class="reveal p-7 rounded-3xl" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <div class="flex gap-1 mb-4" style="color:var(--accent)">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
        <p class="opacity-80 leading-relaxed italic">"${esc(t.q)}"</p>
        <div class="mt-5 flex items-center gap-3"><span class="w-10 h-10 rounded-full grid place-items-center font-bold text-white shrink-0" style="background:var(--primary)">${_initial(t.n)}</span><span><span class="font-bold block">${esc(t.n)}</span><span class="text-sm opacity-55">${esc(t.r)}</span></span></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function testimonialsMarquee(s) {
  const row = (s.testimonials || []);
  const card = (t) => `<figure class="w-[330px] shrink-0 rounded-2xl p-6 mx-2.5" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
    <div class="flex gap-1 mb-3" style="color:var(--accent)">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
    <blockquote class="opacity-80 leading-relaxed">"${esc(t.q)}"</blockquote>
    <figcaption class="mt-4 flex items-center gap-3"><span class="w-9 h-9 rounded-full grid place-items-center font-bold text-white" style="background:var(--primary)">${_initial(t.n)}</span><span><b>${esc(t.n)}</b><br><span class="text-sm opacity-55">${esc(t.r)}</span></span></figcaption>
  </figure>`;
  const loop = [...row, ...row, ...row].map(card).join('');
  return `<section class="py-24 md:py-28 overflow-hidden" style="background:color-mix(in srgb,var(--primary) 6%,var(--bg))">
  <div class="max-w-6xl mx-auto px-6 text-center mb-12">${eyebrow('Testimonios', 'var(--accent)')}
    <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.testiTitle || 'Lo que dicen de nosotros')}</h2></div>
  <div class="relative" style="-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)">
    <div class="flex w-max" style="animation:plia-marq 40s linear infinite">${loop}</div>
  </div>
  <style>@keyframes plia-marq{to{transform:translateX(-33.33%)}}</style>
</section>`;
}

function testimonialsSingle(s) {
  const t = (s.testimonials || [])[0] || { q: '', n: '', r: '' };
  return `<section class="py-24 md:py-32" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))">
  <div class="max-w-4xl mx-auto px-6 text-center">
    ${eyebrow('Testimonios')}
    <div class="reveal text-7xl font-black leading-none mb-2" style="color:var(--primary);opacity:.18;font-family:'${s.fonts.heading}',serif">"</div>
    <blockquote class="reveal text-2xl md:text-4xl font-light leading-snug tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(t.q)}</blockquote>
    <div class="reveal mt-8 flex items-center justify-center gap-3"><span class="w-12 h-12 rounded-full grid place-items-center font-bold text-white" style="background:var(--primary)">${_initial(t.n)}</span><span class="text-left"><span class="font-bold block">${esc(t.n)}</span><span class="text-sm opacity-55">${esc(t.r)}</span></span></div>
  </div>
</section>`;
}

const TESTI_VARIANTS = [testimonialsCards, testimonialsMarquee, testimonialsSingle];
function testimonials(s) {
  // single sólo si hay testimonios; marquee necesita varios.
  const list = s.testimonials || [];
  let idx = variant(s.slug, 'testi', TESTI_VARIANTS.length);
  if (TESTI_VARIANTS[idx] === testimonialsMarquee && list.length < 3) idx = 0;
  return TESTI_VARIANTS[idx](s);
}

/* ── FAQ ─────────────────────────────────────────────────────── */
function faq(s) {
  return `<section class="py-24 md:py-28">
  <div class="max-w-3xl mx-auto px-6">
    <div class="mb-12 text-center">${eyebrow('Preguntas frecuentes')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.faqTitle || 'Resolvemos tus dudas')}</h2></div>
    <div class="space-y-3">
      ${(s.faq || []).map((f) => `<details class="reveal group p-6 rounded-2xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <summary class="font-bold cursor-pointer list-none flex justify-between items-center">${esc(f.q)}<span class="group-open:rotate-45 transition text-2xl" style="color:var(--primary)">+</span></summary>
        <p class="mt-3 opacity-70 leading-relaxed">${esc(f.a)}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`;
}

/* ── CTA BANNER (2 variantes + dispatcher) ───────────────────── */
function ctaSolid(s) {
  return `<section class="py-20">
  <div class="max-w-6xl mx-auto px-6">
    <div class="reveal relative overflow-hidden rounded-[2.5rem] px-8 py-16 md:py-20 text-center text-white" style="background:var(--primary)">
      <div class="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-20" style="background:var(--accent)"></div>
      <h2 class="relative text-3xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.ctaTitle || '¿Listo para empezar?')}</h2>
      <p class="relative mt-4 text-white/85 max-w-xl mx-auto text-lg">${esc(s.ctaSub || 'Conversemos hoy mismo.')}</p>
      <div class="relative mt-8 flex justify-center gap-4">
        <a href="${s.whatsappHref}" class="inline-flex items-center gap-2 bg-white px-7 py-3.5 rounded-full font-semibold" style="color:var(--primary)">${ICONS.wa} Escríbenos por WhatsApp</a>
      </div>
    </div>
  </div>
</section>`;
}
// 21st-derived: CTA con gradiente diagonal + orbes difuminados (Codehagen/hero, shadcnblocks/pricing-6)
function ctaGradient(s) {
  return `<section class="py-20"><div class="max-w-6xl mx-auto px-6">
    <div class="reveal relative overflow-hidden rounded-[2.5rem] px-8 py-16 md:py-20 text-center" style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 55%,var(--secondary)))">
      <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full blur-3xl opacity-30" style="background:var(--accent)"></div>
      <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-3xl opacity-20" style="background:#fff"></div>
      <h2 class="relative text-3xl md:text-5xl font-black tracking-tight text-white" style="font-family:'${s.fonts.heading}',serif">${esc(s.ctaTitle || '¿Listo para empezar?')}</h2>
      <p class="relative mt-4 text-white/85 max-w-xl mx-auto text-lg">${esc(s.ctaSub || 'Conversemos hoy mismo.')}</p>
      <div class="relative mt-8 flex justify-center"><a href="${s.whatsappHref}" class="inline-flex items-center gap-2 bg-white px-7 py-3.5 rounded-full font-semibold" style="color:var(--primary)">${ICONS.wa} Escríbenos por WhatsApp</a></div>
    </div>
  </div></section>`;
}
const CTA_VARIANTS = [ctaSolid, ctaGradient];
function ctaBanner(s) {
  return CTA_VARIANTS[variant(s.slug, 'cta', CTA_VARIANTS.length)](s);
}

/* ── CONTACTO ────────────────────────────────────────────────── */
function contact(s) {
  return `<section id="contacto" class="py-24 md:py-28" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))">
  <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14">
    <div>
      ${eyebrow('Contacto')}
      <h2 class="reveal text-4xl md:text-5xl font-black tracking-tight" style="font-family:'${s.fonts.heading}',serif">${esc(s.contactTitle || 'Hablemos')}</h2>
      <p class="reveal mt-4 opacity-70 text-lg">${esc(s.contactSub || 'Estamos para ayudarte. Escríbenos y te respondemos rápido.')}</p>
      <div class="reveal mt-8 space-y-4">
        <div class="flex items-center gap-3"><span style="color:var(--primary)">${ICONS.phone}</span><span>${esc(s.phone)}</span></div>
        <div class="flex items-center gap-3"><span style="color:var(--primary)">${ICONS.pin}</span><span>${esc(s.address)}</span></div>
        <div class="flex items-center gap-3"><span style="color:var(--primary)">${ICONS.clock}</span><span>${esc(s.hours)}</span></div>
      </div>
    </div>
    <form data-plia-contact action="#" class="reveal p-8 rounded-3xl space-y-4" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)">
      <div class="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Nombre" class="w-full px-4 py-3 rounded-xl outline-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)">
        <input required placeholder="Teléfono" class="w-full px-4 py-3 rounded-xl outline-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)">
      </div>
      <input type="email" placeholder="Correo" class="w-full px-4 py-3 rounded-xl outline-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)">
      <textarea rows="4" placeholder="¿En qué te ayudamos?" class="w-full px-4 py-3 rounded-xl outline-none resize-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)"></textarea>
      <button type="submit" class="w-full py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">${esc(s.contactCta || 'Enviar mensaje')}</button>
      <p data-plia-msg style="display:none" class="text-sm text-center"></p>
    </form>
  </div>
</section>`;
}

/* ── FOOTERS (5 variantes + dispatcher) ──────────────────────── */
const _year = new Date().getFullYear();
const _credit = `<span>Hecho por <a href="https://plia.pe" style="color:#fff;font-weight:600">plia.pe</a></span>`;
const _email = (s) => esc(s.email || 'hola@' + s.slug + '.pe');
const _socialDots = `<div class="flex gap-3">${['IG', 'FB', 'WA'].map((l) => `<span class="w-9 h-9 rounded-full grid place-items-center text-xs font-bold" style="background:rgba(255,255,255,.1)">${l}</span>`).join('')}</div>`;

function footerCorporate(s) {
  return `<footer class="pt-16 pb-8" style="background:var(--secondary);color:#fff">
  <div class="max-w-7xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-10 pb-12" style="border-bottom:1px solid rgba(255,255,255,.12)">
      <div class="md:col-span-2"><div class="font-extrabold text-2xl mb-3" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div><p class="text-white/60 max-w-sm leading-relaxed">${esc(s.footerAbout || s.sub)}</p></div>
      <div><h4 class="font-bold mb-4">Contacto</h4><ul class="space-y-2 text-white/60 text-sm"><li>${esc(s.phone)}</li><li>${_email(s)}</li><li>${esc(s.address)}</li></ul></div>
      <div><h4 class="font-bold mb-4">Síguenos</h4><ul class="space-y-2 text-white/60 text-sm"><li>Instagram</li><li>Facebook</li><li>WhatsApp</li></ul></div>
    </div>
    <div class="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-white/50 text-sm"><span>© ${_year} ${esc(s.brand)}. Todos los derechos reservados.</span>${_credit}</div>
  </div>
</footer>`;
}

function footerLargeName(s) {
  return `<footer class="pt-16 pb-6 overflow-hidden" style="background:var(--secondary);color:#fff">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
      <div class="max-w-sm"><p class="text-white/60 leading-relaxed">${esc(s.footerAbout || s.sub)}</p><div class="mt-4 text-white/70 text-sm">${esc(s.phone)} · ${_email(s)}</div></div>
      <div class="flex items-center gap-6 text-sm text-white/70">${(s.nav || []).slice(1).map((l) => `<a href="#" class="hover:text-white transition">${esc(l)}</a>`).join('')}</div>
    </div>
    <div class="font-black leading-none tracking-tight select-none" style="font-family:'${s.fonts.heading}',serif;font-size:clamp(3.2rem,15vw,11rem);background:linear-gradient(180deg,#fff,color-mix(in srgb,var(--accent) 70%,transparent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;opacity:.92">${esc(s.brand)}</div>
    <div class="mt-4 pt-5 flex flex-col md:flex-row justify-between items-center gap-3 text-white/45 text-sm" style="border-top:1px solid rgba(255,255,255,.12)"><span>© ${_year} ${esc(s.brand)}.</span>${_credit}</div>
  </div>
</footer>`;
}

function footerGradient(s) {
  return `<footer class="py-16 text-center text-white" style="background:linear-gradient(180deg,var(--secondary),color-mix(in srgb,var(--secondary) 60%,#000))">
  <div class="max-w-3xl mx-auto px-6">
    <div class="font-extrabold text-3xl mb-3" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div>
    <p class="text-white/65 max-w-md mx-auto leading-relaxed">${esc(s.footerAbout || s.sub)}</p>
    <div class="mt-6 flex justify-center gap-3">${['IG', 'FB', 'WA'].map((l) => `<span class="w-11 h-11 rounded-full grid place-items-center font-bold hover:scale-110 transition" style="background:rgba(255,255,255,.12)">${l}</span>`).join('')}</div>
    <div class="mt-6 text-white/60 text-sm">${esc(s.phone)} · ${esc(s.address)}</div>
    <div class="mt-6 pt-6 flex flex-col sm:flex-row justify-center items-center gap-2 text-white/45 text-sm" style="border-top:1px solid rgba(255,255,255,.1)"><span>© ${_year} ${esc(s.brand)}.</span><span class="hidden sm:inline">·</span>${_credit}</div>
  </div>
</footer>`;
}

function footerMinimal(s) {
  return `<footer class="py-12" style="background:var(--secondary);color:#fff">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="font-extrabold text-xl" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div>
      <div class="flex items-center gap-6 text-sm text-white/65">${(s.nav || []).slice(1).map((l) => `<a href="#" class="hover:text-white transition">${esc(l)}</a>`).join('')}</div>
      ${_socialDots}
    </div>
    <div class="mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-white/40 text-xs" style="border-top:1px solid rgba(255,255,255,.1)"><span>© ${_year} ${esc(s.brand)} · ${esc(s.phone)}</span>${_credit}</div>
  </div>
</footer>`;
}

function footerBento(s) {
  const card = 'rounded-2xl p-6';
  const cbg = 'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)';
  return `<footer class="py-12" style="background:var(--secondary);color:#fff">
  <div class="max-w-7xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-3">
      <div class="md:col-span-2 ${card}" style="${cbg}"><div class="font-extrabold text-2xl mb-2" style="font-family:'${s.fonts.heading}',serif">${esc(s.brand)}</div><p class="text-white/60 leading-relaxed">${esc(s.footerAbout || s.sub)}</p></div>
      <div class="${card}" style="${cbg}"><h4 class="font-bold mb-3 text-sm">Contacto</h4><ul class="space-y-1.5 text-white/60 text-sm"><li>${esc(s.phone)}</li><li>${_email(s)}</li></ul></div>
      <div class="${card} flex flex-col justify-between" style="${cbg}"><h4 class="font-bold mb-3 text-sm">Síguenos</h4>${_socialDots}</div>
    </div>
    <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-white/40 text-sm"><span>© ${_year} ${esc(s.brand)}.</span>${_credit}</div>
  </div>
</footer>`;
}

const FOOTER_VARIANTS = [footerCorporate, footerLargeName, footerGradient, footerMinimal, footerBento];
function footer(s) {
  // El sector puede forzar una variante con s.footerVariant; si no, rota por slug.
  const idx = Number.isInteger(s.footerVariant) ? s.footerVariant : variant(s.slug, 'footer', FOOTER_VARIANTS.length);
  return FOOTER_VARIANTS[idx % FOOTER_VARIANTS.length](s);
}

module.exports = {
  nav, heroFullBg, heroSplit, heroMinimal, stats, servicesGrid, featureSplit,
  process, gallery, menu, cards, pricing, team, testimonials, faq, ctaBanner,
  contact, footer, esc,
};
