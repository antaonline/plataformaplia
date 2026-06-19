import { Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, FallbackProvider } from '../experimental/iachat/generation/providers';
import { enforceContactForms } from './contact-form-enforcer';
import { enforcePremiumQuality } from './premium-quality-enforcer';
import { PLIA_DESIGN_INTELLIGENCE } from './design-intelligence';
import { pickFooterArchetype } from './design-library/footers';
import { pickHeroArchetype } from './design-library/heroes';
import { pickPricingArchetype } from './design-library/pricing';
import { pickTestimonialArchetype } from './design-library/testimonials';
import { pickReferenceSnippets } from './design-library/snippets-21st';

export type WebMode = 'LANDING' | 'WEB';

export interface SitePlan {
  projectName: string;
  design: {
    vibe: string;
    palette: { primary: string; secondary: string; accent: string; bg: string; text: string };
    fonts: { heading: string; body: string };
  };
  pages: { file: string; purpose: string }[];
  imagePrompts: { id: string; prompt: string; usage: string }[];
  // Secciones de la landing decididas por la IA según el brief del cliente.
  // Cada una: id (anchor), title (nombre visible), brief (qué debe contener/narrar).
  sections?: { id: string; title: string; brief: string }[];
}

const MODEL_SONNET =
  process.env.ANTHROPIC_MODEL_SONNET ||
  process.env.ANTHROPIC_MODEL ||
  'claude-sonnet-4-6';

