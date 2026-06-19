/**
 * SNIPPETS DE REFERENCIA 21st — Plia Design Library
 * ─────────────────────────────────────────────────
 * A diferencia de los arquetipos (descripciones de texto), estos son TROZOS DE
 * CÓDIGO HTML+Tailwind REALES, destilados de los componentes que importamos de
 * 21st.dev (backend/design-library-source/). El generador inyecta 1-2 como
 * EJEMPLO CONCRETO para que Claude tenga patrones premium ricos que adaptar
 * (no reinventar desde cero). Usan las variables del design system
 * (--primary/--secondary/--accent/--bg/--text) para encajar con cualquier paleta.
 *
 * Cada snippet declara su `type` (sección) y `vibes` (rubros donde encaja).
 */

export interface Snippet21st {
  id: string;
  /** Inspiración: componente(s) de 21st de donde se destiló el patrón. */
  source: string;
  type: 'nav' | 'hero' | 'feature' | 'bento' | 'testimonial' | 'pricing' | 'cta' | 'stats' | 'gallery' | 'faq' | 'logos' | 'footer' | 'about' | 'team' | 'process' | 'services' | 'contact' | 'menu' | 'banner' | 'blog';
  vibes: string[]; // palabras clave de rubro/vibe
  html: string;
}

export const SNIPPETS_21ST: Snippet21st[] = [
  {
    id: 'bento-feature-pattern',
    source: 'Ali-Hussein-dev/card-with-grid-pattern, 0xUrvish/bento-card',
    type: 'bento',
    vibes: ['tech', 'software', 'saas', 'servicio', 'corporat', 'agencia', 'b2b'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6">
  <div class="grid md:grid-cols-3 gap-4">
    <div class="md:col-span-2 relative overflow-hidden rounded-3xl p-8 md:p-10 min-h-[260px] flex flex-col justify-end" style="background:color-mix(in srgb,var(--primary) 10%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
      <div class="absolute inset-0 opacity-[0.07]" style="background-image:linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px);background-size:22px 22px"></div>
      <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20" style="background:var(--primary)"></div>
      <h3 class="relative text-2xl md:text-3xl font-black tracking-tight">Título de la ventaja principal</h3>
      <p class="relative mt-3 opacity-70 max-w-md">Descripción del beneficio clave, en una o dos frases potentes.</p>
    </div>
    <div class="relative overflow-hidden rounded-3xl p-8" style="background:var(--secondary);color:#fff">
      <div class="absolute -left-10 -bottom-10 w-44 h-44 rounded-full blur-2xl opacity-30" style="background:var(--accent)"></div>
      <div class="relative text-4xl font-black" style="color:var(--accent)">+98%</div>
      <p class="relative mt-2 text-white/70">Métrica de impacto que genera confianza.</p>
    </div>
  </div>
</div></section>`,
  },
  {
    id: 'glass-pricing-toggle',
    source: 'easemize/animated-glassy-pricing, vaib215/dark-gradient-pricing',
    type: 'pricing',
    vibes: ['saas', 'tech', 'membres', 'suscrip', 'gimnasio', 'fitness', 'premium', 'software'],
    html: `<section class="py-24" style="background:color-mix(in srgb,var(--secondary) 6%,var(--bg))"><div class="max-w-5xl mx-auto px-6">
  <div class="grid md:grid-cols-3 gap-5 items-stretch">
    <div class="rounded-3xl p-7 backdrop-blur" style="background:color-mix(in srgb,var(--bg) 70%,transparent);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)">
      <h3 class="font-bold">Básico</h3><div class="mt-3 text-4xl font-black">S/ 99<span class="text-sm opacity-50 font-normal">/mes</span></div>
      <ul class="mt-5 space-y-2 text-sm opacity-75"><li>✓ Lo esencial incluido</li><li>✓ Soporte por correo</li></ul>
      <a href="#contacto" class="mt-6 block text-center py-3 rounded-full font-semibold" style="border:1.5px solid var(--primary);color:var(--primary)">Empezar</a>
    </div>
    <div class="relative rounded-3xl p-7 text-white shadow-2xl scale-[1.04]" style="background:var(--primary)">
      <span class="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full" style="background:var(--accent);color:var(--secondary)">Popular</span>
      <h3 class="font-bold">Pro</h3><div class="mt-3 text-4xl font-black">S/ 199<span class="text-sm opacity-70 font-normal">/mes</span></div>
      <ul class="mt-5 space-y-2 text-sm text-white/90"><li>✓ Todo lo del Básico</li><li>✓ Prioridad y extras</li><li>✓ Soporte dedicado</li></ul>
      <a href="#contacto" class="mt-6 block text-center py-3 rounded-full font-semibold bg-white" style="color:var(--primary)">Elegir Pro</a>
    </div>
    <div class="rounded-3xl p-7 backdrop-blur" style="background:color-mix(in srgb,var(--bg) 70%,transparent);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)">
      <h3 class="font-bold">Premium</h3><div class="mt-3 text-4xl font-black">S/ 349<span class="text-sm opacity-50 font-normal">/mes</span></div>
      <ul class="mt-5 space-y-2 text-sm opacity-75"><li>✓ Todo lo del Pro</li><li>✓ Atención VIP</li></ul>
      <a href="#contacto" class="mt-6 block text-center py-3 rounded-full font-semibold" style="border:1.5px solid var(--primary);color:var(--primary)">Empezar</a>
    </div>
  </div>
</div></section>`,
  },
  {
    id: 'testimonial-marquee',
    source: 'efferd/testimonials-columns-1, vaib215/stagger-testimonials',
    type: 'testimonial',
    vibes: ['restaur', 'tienda', 'salud', 'tech', 'servicio', 'comercio', 'fitness'],
    html: `<section class="py-24 overflow-hidden" style="background:color-mix(in srgb,var(--primary) 5%,var(--bg))"><div class="max-w-7xl mx-auto px-6 mb-10">
  <h2 class="text-3xl md:text-4xl font-black tracking-tight text-center">Lo que dicen de nosotros</h2></div>
  <div class="relative">
    <div class="flex gap-5 w-max animate-[marquee_38s_linear_infinite]">
      <!-- repetir 6-8 cards; duplicar el set para loop continuo -->
      <figure class="w-[340px] shrink-0 rounded-2xl p-6" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
        <div class="flex gap-1 mb-3" style="color:var(--accent)">★★★★★</div>
        <blockquote class="opacity-80 leading-relaxed">"Testimonio real y específico del cliente, con su resultado concreto."</blockquote>
        <figcaption class="mt-4 flex items-center gap-3"><span class="w-9 h-9 rounded-full grid place-items-center font-bold text-white" style="background:var(--primary)">N</span><span><b>Nombre Cliente</b><br><span class="text-sm opacity-55">Rol / Ubicación</span></span></figcaption>
      </figure>
    </div>
  </div>
  <style>@keyframes marquee{to{transform:translateX(-50%)}}</style>
</div></section>`,
  },
  {
    id: 'cta-gradient-glow',
    source: 'Codehagen/hero, shadcnblockscom/pricing-6 CTA',
    type: 'cta',
    vibes: ['servicio', 'reserva', 'conversion', 'restaur', 'salud', 'fitness', 'agencia'],
    html: `<section class="py-20"><div class="max-w-6xl mx-auto px-6">
  <div class="relative overflow-hidden rounded-[2.5rem] px-8 py-16 md:py-20 text-center" style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 55%,var(--secondary)))">
    <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full blur-3xl opacity-30" style="background:var(--accent)"></div>
    <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-3xl opacity-20" style="background:#fff"></div>
    <h2 class="relative text-3xl md:text-5xl font-black tracking-tight text-white">¿Listo para empezar?</h2>
    <p class="relative mt-4 text-white/85 max-w-xl mx-auto text-lg">Una frase que cierra la venta y crea urgencia suave.</p>
    <a href="#contacto" class="relative inline-block mt-8 bg-white px-8 py-4 rounded-full font-bold" style="color:var(--primary)">Contáctanos hoy</a>
  </div>
</div></section>`,
  },
  {
    id: 'stats-divider-row',
    source: 'tommyjepsen/pricing-cards stats, ui-layouts/about-section-2',
    type: 'stats',
    vibes: ['corporat', 'empresa', 'b2b', 'servicio', 'industri', 'logist', 'ingenier', 'salud'],
    html: `<section class="py-16"><div class="max-w-6xl mx-auto px-6">
  <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style="border-color:color-mix(in srgb,var(--text) 12%,transparent)">
    <div class="p-8 text-center"><div class="text-4xl md:text-5xl font-black tracking-tight" style="color:var(--primary)">+20</div><div class="mt-2 text-sm opacity-60 uppercase tracking-wide">años de experiencia</div></div>
    <div class="p-8 text-center"><div class="text-4xl md:text-5xl font-black tracking-tight" style="color:var(--primary)">1,200+</div><div class="mt-2 text-sm opacity-60 uppercase tracking-wide">clientes atendidos</div></div>
    <div class="p-8 text-center"><div class="text-4xl md:text-5xl font-black tracking-tight" style="color:var(--primary)">98%</div><div class="mt-2 text-sm opacity-60 uppercase tracking-wide">satisfacción</div></div>
    <div class="p-8 text-center"><div class="text-4xl md:text-5xl font-black tracking-tight" style="color:var(--primary)">24/7</div><div class="mt-2 text-sm opacity-60 uppercase tracking-wide">disponibilidad</div></div>
  </div>
</div></section>`,
  },
  {
    id: 'feature-split-sticky',
    source: 'Abuhuraira/hero-grid-section, ui-layouts/about-section-2',
    type: 'feature',
    vibes: ['servicio', 'consultor', 'salud', 'educac', 'tech', 'inmobil', 'corporat'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Por qué nosotros</p>
    <h2 class="text-4xl md:text-5xl font-black tracking-tight leading-tight">Un titular que resume tu mayor diferencial</h2>
    <p class="mt-5 text-lg opacity-75 leading-relaxed">Párrafo que desarrolla la propuesta de valor con concreción.</p>
    <div class="mt-8 grid sm:grid-cols-2 gap-5">
      <div class="flex gap-3"><span class="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-white" style="background:var(--primary)">✓</span><div><b class="block">Beneficio uno</b><span class="text-sm opacity-65">Explicación breve.</span></div></div>
      <div class="flex gap-3"><span class="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-white" style="background:var(--primary)">✓</span><div><b class="block">Beneficio dos</b><span class="text-sm opacity-65">Explicación breve.</span></div></div>
    </div>
  </div>
  <div class="relative">
    <div class="absolute -inset-3 rounded-[2rem] opacity-15" style="background:var(--accent)"></div>
    <img src="IMG_URL" alt="" class="relative w-full aspect-[4/5] object-cover rounded-[2rem] shadow-2xl">
  </div>
</div></section>`,
  },

  /* ── NAVBAR (categoría: button/input/text · navegación) ── */
  {
    id: 'nav-glass-sticky',
    source: '21st nav patterns (aliimam/browser, shadcn navigation-menu)',
    type: 'nav',
    vibes: ['*'],
    html: `<header class="sticky top-0 z-50 backdrop-blur-md" style="background:color-mix(in srgb,var(--bg) 80%,transparent);border-bottom:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
  <nav class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    <a href="#top" class="font-extrabold text-xl tracking-tight">MARCA</a>
    <div class="hidden md:flex items-center gap-7 text-sm font-medium">
      <a href="#" class="hover:opacity-60 transition">Inicio</a><a href="#" class="hover:opacity-60 transition">Servicios</a><a href="#" class="hover:opacity-60 transition">Nosotros</a><a href="#" class="hover:opacity-60 transition">Contacto</a>
    </div>
    <a href="#contacto" class="text-sm font-semibold px-5 py-2.5 rounded-full text-white" style="background:var(--primary)">Contáctanos</a>
  </nav>
</header>`,
  },
  /* ── FOOTER (categoría: text/card · cierre) ── */
  {
    id: 'footer-large-name',
    source: '21st text/large-type + card patterns',
    type: 'footer',
    vibes: ['*'],
    html: `<footer class="pt-16 pb-6 overflow-hidden text-white" style="background:var(--secondary)">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
      <p class="text-white/60 max-w-sm leading-relaxed">Frase de cierre de la marca + teléfono y correo.</p>
      <div class="flex gap-6 text-sm text-white/70"><a href="#">Servicios</a><a href="#">Nosotros</a><a href="#">Contacto</a></div>
    </div>
    <div class="font-black leading-none tracking-tight" style="font-size:clamp(3rem,14vw,10rem);background:linear-gradient(180deg,#fff,color-mix(in srgb,var(--accent) 70%,transparent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;opacity:.92">MARCA</div>
    <div class="mt-4 pt-5 text-white/45 text-sm" style="border-top:1px solid rgba(255,255,255,.12)">© ${new Date().getFullYear()} Marca. Todos los derechos reservados.</div>
  </div>
</footer>`,
  },
  /* ── FAQ (categoría: card · acordeón) ── */
  {
    id: 'faq-accordion',
    source: 'shadcnblockscom/faq-5, 21st card/accordion patterns',
    type: 'faq',
    vibes: ['servicio', 'salud', 'educac', 'legal', 'b2b', 'finanz', 'consultor'],
    html: `<section class="py-24"><div class="max-w-3xl mx-auto px-6">
  <h2 class="text-4xl md:text-5xl font-black tracking-tight text-center mb-10">Preguntas frecuentes</h2>
  <div class="space-y-3">
    <details class="group p-6 rounded-2xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><summary class="font-bold cursor-pointer list-none flex justify-between items-center">Pregunta real del cliente<span class="group-open:rotate-45 transition text-2xl" style="color:var(--primary)">+</span></summary><p class="mt-3 opacity-70 leading-relaxed">Respuesta clara y útil que elimina la objeción.</p></details>
    <!-- repetir 4-6 preguntas reales del negocio -->
  </div>
</div></section>`,
  },
  /* ── FEATURE GRID con textura (categoría: card · bento) ── */
  {
    id: 'feature-grid-pattern',
    source: 'Ali-Hussein-dev/card-with-grid-pattern, 0xUrvish/bento-card',
    type: 'feature',
    vibes: ['tech', 'servicio', 'saas', 'corporat', 'b2b', 'industri'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6">
  <div class="grid md:grid-cols-3 gap-5">
    <div class="relative overflow-hidden rounded-3xl p-7" style="background:color-mix(in srgb,var(--primary) 5%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)">
      <div class="absolute inset-0 opacity-[0.06]" style="background-image:linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px);background-size:20px 20px"></div>
      <div class="relative"><div class="w-11 h-11 rounded-2xl grid place-items-center mb-4 text-white" style="background:var(--primary)">✓</div><h3 class="text-xl font-bold mb-2">Característica clave</h3><p class="opacity-70 text-[15px] leading-relaxed">Beneficio concreto explicado.</p></div>
    </div>
    <!-- repetir 3-6 cards -->
  </div>
</div></section>`,
  },
  /* ── LOGOS MARQUEE (categoría: carousel · 855 comp) ── */
  {
    id: 'logos-marquee',
    source: '0xUrvish/animated-collection, feature-carousel (carousel 855)',
    type: 'logos',
    vibes: ['b2b', 'corporat', 'tech', 'servicio', 'industri', 'logist'],
    html: `<section class="py-14 overflow-hidden">
  <p class="text-center text-xs uppercase tracking-[0.25em] opacity-50 mb-6">Confían en nosotros</p>
  <div class="relative" style="-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)">
    <div class="flex w-max items-center gap-14 opacity-60" style="animation:plia-logos 28s linear infinite">
      <span class="text-2xl font-black whitespace-nowrap">CLIENTE</span><span class="text-2xl font-black whitespace-nowrap">ALIADO</span><span class="text-2xl font-black whitespace-nowrap">PARTNER</span>
      <!-- duplicar el set para loop continuo -->
    </div>
  </div>
  <style>@keyframes plia-logos{to{transform:translateX(-50%)}}</style>
</section>`,
  },
  /* ── GALERÍA bento de imágenes (categoría: card/carousel) ── */
  {
    id: 'gallery-bento-images',
    source: '21st card + carousel image patterns',
    type: 'gallery',
    vibes: ['restaur', 'foto', 'inmobil', 'hotel', 'belleza', 'evento', 'arquitect'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="overflow-hidden rounded-2xl row-span-2"><img src="IMG_URL" alt="" class="w-full h-full object-cover aspect-[3/4] hover:scale-105 transition duration-500"></div>
    <div class="overflow-hidden rounded-2xl"><img src="IMG_URL" alt="" class="w-full h-full object-cover aspect-square hover:scale-105 transition duration-500"></div>
    <!-- mosaico bento: alterna tamaños (row-span-2 / square) -->
  </div>
</div></section>`,
  },
  /* ── HERO split con confianza (categoría: hero/heroes · 375 comp) ── */
  {
    id: 'hero-split-trust',
    source: 'Codehagen/hero, categoría hero+heroes (375 componentes)',
    type: 'hero',
    vibes: ['servicio', 'salud', 'corporat', 'b2b', 'inmobil', 'consultor', 'legal'],
    html: `<section id="top" class="relative"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[86vh] py-20">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Sector · Ciudad</p>
    <h1 class="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.03] tracking-tight">Titular potente del negocio</h1>
    <p class="mt-6 text-lg opacity-75 max-w-lg leading-relaxed">Subtítulo con la propuesta de valor concreta.</p>
    <div class="mt-9 flex flex-wrap gap-4"><a href="#contacto" class="px-7 py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">CTA principal</a><a href="#servicios" class="px-7 py-3.5 rounded-full font-semibold border-2" style="border-color:var(--primary);color:var(--primary)">Secundario</a></div>
    <div class="mt-8 flex items-center gap-6 text-sm opacity-70"><span>✓ Confianza 1</span><span>✓ Confianza 2</span></div>
  </div>
  <div class="relative"><div class="absolute -inset-4 rounded-[2rem] opacity-20" style="background:var(--accent)"></div><img src="IMG_URL" alt="" class="relative rounded-[2rem] shadow-2xl w-full aspect-[4/5] object-cover"></div>
</div></section>`,
  },

  /* ═══════════════ LOTE 2 — más variantes por tipo ═══════════════ */
  {
    id: 'hero-fullbleed-cinematic', source: 'categoría hero/heroes (fullbleed overlay)', type: 'hero',
    vibes: ['restaur', 'hotel', 'foto', 'gastron', 'evento', 'belleza', 'fitness', 'spa'],
    html: `<section id="top" class="relative min-h-[92vh] flex items-center"><div class="absolute inset-0 overflow-hidden"><img src="IMG_URL" alt="" class="w-full h-full object-cover scale-105"><div class="absolute inset-0" style="background:linear-gradient(to top, color-mix(in srgb,var(--secondary) 92%,transparent), color-mix(in srgb,var(--secondary) 42%,transparent) 52%, transparent)"></div></div>
  <div class="relative max-w-7xl mx-auto px-6 w-full text-white"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4">Sector · Ciudad</p><h1 class="text-5xl md:text-7xl font-black leading-[1.02] tracking-tight max-w-3xl">Titular cinematográfico</h1><p class="mt-6 text-lg text-white/85 max-w-xl">Subtítulo con propuesta de valor.</p><div class="mt-9 flex flex-wrap gap-4"><a href="#contacto" class="bg-white px-7 py-3.5 rounded-full font-semibold" style="color:var(--primary)">CTA principal</a><a href="#servicios" class="px-7 py-3.5 rounded-full font-semibold border-2 border-white text-white">Ver más</a></div></div></section>`,
  },
  {
    id: 'hero-centered-badge', source: 'badge/pill centered (SaaS), categoría hero', type: 'hero',
    vibes: ['tech', 'saas', 'software', 'app', 'startup', 'servicio', 'digital', 'agencia', 'cursos'],
    html: `<section id="top" class="py-28 md:py-36 text-center"><div class="max-w-4xl mx-auto px-6"><span class="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)"><span class="w-1.5 h-1.5 rounded-full" style="background:var(--primary)"></span>Novedad · frase corta</span><h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.02]">Titular centrado premium</h1><p class="mt-6 text-xl opacity-70 max-w-2xl mx-auto">Subtítulo claro y directo.</p><div class="mt-9 flex justify-center flex-wrap gap-4"><a href="#contacto" class="px-7 py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">Empezar</a><a href="#servicios" class="px-7 py-3.5 rounded-full font-semibold border-2" style="border-color:color-mix(in srgb,var(--text) 20%,transparent)">Saber más</a></div></div></section>`,
  },
  {
    id: 'nav-floating-pill', source: '21st nav patterns (floating)', type: 'nav', vibes: ['*'],
    html: `<div class="sticky top-4 z-50 px-4"><nav class="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between rounded-full backdrop-blur-md shadow-lg" style="background:color-mix(in srgb,var(--bg) 78%,transparent);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><a href="#top" class="font-extrabold tracking-tight">MARCA</a><div class="hidden md:flex gap-6 text-sm font-medium"><a href="#" class="hover:opacity-60 transition">Inicio</a><a href="#" class="hover:opacity-60 transition">Servicios</a><a href="#" class="hover:opacity-60 transition">Contacto</a></div><a href="#contacto" class="text-sm font-semibold px-4 py-2 rounded-full text-white" style="background:var(--primary)">Cotizar</a></nav></div>`,
  },
  {
    id: 'footer-cta-banner', source: 'CTA banner + footer (categoría card/text)', type: 'footer', vibes: ['*'],
    html: `<footer style="background:var(--secondary);color:#fff"><div class="max-w-6xl mx-auto px-6 -translate-y-10"><div class="rounded-[2rem] px-8 py-12 text-center" style="background:var(--primary)"><h3 class="text-3xl md:text-4xl font-black tracking-tight">¿Conversamos?</h3><a href="#" class="inline-block mt-5 bg-white px-7 py-3 rounded-full font-semibold" style="color:var(--primary)">Escríbenos por WhatsApp</a></div></div>
  <div class="max-w-7xl mx-auto px-6 pb-10 grid md:grid-cols-3 gap-8"><div><div class="font-extrabold text-xl mb-2">MARCA</div><p class="text-white/55 text-sm">Frase de cierre de la marca.</p></div><div><h4 class="font-bold mb-3 text-sm">Contacto</h4><ul class="text-white/55 text-sm space-y-1"><li>Teléfono</li><li>Correo</li></ul></div><div><h4 class="font-bold mb-3 text-sm">Síguenos</h4><ul class="text-white/55 text-sm space-y-1"><li>Instagram</li><li>Facebook</li></ul></div></div></footer>`,
  },
  {
    id: 'pricing-clean-tiers', source: 'categoría pricing (3-tier limpio)', type: 'pricing',
    vibes: ['servicio', 'b2b', 'consultor', 'membres', 'suscrip', 'educac', 'fitness'],
    html: `<section id="planes" class="py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">Planes claros</h2><div class="grid md:grid-cols-3 gap-6 items-stretch">
    <div class="p-8 rounded-3xl flex flex-col shadow-lg" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)"><h3 class="font-bold">Plan</h3><div class="mt-3 text-4xl font-black">S/ 99<span class="text-sm opacity-50 font-normal">/mes</span></div><ul class="mt-5 space-y-2 text-[15px] opacity-75 flex-1"><li>✓ Beneficio incluido</li></ul><a href="#contacto" class="mt-6 text-center py-3 rounded-full font-semibold text-white" style="background:var(--primary)">Elegir</a></div>
    <!-- repetir 3 planes; destacar el del medio con scale + badge --></div></div></section>`,
  },
  {
    id: 'testimonial-cards-quote', source: 'categoría testimonials (grid con comilla)', type: 'testimonial',
    vibes: ['servicio', 'salud', 'restaur', 'tienda', 'tech', 'corporat', 'educac'],
    html: `<section class="py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight mb-12">Lo que dicen</h2><div class="grid md:grid-cols-3 gap-6">
    <figure class="relative p-7 rounded-3xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="absolute top-3 right-6 text-6xl font-black opacity-10" style="color:var(--primary)">”</div><div class="flex gap-1 mb-3" style="color:var(--accent)">★★★★★</div><blockquote class="opacity-80 leading-relaxed">Testimonio real con un resultado concreto.</blockquote><figcaption class="mt-5 flex items-center gap-3"><span class="w-10 h-10 rounded-full grid place-items-center font-bold text-white" style="background:var(--primary)">N</span><span><b>Nombre</b><br><span class="text-sm opacity-55">Rol / Ubicación</span></span></figcaption></figure>
    <!-- repetir 3 --></div></div></section>`,
  },
  {
    id: 'cta-split-image', source: 'CTA con imagen (categoría card/hero)', type: 'cta',
    vibes: ['restaur', 'servicio', 'inmobil', 'salud', 'belleza', 'hotel', 'fitness'],
    html: `<section class="py-20"><div class="max-w-7xl mx-auto px-6"><div class="grid md:grid-cols-2 rounded-[2rem] overflow-hidden" style="background:var(--secondary)"><div class="p-10 md:p-14 flex flex-col justify-center text-white"><h2 class="text-3xl md:text-4xl font-black tracking-tight">¿Listo para empezar?</h2><p class="mt-4 text-white/75">Frase que cierra la venta con urgencia suave.</p><a href="#contacto" class="self-start mt-7 px-7 py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">Contáctanos</a></div><div class="min-h-[260px]"><img src="IMG_URL" alt="" class="w-full h-full object-cover"></div></div></div></section>`,
  },
  {
    id: 'stats-cards-icon', source: 'categoría card (stats como tarjetas)', type: 'stats',
    vibes: ['corporat', 'b2b', 'servicio', 'industri', 'salud', 'tech', 'logist'],
    html: `<section class="py-16"><div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="p-6 rounded-3xl text-center" style="background:color-mix(in srgb,var(--primary) 5%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="text-4xl md:text-5xl font-black" style="color:var(--primary)">+20</div><div class="mt-2 text-sm opacity-60">etiqueta del número</div></div>
    <!-- repetir 4 --></div></section>`,
  },
  {
    id: 'feature-alt-rows', source: 'ui-layouts/about-section, filas alternadas', type: 'feature',
    vibes: ['servicio', 'consultor', 'salud', 'educac', 'tech', 'inmobil', 'industri', 'agro'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6 space-y-20">
    <div class="grid lg:grid-cols-2 gap-12 items-center"><img src="IMG_URL" alt="" class="rounded-[2rem] shadow-xl w-full aspect-[5/4] object-cover"><div><p class="text-xs font-bold uppercase tracking-[0.25em] mb-3" style="color:var(--primary)">Etapa</p><h3 class="text-3xl md:text-4xl font-black tracking-tight">Beneficio principal</h3><p class="mt-4 opacity-75 text-lg">Explicación con concreción.</p></div></div>
    <!-- alternar: en filas pares invertir (lg:order-2 la imagen) --></div></section>`,
  },
  {
    id: 'gallery-masonry', source: 'categoría card/carousel (masonry)', type: 'gallery',
    vibes: ['foto', 'restaur', 'inmobil', 'arquitect', 'belleza', 'hotel', 'evento'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="columns-2 md:columns-3 gap-3 [&>img]:mb-3 [&>img]:w-full [&>img]:rounded-2xl">
    <img src="IMG_URL" alt="" class="hover:scale-[1.02] transition duration-500">
    <!-- repetir 6-9 imágenes de distinta altura --></div></div></section>`,
  },

  /* ═══════════════ LOTE 3 — más tipos y variantes ═══════════════ */
  {
    id: 'banner-announcement', source: '21st text/button (announcement bar)', type: 'banner', vibes: ['*'],
    html: `<div class="w-full text-center text-sm py-2.5 text-white" style="background:var(--primary)"><span class="opacity-90">🎉 Frase de promoción o novedad — </span><a href="#contacto" class="underline font-semibold">acción</a></div>`,
  },
  {
    id: 'about-split-image', source: 'ui-layouts/about-section, categoría card', type: 'about', vibes: ['*'],
    html: `<section id="nosotros" class="py-24"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
  <div class="relative"><div class="absolute -inset-3 rounded-[2rem] opacity-15" style="background:var(--accent)"></div><img src="IMG_URL" alt="" class="relative rounded-[2rem] shadow-xl w-full aspect-[5/4] object-cover"></div>
  <div><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Nosotros</p><h2 class="text-4xl md:text-5xl font-black tracking-tight leading-tight">Quiénes somos y por qué confiar</h2><p class="mt-5 text-lg opacity-75 leading-relaxed">Historia y propuesta de valor real del negocio, en 2-3 frases con personalidad.</p><ul class="mt-7 space-y-3">${'<li class="flex gap-3"><span style="color:var(--primary)">✓</span><span class="opacity-80">Diferencial concreto</span></li>'}</ul></div>
</div></section>`,
  },
  {
    id: 'about-stats-story', source: '21st card/text (sobre + métricas)', type: 'about', vibes: ['corporat', 'b2b', 'servicio', 'industri', 'salud', 'educac'],
    html: `<section id="nosotros" class="py-24" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-5xl mx-auto px-6 text-center"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Nuestra historia</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Un titular que resume la trayectoria</h2><p class="mt-5 text-lg opacity-75 max-w-2xl mx-auto">Párrafo de historia/misión con concreción.</p><div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">${'<div><div class="text-4xl font-black" style="color:var(--primary)">+20</div><div class="mt-2 text-sm opacity-60">años</div></div>'}</div></div></section>`,
  },
  {
    id: 'team-grid', source: '21st card (equipo)', type: 'team', vibes: ['servicio', 'salud', 'corporat', 'legal', 'consultor', 'educac', 'inmobil'],
    html: `<section id="equipo" class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="max-w-2xl mb-12"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Equipo</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Quiénes te atienden</h2></div><div class="grid grid-cols-2 md:grid-cols-4 gap-6">${'<div class="text-center group"><div class="aspect-square rounded-2xl overflow-hidden mb-4"><img src="IMG_URL" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></div><h4 class="font-bold">Nombre</h4><p class="text-sm opacity-60">Rol</p></div>'}</div></div></section>`,
  },
  {
    id: 'process-timeline', source: '21st card/carousel (pasos)', type: 'process', vibes: ['servicio', 'consultor', 'tech', 'construccion', 'salud', 'logist', 'b2b'],
    html: `<section class="py-24" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-7xl mx-auto px-6"><div class="max-w-2xl mb-14"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Cómo trabajamos</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Nuestro proceso</h2></div><div class="grid md:grid-cols-4 gap-8">${'<div><div class="text-6xl font-black opacity-15">01</div><h3 class="text-xl font-bold mt-2 mb-2">Paso</h3><p class="opacity-70 text-[15px]">Descripción breve.</p></div>'}</div></div></section>`,
  },
  {
    id: 'services-icon-cards', source: 'categoría card (servicios)', type: 'services', vibes: ['servicio', 'salud', 'corporat', 'tech', 'b2b', 'hogar', 'legal'],
    html: `<section id="servicios" class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="max-w-2xl mb-14"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Servicios</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Lo que hacemos por ti</h2></div><div class="grid md:grid-cols-3 gap-6">${'<div class="group p-8 rounded-3xl transition hover:-translate-y-1" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="w-12 h-12 rounded-2xl grid place-items-center mb-5 text-white" style="background:var(--primary)">✓</div><h3 class="text-xl font-bold mb-2">Servicio</h3><p class="opacity-70 text-[15px] leading-relaxed">Qué incluye y para quién.</p></div>'}</div></div></section>`,
  },
  {
    id: 'menu-price-list', source: 'categoría card (carta/menú)', type: 'menu', vibes: ['restaur', 'cafe', 'polleria', 'gastron', 'catering', 'bar'],
    html: `<section id="menu" class="py-24" style="background:color-mix(in srgb,var(--secondary) 6%,var(--bg))"><div class="max-w-5xl mx-auto px-6"><div class="text-center max-w-2xl mx-auto mb-14"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--accent)">Carta</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Lo más pedido</h2></div><div class="grid md:grid-cols-2 gap-x-14 gap-y-2">${'<div class="flex items-baseline gap-3 py-4" style="border-bottom:1px dashed color-mix(in srgb,var(--text) 18%,transparent)"><div class="flex-1"><h4 class="font-bold text-lg">Plato</h4><p class="opacity-60 text-sm">Descripción e ingredientes</p></div><div class="font-black text-lg whitespace-nowrap" style="color:var(--primary)">S/ 00</div></div>'}</div></div></section>`,
  },
  {
    id: 'contact-split-form', source: 'categoría form (contacto)', type: 'contact', vibes: ['*'],
    html: `<section id="contacto" class="py-24" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14"><div><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Contacto</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Hablemos</h2><p class="mt-4 opacity-70 text-lg">Te respondemos rápido.</p><div class="mt-8 space-y-4 opacity-80"><div>📞 Teléfono</div><div>📍 Dirección</div><div>🕒 Horarios</div></div></div><form data-plia-contact action="FORM_ENDPOINT" method="POST" class="p-8 rounded-3xl space-y-4" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 10%,transparent)"><input name="name" required placeholder="Nombre" class="w-full px-4 py-3 rounded-xl outline-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)"><input name="email" type="email" placeholder="Correo" class="w-full px-4 py-3 rounded-xl outline-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)"><textarea name="message" rows="4" placeholder="Mensaje" class="w-full px-4 py-3 rounded-xl outline-none resize-none" style="background:color-mix(in srgb,var(--text) 4%,transparent);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)"></textarea><button type="submit" class="w-full py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">Enviar</button><p data-plia-msg style="display:none" class="text-sm text-center"></p></form></div></section>`,
  },
  {
    id: 'blog-cards', source: 'categoría card (blog/novedades)', type: 'blog', vibes: ['corporat', 'servicio', 'tech', 'educac', 'salud', 'inmobil'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="max-w-2xl mb-12"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Novedades</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Últimas publicaciones</h2></div><div class="grid md:grid-cols-3 gap-7">${'<article class="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition" style="border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="aspect-[16/10] overflow-hidden"><img src="IMG_URL" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></div><div class="p-6"><span class="text-xs font-semibold" style="color:var(--primary)">Categoría</span><h3 class="text-lg font-bold mt-2">Título del artículo</h3><p class="opacity-65 text-sm mt-2">Resumen breve.</p></div></article>'}</div></div></section>`,
  },
  {
    id: 'pricing-comparison-table', source: 'tommyjepsen/pricing-comparison, ui-layouts', type: 'pricing', vibes: ['b2b', 'saas', 'software', 'servicio', 'tech'],
    html: `<section id="planes" class="py-24"><div class="max-w-5xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">Compara los planes</h2><div class="overflow-x-auto rounded-3xl" style="border:1px solid color-mix(in srgb,var(--text) 10%,transparent)"><table class="w-full text-left"><thead><tr style="background:color-mix(in srgb,var(--primary) 6%,transparent)"><th class="p-5">Característica</th><th class="p-5 text-center">Básico</th><th class="p-5 text-center" style="color:var(--primary)">Pro</th><th class="p-5 text-center">Premium</th></tr></thead><tbody>${'<tr style="border-top:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><td class="p-5">Feature</td><td class="p-5 text-center">—</td><td class="p-5 text-center" style="color:var(--primary)">✓</td><td class="p-5 text-center">✓</td></tr>'}</tbody></table></div></div></section>`,
  },
  {
    id: 'cta-newsletter', source: 'categoría form/input (newsletter)', type: 'cta', vibes: ['*'],
    html: `<section class="py-20"><div class="max-w-3xl mx-auto px-6 text-center"><h2 class="text-3xl md:text-4xl font-black tracking-tight">Únete a la comunidad</h2><p class="mt-3 opacity-70">Recibe novedades y ofertas.</p><form data-plia-contact action="FORM_ENDPOINT" method="POST" class="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"><input name="email" type="email" required placeholder="Tu correo" class="flex-1 px-5 py-3 rounded-full outline-none" style="border:1px solid color-mix(in srgb,var(--text) 15%,transparent)"><button class="px-7 py-3 rounded-full font-semibold text-white" style="background:var(--primary)">Suscribirme</button><p data-plia-msg style="display:none"></p></form></div></section>`,
  },
  {
    id: 'testimonial-single-big', source: 'jatin-yadav05/editorial-testimonial', type: 'testimonial', vibes: ['servicio', 'consultor', 'coach', 'legal', 'salud', 'corporat'],
    html: `<section class="py-24 md:py-32 text-center" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-4xl mx-auto px-6"><div class="text-7xl font-black leading-none mb-2" style="color:var(--primary);opacity:.18">"</div><blockquote class="text-2xl md:text-4xl font-light leading-snug tracking-tight">Cita potente del cliente con un resultado concreto.</blockquote><div class="mt-8 flex items-center justify-center gap-3"><span class="w-12 h-12 rounded-full grid place-items-center font-bold text-white" style="background:var(--primary)">N</span><span class="text-left"><b class="block">Nombre</b><span class="text-sm opacity-55">Rol / Empresa</span></span></div></div></section>`,
  },
  {
    id: 'features-zigzag', source: 'ui-layouts (alternado imagen/texto)', type: 'feature', vibes: ['tech', 'saas', 'servicio', 'producto', 'salud', 'educac'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6 space-y-24">${'<div class="grid lg:grid-cols-2 gap-12 items-center"><div class="relative"><div class="absolute -inset-3 rounded-[2rem] opacity-15" style="background:var(--accent)"></div><img src="IMG_URL" alt="" class="relative rounded-[2rem] shadow-xl w-full aspect-[4/3] object-cover"></div><div><span class="text-xs font-bold uppercase tracking-[0.25em]" style="color:var(--primary)">Beneficio</span><h3 class="text-3xl md:text-4xl font-black tracking-tight mt-3">Característica destacada</h3><p class="mt-4 opacity-75 text-lg">Explicación con valor concreto.</p></div></div>'}<!-- alternar lg:order en filas pares --></div></section>`,
  },
  {
    id: 'nav-centered-logo', source: '21st nav (logo centrado)', type: 'nav', vibes: ['restaur', 'belleza', 'boutique', 'foto', 'hotel', 'joyer', 'arquitect'],
    html: `<header class="sticky top-0 z-50 backdrop-blur-md" style="background:color-mix(in srgb,var(--bg) 82%,transparent);border-bottom:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><nav class="max-w-7xl mx-auto px-6 h-[72px] grid grid-cols-3 items-center"><div class="flex gap-6 text-sm font-medium"><a href="#" class="hover:opacity-60">Inicio</a><a href="#" class="hover:opacity-60">Carta</a></div><a href="#top" class="text-center font-extrabold text-xl tracking-tight">MARCA</a><div class="flex justify-end gap-6 text-sm font-medium"><a href="#" class="hover:opacity-60">Galería</a><a href="#contacto" class="font-semibold" style="color:var(--primary)">Reservar</a></div></nav></header>`,
  },
  {
    id: 'footer-minimal-row', source: '21st text (footer minimal)', type: 'footer', vibes: ['*'],
    html: `<footer class="py-12" style="background:var(--secondary);color:#fff"><div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6"><div class="font-extrabold text-xl">MARCA</div><div class="flex gap-6 text-sm text-white/65"><a href="#">Inicio</a><a href="#">Servicios</a><a href="#">Contacto</a></div><div class="text-white/45 text-xs">© ${new Date().getFullYear()} Marca</div></div></footer>`,
  },
  {
    id: 'faq-two-column', source: 'shadcnblockscom/faq, dos columnas', type: 'faq', vibes: ['servicio', 'tech', 'salud', 'educac', 'b2b', 'finanz'],
    html: `<section class="py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight mb-10">Preguntas frecuentes</h2><div class="grid md:grid-cols-2 gap-x-10 gap-y-3">${'<details class="group p-5 rounded-2xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><summary class="font-bold cursor-pointer list-none flex justify-between items-center">Pregunta<span class="group-open:rotate-45 transition text-xl" style="color:var(--primary)">+</span></summary><p class="mt-2 opacity-70">Respuesta.</p></details>'}</div></div></section>`,
  },
  {
    id: 'stats-big-numbers', source: '@number-flow/react idea (números grandes)', type: 'stats', vibes: ['*'],
    html: `<section class="py-20" style="background:var(--secondary);color:#fff"><div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">${'<div><div class="text-5xl md:text-6xl font-black" style="color:var(--accent)">+1K</div><div class="mt-2 text-white/60">etiqueta</div></div>'}</div></section>`,
  },
  {
    id: 'gallery-carousel-row', source: 'embla-carousel (galería deslizante)', type: 'gallery', vibes: ['restaur', 'foto', 'hotel', 'inmobil', 'belleza', 'evento', 'arquitect'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6 mb-8"><h2 class="text-4xl md:text-5xl font-black tracking-tight">Galería</h2></div><div class="flex gap-4 overflow-x-auto px-6 pb-4 snap-x" style="scroll-snap-type:x mandatory">${'<img src="IMG_URL" alt="" class="snap-start shrink-0 w-[300px] md:w-[420px] aspect-[4/3] object-cover rounded-2xl">'}</div></section>`,
  },
  {
    id: 'logos-grid', source: 'categoría card (grid de logos)', type: 'logos', vibes: ['b2b', 'corporat', 'tech', 'servicio', 'industri'],
    html: `<section class="py-16"><div class="max-w-6xl mx-auto px-6 text-center"><p class="text-xs uppercase tracking-[0.25em] opacity-50 mb-8">Confían en nosotros</p><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center opacity-60">${'<div class="text-xl font-black text-center">LOGO</div>'}</div></div></section>`,
  },

  /* ═══════════════ LOTE 4 — más variantes ═══════════════ */
  {
    id: 'hero-grid-pattern-bg', source: 'Abuhuraira/hero-grid-section', type: 'hero', vibes: ['tech', 'saas', 'b2b', 'software', 'soporte', 'startup'],
    html: `<section id="top" class="relative py-28 md:py-36 text-center overflow-hidden"><div class="absolute inset-0 opacity-[0.05]" style="background-image:linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse at center,#000,transparent 75%)"></div><div class="relative max-w-4xl mx-auto px-6"><h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.02]">Titular sobre cuadrícula sutil</h1><p class="mt-6 text-xl opacity-70 max-w-2xl mx-auto">Subtítulo.</p><div class="mt-9 flex justify-center gap-4"><a href="#contacto" class="px-7 py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">Empezar</a></div></div></section>`,
  },
  {
    id: 'hero-stats-inline', source: 'categoría hero (hero + métricas)', type: 'hero', vibes: ['corporat', 'servicio', 'salud', 'industri', 'inmobil', 'b2b'],
    html: `<section id="top" class="py-24 md:py-28"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">Titular con respaldo de números</h1><p class="mt-6 text-lg opacity-75 max-w-lg">Propuesta de valor.</p><div class="mt-8 flex gap-4"><a href="#contacto" class="px-7 py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">CTA</a></div><div class="mt-10 grid grid-cols-3 gap-6">${'<div><div class="text-3xl font-black" style="color:var(--primary)">+20</div><div class="text-sm opacity-60">años</div></div>'}</div></div><div class="relative"><img src="IMG_URL" alt="" class="rounded-[2rem] shadow-2xl w-full aspect-[4/5] object-cover"></div></div></section>`,
  },
  {
    id: 'services-split-list', source: 'ui-layouts (servicios en lista)', type: 'services', vibes: ['servicio', 'consultor', 'legal', 'contab', 'tech', 'b2b'],
    html: `<section id="servicios" class="py-24" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14"><div class="lg:sticky lg:top-24 self-start"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Servicios</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Todo lo que ofrecemos</h2><p class="mt-4 opacity-70 text-lg">Resumen.</p></div><div class="space-y-4">${'<div class="p-6 rounded-2xl flex gap-4" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><span class="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0" style="background:var(--primary)">✓</span><div><h3 class="font-bold text-lg">Servicio</h3><p class="opacity-70 text-[15px]">Detalle.</p></div></div>'}</div></div></section>`,
  },
  {
    id: 'process-vertical', source: 'categoría card (timeline vertical)', type: 'process', vibes: ['servicio', 'salud', 'educac', 'construccion', 'inmobil'],
    html: `<section class="py-24"><div class="max-w-3xl mx-auto px-6"><div class="text-center mb-14"><h2 class="text-4xl md:text-5xl font-black tracking-tight">Cómo funciona</h2></div><div class="space-y-8">${'<div class="flex gap-5"><div class="shrink-0 w-11 h-11 rounded-full grid place-items-center font-black text-white" style="background:var(--primary)">1</div><div><h3 class="text-xl font-bold">Paso</h3><p class="opacity-70 mt-1">Descripción.</p></div></div>'}</div></div></section>`,
  },
  {
    id: 'pricing-single-card', source: 'bankkroll/single-pricing-card', type: 'pricing', vibes: ['servicio', 'producto', 'curso', 'lifetime'],
    html: `<section id="planes" class="py-24"><div class="max-w-md mx-auto px-6"><div class="p-8 rounded-3xl shadow-2xl text-center" style="border:2px solid var(--primary)"><span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style="background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary)">Oferta única</span><div class="mt-5 text-5xl font-black">S/ 000</div><ul class="mt-6 space-y-3 text-left">${'<li class="flex gap-2.5">✓<span class="opacity-80">Todo incluido</span></li>'}</ul><a href="#contacto" class="mt-7 block py-3.5 rounded-full font-semibold text-white" style="background:var(--primary)">Empezar ahora</a></div></div></section>`,
  },
  {
    id: 'testimonial-with-logos', source: 'categoría testimonials (testimonio + clientes)', type: 'testimonial', vibes: ['b2b', 'saas', 'servicio', 'corporat', 'tech'],
    html: `<section class="py-24" style="background:color-mix(in srgb,var(--primary) 6%,var(--bg))"><div class="max-w-5xl mx-auto px-6 text-center"><blockquote class="text-2xl md:text-3xl font-light leading-snug">Testimonio destacado de un cliente reconocido.</blockquote><div class="mt-6 font-bold">Nombre · Empresa</div><div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-50">${'<div class="text-lg font-black text-center">CLIENTE</div>'}</div></div></section>`,
  },
  {
    id: 'cta-split-dark', source: 'Codehagen/hero (CTA oscuro split)', type: 'cta', vibes: ['servicio', 'tech', 'corporat', 'agencia', 'b2b'],
    html: `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><div class="rounded-[2rem] p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center" style="background:var(--secondary);color:#fff"><div><h2 class="text-3xl md:text-4xl font-black tracking-tight">¿Empezamos tu proyecto?</h2><p class="mt-3 text-white/70">Frase de cierre.</p></div><div class="flex md:justify-end"><a href="#contacto" class="px-8 py-4 rounded-full font-bold text-white" style="background:var(--primary)">Contáctanos hoy</a></div></div></div></section>`,
  },
  {
    id: 'gallery-masonry-3col', source: '21st card (masonry 3 columnas)', type: 'gallery', vibes: ['foto', 'arquitect', 'inmobil', 'belleza', 'restaur', 'evento'],
    html: `<section id="galeria" class="py-24"><div class="max-w-7xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight mb-10">Nuestro trabajo</h2><div class="columns-2 md:columns-3 gap-4 [&>img]:mb-4 [&>img]:w-full [&>img]:rounded-2xl">${'<img src="IMG_URL" alt="" class="hover:opacity-90 transition">'}</div></div></section>`,
  },
  {
    id: 'feature-icon-trio', source: '21st card (3 features con icono)', type: 'feature', vibes: ['saas', 'software', 'tech', 'servicio', 'producto'],
    html: `<section class="py-24"><div class="max-w-5xl mx-auto px-6 text-center"><h2 class="text-4xl md:text-5xl font-black tracking-tight mb-10">Todo lo que necesitas</h2><div class="grid md:grid-cols-3 gap-6 text-left">${'<div class="p-7 rounded-3xl" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="w-11 h-11 rounded-2xl grid place-items-center mb-4 text-white" style="background:var(--primary)">✓</div><h3 class="font-bold text-lg mb-1">Feature</h3><p class="opacity-70 text-[15px]">Descripción.</p></div>'}</div></div></section>`,
  },
  {
    id: 'team-with-bio', source: 'categoría card (equipo con bio)', type: 'team', vibes: ['legal', 'salud', 'consultor', 'corporat', 'arquitect'],
    html: `<section id="equipo" class="py-24" style="background:color-mix(in srgb,var(--secondary) 5%,var(--bg))"><div class="max-w-6xl mx-auto px-6"><h2 class="text-4xl md:text-5xl font-black tracking-tight mb-12">Nuestro equipo</h2><div class="grid md:grid-cols-3 gap-7">${'<div class="p-6 rounded-3xl text-center" style="background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4"><img src="IMG_URL" alt="" class="w-full h-full object-cover"></div><h4 class="font-bold">Nombre</h4><p class="text-sm" style="color:var(--primary)">Cargo</p><p class="mt-2 text-sm opacity-65">Bio breve.</p></div>'}</div></div></section>`,
  },
  {
    id: 'about-values', source: 'categoría card (valores)', type: 'about', vibes: ['corporat', 'b2b', 'servicio', 'institucional', 'salud', 'educac'],
    html: `<section class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="max-w-2xl mb-14"><p class="text-xs font-bold uppercase tracking-[0.25em] mb-4" style="color:var(--primary)">Nuestros valores</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">Lo que nos define</h2></div><div class="grid md:grid-cols-3 gap-6">${'<div class="p-8 rounded-3xl" style="border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="text-3xl mb-3">★</div><h3 class="font-bold text-lg mb-2">Valor</h3><p class="opacity-70 text-[15px]">Qué significa para nosotros.</p></div>'}</div></div></section>`,
  },
  {
    id: 'contact-info-cards', source: 'categoría card (contacto con tarjetas)', type: 'contact', vibes: ['restaur', 'salud', 'servicio', 'local', 'belleza', 'hogar'],
    html: `<section id="contacto" class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="text-center max-w-2xl mx-auto mb-12"><h2 class="text-4xl md:text-5xl font-black tracking-tight">Visítanos o escríbenos</h2></div><div class="grid md:grid-cols-3 gap-6">${'<div class="p-7 rounded-3xl text-center" style="background:color-mix(in srgb,var(--primary) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="w-12 h-12 rounded-2xl grid place-items-center mx-auto mb-4 text-white" style="background:var(--primary)">📍</div><h3 class="font-bold mb-1">Dato</h3><p class="opacity-70 text-sm">Valor</p></div>'}</div></div></section>`,
  },
  {
    id: 'banner-offer', source: '21st (banner con urgencia)', type: 'banner', vibes: ['evento', 'restaur', 'tienda', 'cursos', 'lead-capture'],
    html: `<section class="py-12 text-center text-white" style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 55%,var(--secondary)))"><div class="max-w-3xl mx-auto px-6"><h3 class="text-2xl md:text-3xl font-black tracking-tight">Oferta por tiempo limitado</h3><p class="mt-2 text-white/80">Aprovecha antes de que termine.</p><a href="#contacto" class="inline-block mt-5 bg-white px-7 py-3 rounded-full font-semibold" style="color:var(--primary)">Quiero aprovechar</a></div></section>`,
  },
  {
    id: 'menu-categories-grid', source: 'categoría card (menú por categorías)', type: 'menu', vibes: ['restaur', 'cafe', 'catalog', 'tienda', 'polleria'],
    html: `<section id="menu" class="py-24"><div class="max-w-7xl mx-auto px-6"><div class="text-center mb-12"><h2 class="text-4xl md:text-5xl font-black tracking-tight">Nuestro catálogo</h2></div><div class="grid md:grid-cols-3 gap-6">${'<div class="group rounded-3xl overflow-hidden shadow-lg" style="border:1px solid color-mix(in srgb,var(--text) 8%,transparent)"><div class="aspect-[4/3] overflow-hidden"><img src="IMG_URL" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></div><div class="p-5 flex items-center justify-between"><div><h3 class="font-bold">Producto</h3><p class="text-sm opacity-60">Descripción</p></div><span class="font-black" style="color:var(--primary)">S/ 00</span></div></div>'}</div></div></section>`,
  },
];

/**
 * Devuelve 1-2 snippets de referencia relevantes al vibe, rotando con seed
 * para que distintos proyectos reciban ejemplos distintos.
 */
export function pickReferenceSnippets(
  vibe: string | undefined,
  brief: string | undefined,
  seed: string | undefined,
  max = 1,
): Snippet21st[] {
  const hay = `${vibe || ''} ${brief || ''}`.toLowerCase();
  // '*' = universal (nav/footer encajan en cualquier rubro, prioridad baja).
  const score = (s: Snippet21st) =>
    s.vibes.includes('*') ? 0.5 : s.vibes.filter((v) => hay.includes(v)).length;
  const ranked = SNIPPETS_21ST.map((s) => ({ s, sc: score(s) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc);
  const pool = (ranked.length ? ranked.map((x) => x.s) : SNIPPETS_21ST);
  const start = seed
    ? [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % pool.length
    : Math.floor(Math.random() * pool.length);
  // Devuelve hasta `max` snippets de TIPOS DISTINTOS (mayor amplitud de la biblioteca).
  const out: Snippet21st[] = [];
  const usedTypes = new Set<string>();
  for (let i = 0; i < pool.length && out.length < max; i++) {
    const cand = pool[(start + i) % pool.length];
    if (usedTypes.has(cand.type)) continue;
    usedTypes.add(cand.type);
    out.push(cand);
  }
  return out;
}
