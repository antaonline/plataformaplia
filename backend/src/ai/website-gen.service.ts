import { Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, FallbackProvider } from '../experimental/iachat/generation/providers';
import { enforceContactForms } from './contact-form-enforcer';
import { enforcePremiumQuality } from './premium-quality-enforcer';

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

ANIMACIÓN SEGURA (incluir SIEMPRE en el <head> o antes de </body>):
<style>.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}.reveal.in{opacity:1;transform:none}</style>
<script>document.addEventListener('DOMContentLoaded',function(){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in')})},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){o.observe(el)});});</script>
Para animar una seccion al scroll, agrega class="reveal" al elemento. NUNCA uses opacity:0 de otra forma — si el observer no corre, .reveal igual se ve por el fallback. Es la ÚNICA forma de animar permitida.

Cada seccion debe ser VISUALMENTE DISTINTA: alterna fondos claro/oscuro, alterna layouts (centrado/split/grid). El sitio fluye verticalmente, secciones apiladas, sin solapamientos.`;

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

  /** Fase 2: genera el HTML completo de cada página en UNA sola llamada coherente. */
  async renderAll(
    plan: SitePlan,
    brief: string,
    mode: WebMode,
    imageUrls: Record<string, string>,
    clientImages: string[] = [],
    clientLogo?: string,
    formEndpoint?: string,
  ): Promise<Record<string, string>> {
    const hasLogo = !!clientLogo && /^https?:\/\//.test(clientLogo);
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    const multimodalImages = hasLogo ? [clientLogo as string, ...validClientImages] : validClientImages;
    const ds = plan.design;
    const imgList = Object.entries(imageUrls).map(([u, url]) => `- ${u}: ${url}`).join('\n');
    const files: Record<string, string> = {};

    for (const page of plan.pages) {
      const isLanding = mode === 'LANDING' || page.file === 'index.html';

      // Las secciones las DECIDIÓ la IA en el plan según el brief. Solo las listamos como guía.
      const sectionsGuide = (isLanding && plan.sections?.length)
        ? plan.sections.map((s, i) => `${i + 1}. [${s.id}] ${s.title}: ${s.brief}`).join('\n')
        : `Decide tú las secciones óptimas para vender este negocio según el brief.`;

      const system = `${STATIC_RULES}

DESIGN SYSTEM (respetar al pie de la letra):
- Paleta: primary ${ds.palette.primary}, secondary ${ds.palette.secondary}, accent ${ds.palette.accent}, bg ${ds.palette.bg}, text ${ds.palette.text}
- Tipografia: titulos "${ds.fonts.heading}", cuerpo "${ds.fonts.body}" (cargar via Google Fonts)
- Vibe: ${ds.vibe}
${hasLogo ? `\nLOGO DEL CLIENTE (obligatorio en nav y footer): ${clientLogo}` : ''}
IMAGENES DISPONIBLES (usa SOLO estas URLs, no inventes):
${imgList || '(sin imagenes IA)'}
${formEndpoint ? `\nFORMULARIO DE CONTACTO: <form action="${formEndpoint}" method="POST" data-plia-contact> con campos name(required), email(required), phone, message(required, textarea). Incluye <input type="text" name="_honeypot" tabindex="-1" style="position:absolute;left:-9999px"> y <p data-plia-msg style="display:none"></p> dentro del form.` : ''}

REGLAS ANTI-SOLAPAMIENTO (CRÍTICAS — evitan que la web se vea rota):
- FLUJO NORMAL DE DOCUMENTO: cada <section> es un bloque hermano apilado verticalmente. NADA de position:absolute salvo la imagen de fondo del hero (que va absolute inset-0 DENTRO de un hero relative + overflow-hidden).
- PROHIBIDO position:absolute/fixed en secciones que no sean el hero. PROHIBIDO margenes negativos grandes. PROHIBIDO height fijo que recorte contenido.
- Cada seccion: ancho completo, padding vertical generoso (py-20/py-28), contenido en un contenedor max-w-7xl mx-auto px-6.
- ANIMACIONES SEGURAS: los elementos deben ser VISIBLES por defecto. Para animar al scroll usa SOLO clase "reveal" (definida en el CSS del head: opacity:0→1 vía IntersectionObserver que YA está incluido). NUNCA uses opacity:0 inline sin el observer, ni GSAP que deje elementos invisibles.

ESTRUCTURA: ${isLanding ? 'UNA landing de ventas de UNA pagina, con TODAS las secciones del plan en orden, fluyendo verticalmente. Empieza con <nav> sticky y termina con <footer>.' : `Pagina "${page.file}": ${page.purpose}. Nav sticky + secciones + footer.`}

SALIDA: HTML COMPLETO Y VÁLIDO desde <!DOCTYPE html> hasta </html>. Debe estar COMPLETO — cierra todas las etiquetas. Sin markdown, sin explicaciones.`;

      const user = `Brief del negocio:\n${brief}\n\nSECCIONES A GENERAR (decididas según el brief, respeta el orden y el contenido de cada una):\n${sectionsGuide}\n\nGenera la pagina ${page.file} COMPLETA, coherente, sin solapamientos, nivel Awwwards.${hasLogo ? '\nLa primera imagen adjunta es el logo del cliente.' : ''}`;

      let html = await this.completeClaudeWithRetry(
        system,
        [{ role: 'user', content: user }],
        { model: MODEL_SONNET, maxTokens: 8000, temperature: 0.6, images: multimodalImages },
        `render-${page.file}`,
      );
      html = this.stripFences(html);

      // Si truncó, cerrar limpio desde el último tag de sección/footer completo
      if (!/<\/html>/i.test(html)) {
        const candidates = ['</footer>', '</section>', '</main>'];
        let cut = -1;
        for (const tag of candidates) {
          const idx = html.lastIndexOf(tag);
          if (idx > html.length * 0.4) { cut = idx + tag.length; break; }
        }
        if (cut > 0) html = html.slice(0, cut);
        html += '\n</body>\n</html>';
      }

      html = enforcePremiumQuality(html, formEndpoint);
      if (formEndpoint) html = enforceContactForms(html, formEndpoint);
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
          maxTokens: 8000,
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