const STATIC_RULES = `Generas SITIOS WEB ESTATICOS de NIVEL AGENCIA PREMIUM (HTML + Tailwind via CDN).
EL CLIENTE PAGO S/390+ POR ESTE SITIO: tiene que verse como si lo hizo un estudio
profesional. Si entregas algo plano y predecible, fallaste. Referencias visuales:
Apple, Stripe, Linear, Vercel, Notion, Framer, Awwwards winners.

REGLAS DURAS DE ESTRUCTURA:
- Cada pagina es un .html COMPLETO y autocontenido: <!DOCTYPE html>, <head> con
  <script src="https://cdn.tailwindcss.com"></script>, Google Fonts via <link>, y <body>.
- PROHIBIDO React/JSX/build tools/imports. SOLO HTML estatico + clases Tailwind + JS vanilla.
- PROHIBIDO escribir codigo JSX literal como {[...].map(...)} o {variable.map(...)} dentro del HTML:
  eso se renderiza como TEXTO PLANO horrible en el navegador. Si quieres iterar una lista, escribe los
  items uno por uno EN HTML, o usa un <script> al final que haga document.createElement.
- Contenido REAL y persuasivo en espanol neutro (mercado peruano), especifico del negocio.
  NADA de lorem ipsum, "Lorem", placeholders, ni textos genericos tipo "Tu mejor opcion".
- Usa EXACTAMENTE las URLs de imagen que se te entreguen. NO inventes URLs de imagen.

LIBRERIAS (cargar via CDN):
- Tailwind: <script src="https://cdn.tailwindcss.com"></script> (OBLIGATORIO)
- Para animaciones de entrada al scroll usa SOLO la clase "reveal" + el observer descritos abajo.
  NO uses GSAP con opacity:0 (deja secciones invisibles/superpuestas si el trigger no dispara).
  Si quieres microinteracciones extra, usa transiciones CSS de Tailwind (hover:scale, transition) — son seguras.

DISENO PREMIUM (no opcional):
- HERO con altura min-h-screen, fondo con imagen + overlay con gradient COMPLEJO
  (3+ stops, no un overlay plano). Si hay GSAP, agregar parallax en la imagen del hero
  (data-parallax o gsap.to con scrub). Titulo en 5xl/7xl con tracking-tight, peso bold/black.
- CADA SECCION debe ser VISUALMENTE DISTINTA de la anterior: alterna fondos (claro/oscuro/
  gradient/imagen), alterna layouts (grid 2-col / grid 3-col / split asimetrico / full-width),
  alterna alignment. Si dos secciones consecutivas se ven iguales, esta MAL.
- Microinteracciones obligatorias: botones con hover transform + shadow + transition,
  cards con hover translateY(-4px), imagenes con scale al hover, links con underline
  animado (background-size 0 100% -> 100% 100%).
- Iconografia: usa SVG inline tipo Lucide/Heroicons (path real, stroke 1.5-2px).
  PROHIBIDO usar emojis como iconos principales en hero/CTAs. Emojis solo en chips
  decorativos pequenos.
- Tipografia con jerarquia EVIDENTE: 5 tamanos minimo (xs labels, base body, xl
  subtitles, 3xl-5xl titles, 6xl-7xl heroes). Espaciado generoso (py-20 minimo entre secciones).
- COLORES: respeta el design system pero usa la paleta con sofisticacion: gradientes
  multi-stop, sombras de color (no solo gris), bordes con color del accent al hover.

GOOGLE MAPS (cuando aplique):
- USA EL FORMATO KEYLESS por busqueda de direccion (NO Place ID inventado):
    <iframe src="https://www.google.com/maps?q=DIRECCION+URL-ENCODED&output=embed" ...>
- NUNCA generes URLs con Place IDs que no existen ("0x...%3A0x0" es un fake clasico).
  Eso muestra al cliente un mapa generico. Si no sabes la direccion exacta, omite el mapa.

FORMULARIOS:
- NUNCA uses mailto: como fallback. NUNCA hagas window.location.href = mailtoLink.
- El form action lo recibis explicitamente en el prompt; usalo tal cual con POST.

ANIMACIÓN AL SCROLL (única forma permitida — NO uses GSAP con opacity:0):
Agrega class="reveal" a los bloques que quieras animar. El sistema ya incluye el CSS y el observer que los hace aparecer. Si el JS no corre, igual se ven (fallback). Para microinteracciones extra usa transiciones CSS de Tailwind (hover:scale, transition).

CATALOGO DE SECCIONES — UNA LANDING DEBE TENER 8 O MÁS DE ESTAS (ricas, detalladas, NO planas):
1. Nav sticky con backdrop-blur, logo + items + CTA primario.
2. Hero min-h-screen, imagen de fondo con gradient overlay COMPLEJO (3+ stops), h1 huge (5xl-7xl) + subtitulo + 2 CTAs + chip/badge de ubicacion o sector.
3. Stats / proof bar: 3-4 numeros grandes (clientes, años, productos, regiones) con etiqueta.
4. Servicios / caracteristicas en grid 3-col o 4-col, cada uno con icono SVG inline + titulo + descripcion real.
5. Menu / catalogo / productos (si aplica al negocio): cards o lista elegante con precios reales.
6. Galeria de fotos/productos/portfolio: grid masonry o asimetrico con hover scale.
7. Bloque storytelling/nosotros: split 2-col texto + imagen lateral grande (NO card centrada).
8. Testimonios: 2-3 cards con avatar (inicial), nombre, rol, comilla decorativa grande, estrellas SVG.
9. FAQ accordion (details/summary HTML5 con chevron animado).
10. CTA final full-width con fondo de color/imagen + boton grande.
11. Mapa + contacto (si es negocio local): iframe keyless + formulario.
12. Footer multi-columna: marca, enlaces, redes sociales SVG, contacto, copyright.

ROMPE EL RITMO: alterna fondos (claro var(--bg) / oscuro var(--primary) / gradient), alterna layouts (grid / split asimetrico / full-width), alterna alignment. Si dos secciones consecutivas se ven iguales, está MAL. El sitio fluye verticalmente, secciones apiladas, SIN solapamientos (solo la imagen del hero usa position:absolute, dentro de un hero relative overflow-hidden).`;

@Injectable()
export class WebsiteGenService {
  private readonly logger = new Logger(WebsiteGenService.name);
  // SOLO Claude — GPT-4o genera diseños pobres, no lo usamos como fallback.
  // Ante rate-limit, reintentamos Claude con espera (ver completeClaudeWithRetry).
  private planProvider = new FallbackProvider([PROVIDERS.claude]);
  private renderProvider = new FallbackProvider([PROVIDERS.claude]);

  /**
   * Llama a Claude con reintentos pacientes ante rate-limit (429 tokens/min).
   * En vez de caer a GPT-4o (calidad pobre), espera y reintenta Claude.
   */
  private async completeClaudeWithRetry(
    system: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    opts: any,
    label: string,
  ): Promise<string> {
    const maxRetries = 5;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.renderProvider.complete(system, messages, opts);
      } catch (e: any) {
        const status = e?.response?.status;
        const msg = (e?.response?.data?.error?.message || e?.message || '').toLowerCase();
        const isRateLimit = status === 429 || msg.includes('rate') || msg.includes('tokens per minute') || msg.includes('overloaded') || status === 529;
        if (isRateLimit && attempt < maxRetries) {
          const waitMs = (15 + attempt * 10) * 1000; // 15s, 25s, 35s, 45s, 55s
          this.logger.warn(`[${label}] rate-limit Claude, esperando ${waitMs / 1000}s (intento ${attempt + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw e;
      }
    }
    throw new Error(`[${label}] Claude agotó reintentos por rate-limit`);
  }

  private stripFences(s: string): string {
    let out = (s || '').trim();
    const f = out.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n```$/);
    if (f) return f[1].trim();
    return out.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```$/, '').trim();
  }

  private parseJson<T>(raw: string): T | null {
    let t = (raw || '').trim();
    const f = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (f) t = f[1].trim();
    const a = t.indexOf('{');
    const b = t.lastIndexOf('}');
    if (a === -1 || b === -1) return null;
    try {
      return JSON.parse(t.slice(a, b + 1));
    } catch {
      return null;
    }
  }

  /** Fase 1: plan (arquitectura + design system + prompts de imagen DALL-E). */
  async plan(
    brief: string,
    mode: WebMode,
    clientImages: string[] = [],
    clientLogo?: string,
  ): Promise<SitePlan> {
    const pageRule =
      mode === 'LANDING'
        ? `Es una LANDING PREMIUM: EXACTAMENTE 1 pagina de ventas (index.html), pero con 8-11 secciones distintas y ricas (hero, stats, servicios, galeria, storytelling, testimonios, FAQ, CTA final, ubicacion/mapa, contacto, footer). PROHIBIDO paginas internas.`
        : `Es una WEB INSTITUCIONAL PREMIUM: entre 2 y 5 paginas internas (index.html + p.ej. nosotros.html, servicios.html, proyectos.html, contacto.html). Cada pagina debe tener 5-8 secciones ricas. Se enlazan entre si.`;
    const sectionsRule = mode === 'LANDING'
      ? `"sections": ARRAY DE 7 A 10 SECCIONES que narren y vendan. Eres un experto en landing pages de alto rendimiento. DECIDE las secciones óptimas para ESTE negocio específico, en orden de storytelling persuasivo.
   Catálogo de secciones disponibles (elige y ORDENA las que mejor vendan para este negocio):
   - hero (SIEMPRE primera, obligatoria): impacto visual + propuesta de valor + CTAs
   - stats / logros: números que generan confianza (años, clientes, productos)
   - servicios / beneficios: qué ofrece y por qué importa
   - menu / catalogo: SI el cliente lo pidió (mira MENU/CATALOGO, SERVICIOS en el brief)
   - galeria: SI el cliente pidió galería de imágenes
   - promociones / oferta: SI el cliente mencionó PROMOCIONES
   - proceso / como-funciona: pasos numerados si aplica
   - storytelling / nosotros: historia emocional de la marca (split texto+imagen)
   - testimonios: prueba social (SIEMPRE recomendada, mínimo 2-3)
   - faq: preguntas frecuentes (accordion)
   - cta-banner: llamada a acción intermedia full-width
   - ubicacion / mapa: SI es negocio local con dirección física
   - contacto (SIEMPRE penúltima): formulario + datos
   - footer (SIEMPRE última, obligatoria)
   Cada seccion: { "id":"anchor-kebab", "title":"Nombre Visible", "brief":"qué contenido específico va aquí según el brief del cliente, qué debe narrar/mostrar" }.
   IMPORTANTE: adapta a lo que el cliente REALMENTE pidió en su brief. Si no pidió galería, no la pongas. Si pidió catálogo PDF, agrega seccion que lo enlace. La landing debe CONTAR UNA HISTORIA que lleve al usuario del interés a la acción.`
      : `"sections": para web institucional, 5-7 secciones por la pagina principal.`;
    const system = `${STATIC_RULES}\n\nDevuelve SOLO este JSON valido (sin texto fuera):
{
 "projectName":"...",
 "design":{"vibe":"...","palette":{"primary":"#hex","secondary":"#hex","accent":"#hex","bg":"#hex","text":"#hex"},"fonts":{"heading":"Google Font","body":"Google Font"}},
 "pages":[{"file":"index.html","purpose":"que contiene"}],
 "sections":[{"id":"hero","title":"...","brief":"..."}],
 "imagePrompts":[{"id":"hero","prompt":"prompt en ingles para DALL-E, fotorealista, alta calidad","usage":"hero"}]
}
${sectionsRule}
${pageRule}
imagePrompts: 5-9 imagenes necesarias para el sitio (hero cinematografico, banners de
secciones, fotos de productos, ambientes, detalles de textura, etc). Calidad
fotografica REAL, ningun ilustracion plana. Para el HERO pedi siempre algo
cinematografico de alta calidad (luz dramatica, profundidad, composicion premium).
Las imagenes que suba el cliente (si las hay) las VES en este mensaje: son contenido
REAL del negocio (logo, fotos del local, productos, equipo, etc). PRIORIDAD: estas
imagenes del cliente DEBEN usarse en el sitio final donde correspondan (logo en el
header, fotos del local en hero/ubicacion, fotos de productos en galeria, fotos del
equipo en seccion equipo, etc). SOLO genera prompts en imagePrompts para cubrir
SLOTS que las imagenes del cliente NO cubren. Si el cliente sube 3 fotos de
productos, no generes prompts adicionales para productos — usa las del cliente.`;
    // El logo va primero en el array de imagenes multimodales para que la
    // IA lo VEA y pueda identificarlo (por su forma/transparencia/copy).
    const multimodalImages = clientLogo ? [clientLogo, ...clientImages] : clientImages;
    const raw = await this.completeClaudeWithRetry(
      system,
      [
        {
          role: 'user',
          content: clientLogo
            ? `${brief}\n\nNota: la PRIMERA imagen adjunta en este mensaje es el LOGO oficial del cliente.`
            : brief,
        },
      ],
      { model: MODEL_SONNET, json: true, maxTokens: 3000, images: multimodalImages },
      'plan',
    );
    const parsed = this.parseJson<SitePlan>(raw);
    const safe: SitePlan = {
      projectName: parsed?.projectName || 'Proyecto Web',
      design: {
        vibe: parsed?.design?.vibe || 'moderno, profesional, premium',
        palette: {
          primary: parsed?.design?.palette?.primary || '#0f172a',
          secondary: parsed?.design?.palette?.secondary || '#1e293b',
          accent: parsed?.design?.palette?.accent || '#6366f1',
          bg: parsed?.design?.palette?.bg || '#ffffff',
          text: parsed?.design?.palette?.text || '#0f172a',
        },
        fonts: {
          heading: parsed?.design?.fonts?.heading || 'Poppins',
          body: parsed?.design?.fonts?.body || 'Inter',
        },
      },
      pages:
        mode === 'LANDING'
          ? [{ file: 'index.html', purpose: 'Landing de ventas completa' }]
          : (() => {
              let ps = Array.isArray(parsed?.pages) ? parsed!.pages : [];
              ps = ps
                .filter((p) => p && /\.html$/i.test(p.file))
                .slice(0, 5);
              if (!ps.some((p) => /^index\.html$/i.test(p.file))) {
                ps.unshift({ file: 'index.html', purpose: 'Pagina principal' });
              }
              return ps.slice(0, 5);
            })(),
      imagePrompts: Array.isArray(parsed?.imagePrompts)
        ? parsed!.imagePrompts.filter((x) => x && x.prompt).slice(0, 9)
        : [],
      sections: Array.isArray(parsed?.sections)
        ? parsed!.sections.filter((s) => s && s.id && s.brief).slice(0, 11)
        : [],
    };
    return safe;
  }

  /** Construye el <head> compartido con Tailwind, fuentes, :root y el observer .reveal seguro. */
  private buildHead(ds: SitePlan['design'], title: string): string {
    const hf = encodeURIComponent(ds.fonts.heading);
    const bf = encodeURIComponent(ds.fonts.body);
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${hf}:wght@400;600;700;800;900&family=${bf}:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--primary:${ds.palette.primary};--secondary:${ds.palette.secondary};--accent:${ds.palette.accent};--bg:${ds.palette.bg};--text:${ds.palette.text}}
html{scroll-behavior:smooth}
body{font-family:'${ds.fonts.body}',sans-serif;background:var(--bg);color:var(--text);margin:0}
h1,h2,h3,h4{font-family:'${ds.fonts.heading}',sans-serif}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.reveal.in{opacity:1;transform:none}
</style>
</head>
<body>`;
  }

  /** Script final: IntersectionObserver para .reveal + handler de formulario. */
  private buildClosingScript(formEndpoint?: string): string {
    const formScript = formEndpoint ? `
document.querySelectorAll('form[data-plia-contact]').forEach(function(f){f.addEventListener('submit',async function(e){e.preventDefault();var msg=f.querySelector('[data-plia-msg]');var btn=f.querySelector('button[type="submit"],input[type="submit"]');var orig=btn?btn.innerHTML:null;if(btn){btn.disabled=true;btn.innerHTML='Enviando...';}try{var res=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}});var d=await res.json().catch(function(){return{};});if(msg){msg.style.display='block';msg.textContent=d.message||(res.ok?'¡Recibido! Te contactaremos pronto.':'No se pudo enviar.');msg.style.color=res.ok?'#16a34a':'#dc2626';}if(res.ok)f.reset();}catch(err){if(msg){msg.style.display='block';msg.textContent='Error de red. Intenta de nuevo.';msg.style.color='#dc2626';}}finally{if(btn){btn.disabled=false;btn.innerHTML=orig;}}});});` : '';
    return `<script>
document.addEventListener('DOMContentLoaded',function(){
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(function(el){o.observe(el);});
// Failsafe: si algo no disparó en 1.2s (sobre el fold), forzar visible.
setTimeout(function(){document.querySelectorAll('.reveal:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight)el.classList.add('in');});},1200);
${formScript}
});
</script>
</body></html>`;
  }

  /** Red de seguridad: garantiza que ningún elemento .reveal quede invisible.
   *  Inyecta CSS visible-por-defecto + un script failsafe antes de </body>. */
  private injectRevealSafety(html: string): string {
    const safetyCss = `<style id="plia-reveal-safety">
.reveal{opacity:1!important;transform:none!important}
.reveal.armed{opacity:0!important;transform:translateY(28px)!important;transition:opacity .7s ease,transform .7s ease}
.reveal.armed.in{opacity:1!important;transform:none!important}
</style>`;
    const safetyJs = `<script id="plia-reveal-js">
(function(){
function run(){
var els=[].slice.call(document.querySelectorAll('.reveal'));
els.forEach(function(el){el.classList.add('armed');});
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
els.forEach(function(el){o.observe(el);});
setTimeout(function(){els.forEach(function(el){el.classList.add('in');});},2000);
}
if(document.readyState!=='loading')run();else document.addEventListener('DOMContentLoaded',run);
})();
</script>`;
    let out = html;
    // Insertar CSS antes de </head> (o al inicio si no hay head)
    if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, `${safetyCss}\n</head>`);
    else out = safetyCss + '\n' + out;
    // Insertar JS antes de </body>
    if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${safetyJs}\n</body>`);
    else out = out + '\n' + safetyJs;
    return out;
  }

  /** Fase 2: genera el documento HTML completo en UNA sola llamada coherente. */
  async renderAll(
    plan: SitePlan,
    brief: string,
    mode: WebMode,
    imageUrls: Record<string, string>,
    clientImages: string[] = [],
    clientLogo?: string,
    formEndpoint?: string,
    imageNotes?: Record<string, string>,
  ): Promise<Record<string, string>> {
    const hasLogo = !!clientLogo && /^https?:\/\//.test(clientLogo);
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    const multimodalImages = hasLogo ? [clientLogo as string, ...validClientImages] : validClientImages;
    const ds = plan.design;
    const imgList = Object.entries(imageUrls).map(([u, url]) => `- ${u}: ${url}`).join('\n');
    // URLs de las imágenes que SUBIÓ el cliente (contenido real del negocio).
    // imageNotes opcional: url → instrucción del cliente sobre dónde/cómo usarla.
    const clientImgList = validClientImages
      .map((u, i) => {
        const note = (imageNotes && imageNotes[u]) ? ` — Instrucción del cliente: "${imageNotes[u]}"` : '';
        return `- imagen_cliente_${i + 1}: ${u}${note}`;
      })
      .join('\n');
    const files: Record<string, string> = {};

    for (const page of plan.pages) {
      const isLanding = mode === 'LANDING' || page.file === 'index.html';

      const sectionsGuide = (isLanding && plan.sections?.length)
        ? plan.sections.map((s, i) => `${i + 1}. [${s.id}] ${s.title}: ${s.brief}`).join('\n')
        : 'Decide las secciones óptimas para vender este negocio según el brief.';

      // Elegir arquetipos de nuestra biblioteca ROTANDO entre los compatibles.
      // seed estable por proyecto (brief) → reproducible, pero distinto entre
      // negocios del mismo rubro (con sal por tipo para descorrelacionar).
      // htmlOnly=true → solo heros ligeros (CSS), nada de WebGL/three.js en landings.
      const seed = (ds.palette?.primary || '') + '|' + brief.slice(0, 200);
      const footer = pickFooterArchetype(ds.vibe, brief, seed + '#footer');
      const hero = pickHeroArchetype(ds.vibe, brief, true, seed + '#hero');
      const heroGuide = `\nHERO — usa este estilo de nuestra biblioteca (adáptalo al negocio, código fresco, SOLO CSS/Tailwind, sin WebGL):\n"${hero.name}": ${hero.pattern}`;
      const footerGuide = `\nFOOTER — usa este estilo de nuestra biblioteca (adáptalo al negocio, código fresco):\n"${footer.name}": ${footer.pattern}`;

      // Arquetipos condicionales: solo si el plan incluye esas secciones
      const sectionIds = (plan.sections || []).map((s) => (s.id || '').toLowerCase()).join(' ');
      let extraGuides = '';
      if (/precio|pricing|plan|tarifa|membres/.test(sectionIds + ' ' + brief.toLowerCase())) {
        const pr = pickPricingArchetype(ds.vibe, brief, seed + '#pricing');
        extraGuides += `\nPRECIOS — si generas sección de precios, usa este estilo:\n"${pr.name}": ${pr.pattern}`;
      }
      if (/testimon|reseñ|review|opinion/.test(sectionIds + ' ' + brief.toLowerCase())) {
        const te = pickTestimonialArchetype(ds.vibe, brief, seed + '#testimonial');
        extraGuides += `\nTESTIMONIOS — usa este estilo:\n"${te.name}": ${te.pattern}`;
      }

      // REFERENCIA 21st: un trozo de CÓDIGO HTML real (destilado de 21st.dev) como
      // ejemplo concreto del nivel/estructura esperada. Claude lo adapta al negocio.
      const refSnips = pickReferenceSnippets(ds.vibe, brief, seed + '#snip', 2);
      const refGuide = refSnips.length
        ? `\n\nREFERENCIAS DE CÓDIGO (patrones reales de nuestra biblioteca 21st — adáptalos al negocio con su contenido/paleta REAL, NO los copies literal; reemplaza IMG_URL por una imagen disponible):\n${refSnips.map((r) => `<!-- patrón "${r.id}" (${r.type}) -->\n${r.html}`).join('\n\n')}`
        : '';

      const system = `${STATIC_RULES}

${PLIA_DESIGN_INTELLIGENCE}

DESIGN SYSTEM (respetar):
- Paleta: primary ${ds.palette.primary}, secondary ${ds.palette.secondary}, accent ${ds.palette.accent}, bg ${ds.palette.bg}, text ${ds.palette.text}
- Tipografía: títulos "${ds.fonts.heading}", cuerpo "${ds.fonts.body}" (Google Fonts)
- Vibe: ${ds.vibe}
${hasLogo ? `LOGO del cliente (OBLIGATORIO: úsalo en el nav y en el footer): ${clientLogo}` : ''}
${clientImgList ? `IMÁGENES REALES DEL CLIENTE (CONTENIDO REAL DEL NEGOCIO — son OBLIGATORIAS, úsalas con su URL exacta donde corresponda según cada instrucción; tienen PRIORIDAD sobre las imágenes IA):
${clientImgList}
` : ''}IMÁGENES IA DISPONIBLES (fotos de stock generadas; usa SOLO estas URLs exactas, NO inventes; si una imagen del cliente cubre el slot, prefiérela):
${imgList || '(sin imágenes)'}
${formEndpoint ? `FORMULARIO: <form action="${formEndpoint}" method="POST" data-plia-contact> con name,email,phone,message + <input type="text" name="_honeypot" tabindex="-1" style="position:absolute;left:-9999px"> + <p data-plia-msg style="display:none"></p>` : ''}

ANTI-SOLAPAMIENTO (CRÍTICO): flujo normal de documento, secciones apiladas. PROHIBIDO position:absolute salvo imagen de fondo del hero (dentro de hero relative overflow-hidden). Sin márgenes negativos ni heights que recorten.

GENERA LA PÁGINA COMPLETA Y RICA: TODAS las secciones del plan, con detalle premium. Tienes presupuesto amplio de tokens — NO te limites, pero DEBE terminar con </body></html>. Cada sección rica, contenido real, diseño nivel Awwwards. nav, hero, todas las secciones del plan, contacto y footer.`;

      const user = `Brief del negocio:\n${brief}\n\nGenera la LANDING COMPLETA Y RICA (documento HTML entero: <!DOCTYPE html> hasta </html>).\nSecciones (en orden, adapta al brief, hazlas todas ricas y detalladas):\n${sectionsGuide}\n${heroGuide}\n${footerGuide}${extraGuides}${refGuide}\n\nDebe terminar COMPLETA con </body></html>. Diseño nivel Awwwards, español real, sin solapamientos.${hasLogo ? ' La primera imagen adjunta es el logo.' : ''}`;

      let html = await this.completeClaudeWithRetry(
        system,
        [{ role: 'user', content: user }],
        { model: MODEL_SONNET, maxTokens: 20000, temperature: 0.6, images: multimodalImages },
        `render-${page.file}`,
      );
      html = this.stripFences(html);

      // Si truncó, cerrar limpio desde el último cierre de sección
      if (!/<\/html>/i.test(html)) {
        const candidates = ['</footer>', '</section>', '</main>'];
        let cut = -1;
        for (const t of candidates) {
          const idx = html.lastIndexOf(t);
          if (idx > html.length * 0.4) { cut = idx + t.length; break; }
        }
        if (cut > 0) html = html.slice(0, cut);
        if (!/<\/body>/i.test(html)) html += '\n</body>';
        if (!/<\/html>/i.test(html)) html += '\n</html>';
      }

      html = enforcePremiumQuality(html, formEndpoint);
      if (formEndpoint) html = enforceContactForms(html, formEndpoint);
      html = this.injectRevealSafety(html); // red de seguridad anti opacity:0
      files[page.file] = html;
    }

    if (!files['index.html']) {
      const firstKey = Object.keys(files)[0];
      if (firstKey) files['index.html'] = files[firstKey];
    }
    return files;
  }

  /**
   * Edicion QUIRURGICA: aplica una solicitud de revision a HTML que ya
   * existe. Cero plan, cero DALL-E, cero regeneracion desde scratch.
   *
   * Para CADA pagina existente:
   *   1) Pasa el HTML actual + la solicitud del cliente
   *   2) Claude devuelve el HTML modificado preservando todo lo demas
   *   3) Si Claude considera que la pagina no requiere cambios, retorna
   *      el mismo HTML (idempotente)
   *
   * Costo aprox: 1 llamada Sonnet por pagina, sin imagenes nuevas.
   * Para un LANDING tipico: ~$0.05-0.15 vs $0.55+ de una regeneracion full.
   */
  async editPages(
    existingPages: Record<string, string>,
    revisionNote: string,
    brief: string,
    clientImages: string[] = [],
    clientLogo?: string,
    formEndpoint?: string,
  ): Promise<Record<string, string>> {
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    const hasLogo = !!clientLogo && /^https?:\/\//.test(clientLogo);
    const multimodalImages = hasLogo
      ? [clientLogo as string, ...validClientImages]
      : validClientImages;

    const system = `Estas EDITANDO una pagina HTML que YA EXISTE y esta publicada. Tu trabajo es aplicar una solicitud de cambio del cliente de forma QUIRURGICA — modifica EXCLUSIVAMENTE lo que el cliente esta pidiendo y deja TODO LO DEMAS intacto.

REGLAS DURAS:
1. PRESERVAR EXACTAMENTE: la paleta de colores, las fuentes, la estructura general, los breakpoints responsive, los scripts, los meta tags, el head completo, y todas las secciones que el cliente NO mencione.
2. PRESERVAR las URLs de imagenes existentes. NO inventes ni cambies URLs de imagenes salvo que el cliente lo pida explicitamente.
3. PRESERVAR los formularios (action, method, campos hidden como _honeypot) salvo que el cliente pida cambiarlos.
4. SOLO modifica el texto, color, seccion, o elemento que el cliente esta pidiendo en su solicitud.
5. Si la solicitud del cliente NO aplica a esta pagina, devuelve la pagina EXACTAMENTE igual sin cambios.
6. Mantén el doctype html5 y la estructura <html><head><body>.
7. NO agregues "estoy editando..." ni comentarios sobre el proceso. Solo devuelve el HTML final.

CONTEXTO DEL NEGOCIO (para que entiendas el sitio):
${brief.slice(0, 1500)}

SALIDA: devuelve SOLO el HTML completo modificado. Sin explicaciones, sin cercas \`\`\`. Empieza por <!DOCTYPE html>.`;

    const edited: Record<string, string> = {};
    for (const [file, html] of Object.entries(existingPages)) {
      const userMsg = `HTML ACTUAL de la pagina "${file}":

\`\`\`
${html}
\`\`\`

=== SOLICITUD DEL CLIENTE ===
${revisionNote.trim()}

Devuelve el HTML completo de la pagina con el cambio aplicado. Si esta solicitud no aplica a esta pagina (porque trata de otra seccion/pagina), devuelve el mismo HTML sin modificar.`;

      const raw = await this.completeClaudeWithRetry(
        system,
        [{ role: 'user', content: userMsg }],
        {
          model: MODEL_SONNET,
          maxTokens: 24000,
          temperature: 0.3,
          images: multimodalImages,
        },
        'edit-page',
      );
      const cleaned = this.stripFences(raw);
      // Sanity check: si Claude devolvio algo muy chiquito comparado con
      // el HTML original, probablemente algo salio mal y mejor preservamos
      // el original que arruinar la pagina.
      if (cleaned.length < Math.max(500, html.length * 0.3)) {
        this.logger.warn(
          `editPages: respuesta sospechosamente chica para ${file} (${cleaned.length} chars vs ${html.length} original). Preservando original.`,
        );
        edited[file] = html;
      } else {
        edited[file] = cleaned;
      }
      // Garantizar reglas de calidad premium + form aunque sea una edicion.
      // Idempotente: si ya cumplian, no cambia nada. Si Claude rompio algo
      // o el sitio venia de una version anterior con JSX literal / mailto /
      // GSAP faltante, este paso lo arregla.
      edited[file] = enforcePremiumQuality(edited[file], formEndpoint);
      if (formEndpoint) {
        edited[file] = enforceContactForms(edited[file], formEndpoint);
      }
    }
    return edited;
  }
}
