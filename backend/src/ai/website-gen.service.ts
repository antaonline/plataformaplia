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

LIBRERIAS PREMIUM OBLIGATORIAS (cargar via CDN en <head> o antes de </body>):
- GSAP + ScrollTrigger:
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  USALOS: parallax leve del hero (yPercent o background scroll), reveal on scroll de
  secciones (gsap.from con opacity:0 y y:30), counters animados para stats, fade
  de elementos al entrar al viewport. SIEMPRE registrar el plugin: gsap.registerPlugin(ScrollTrigger).
- (opcional pero recomendado para ricas microinteracciones) Lenis para smooth scroll:
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.42/bundled/lenis.min.js"></script>

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

NOTA: Recibirás instrucciones específicas de QUÉ secciones generar en cada llamada. Genera SOLO esas secciones, completas y ricas. Cada seccion debe ser VISUALMENTE DISTINTA de las demás: alterna fondos claro/oscuro usando las variables CSS, alterna layouts (centrado/split/grid), añade data-gsap a los elementos para reveal animado al scroll.`;

@Injectable()
export class WebsiteGenService {
  private readonly logger = new Logger(WebsiteGenService.name);
  // Plan y render: Claude primero (mejor diseño), GPT-4o como respaldo
  private planProvider = new FallbackProvider([PROVIDERS.claude, PROVIDERS.openai]);
  private renderProvider = new FallbackProvider([PROVIDERS.claude, PROVIDERS.openai]);

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
    const raw = await this.planProvider.complete(
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

  /** Genera el HTML de un bloque de secciones (máx ~3500 tokens output). */
  private async renderBlock(
    sections: string[],
    isFirst: boolean,
    isLast: boolean,
    design: SitePlan['design'],
    brief: string,
    imageUrls: Record<string, string>,
    hasLogo: boolean,
    clientLogo: string | undefined,
    clientImages: string[],
    formEndpoint: string | undefined,
    mode: WebMode,
  ): Promise<string> {
    const ds = design;
    const imgList = Object.entries(imageUrls).map(([u, url]) => `- ${u}: ${url}`).join('\n');
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    const multimodalImages = hasLogo ? [clientLogo as string, ...validClientImages] : validClientImages;

    const headFragment = isFirst ? `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(ds.fonts.heading)}:wght@400;600;700;800;900&family=${encodeURIComponent(ds.fonts.body)}:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root { --primary: ${ds.palette.primary}; --accent: ${ds.palette.accent}; --bg: ${ds.palette.bg}; --text: ${ds.palette.text}; }
    body { font-family: '${ds.fonts.body}', sans-serif; background: var(--bg); color: var(--text); margin: 0; }
    h1,h2,h3,h4 { font-family: '${ds.fonts.heading}', sans-serif; }
  </style>
</head>
<body>` : '';

    const closingFragment = isLast ? `
<script>
gsap.registerPlugin(ScrollTrigger);
${formEndpoint ? `document.querySelectorAll('form[data-plia-contact]').forEach(function(f){f.addEventListener('submit',async function(e){e.preventDefault();var msg=f.querySelector('[data-plia-msg]');var btn=f.querySelector('button[type="submit"]');var orig=btn?btn.innerHTML:null;if(btn){btn.disabled=true;btn.innerHTML='Enviando...';}try{var res=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}});var d=await res.json().catch(function(){return{};});if(msg){msg.style.display='block';msg.textContent=d.message||(res.ok?'¡Recibido! Te contactaremos pronto.':'No se pudo enviar.');msg.style.color=res.ok?'#16a34a':'#dc2626';}if(res.ok)f.reset();}catch(err){if(msg){msg.style.display='block';msg.textContent='Error de red.';msg.style.color='#dc2626';}}finally{if(btn){btn.disabled=false;btn.innerHTML=orig;}}});});` : ''}
gsap.utils.toArray('[data-gsap]').forEach(function(el){gsap.from(el,{opacity:0,y:30,duration:0.7,scrollTrigger:{trigger:el,start:'top 85%'}});});
</script>
</body></html>` : '';

    const sectionsList = sections.join('\n');
    const system = `${STATIC_RULES}

DESIGN SYSTEM:
- Paleta: primary ${ds.palette.primary}, accent ${ds.palette.accent}, bg ${ds.palette.bg}, text ${ds.palette.text}
- Fuentes: titulos "${ds.fonts.heading}", cuerpo "${ds.fonts.body}"
- Vibe: ${ds.vibe || 'moderno premium'}
${hasLogo ? `- Logo cliente URL: ${clientLogo} — usarlo en nav y footer` : ''}
IMAGENES DISPONIBLES (usa estas URLs exactas):
${imgList || '(sin imagenes IA)'}
${formEndpoint ? `FORMULARIO: action="${formEndpoint}" method="POST" data-plia-contact` : ''}

TAREA: Genera SOLO el HTML de las siguientes secciones (sin <html>, sin <head>, sin <body>, sin scripts globales — solo el contenido de las secciones):
${sectionsList}

Cada seccion: usa clases Tailwind + add data-gsap en elementos para animacion al scroll. Contenido REAL del brief. Visualmente distinto de las otras secciones.
SALIDA: solo el HTML de esas secciones. Sin <!DOCTYPE>, sin <head>, sin <body>, sin scripts. Solo los tags de las secciones.`;

    const raw = await this.renderProvider.complete(
      system,
      [{ role: 'user', content: `Brief:\n${brief}\n\nGenera el HTML de las secciones indicadas.${hasLogo ? '\nPrimera imagen = logo del cliente.' : ''}` }],
      { model: MODEL_SONNET, maxTokens: 8000, temperature: 0.55, images: multimodalImages },
    );
    const cleaned = this.stripFences(raw);
    return headFragment + '\n' + cleaned + '\n' + closingFragment;
  }

  /** Fase 2: genera HTML por bloques de secciones — nunca se trunca. */
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
    const files: Record<string, string> = {};

    for (const page of plan.pages) {
      const isLanding = mode === 'LANDING' || page.file === 'index.html';
      const img0 = Object.values(imageUrls)[0] || '';

      // Secciones dinámicas decididas por la IA según el brief del cliente.
      const planSections = (isLanding && plan.sections?.length) ? plan.sections : [];
      const sectionInstructions: string[] = [];

      // NAV siempre primero
      sectionInstructions.push(
        '<nav> sticky top-0 z-50 backdrop-blur: logo/marca izquierda, links de navegacion al centro (anclas a las secciones), CTA pill color accent derecha. Hamburguesa en mobile.',
      );

      if (planSections.length) {
        for (const s of planSections) {
          const id = (s.id || '').toLowerCase();
          if (id === 'nav' || id === 'footer' || id === 'header') continue;
          if (id === 'hero') {
            sectionInstructions.push(
              `<section id="hero"> min-h-screen relative flex items-center overflow-hidden. Imagen fondo absolute inset-0 w-full h-full object-cover con overlay gradient oscuro 3 stops. Contenido relative z-10: badge superior, titulo clamp(3rem,7vw,6rem) font-black tracking-tight text-white, subtitulo max-w-2xl, 2 CTAs (accent sólido + outline). data-gsap. CONTENIDO: ${s.brief}`,
            );
          } else {
            sectionInstructions.push(
              `<section id="${id}"> py-24, fondo alternado (var(--bg) o var(--primary), distinto a la seccion anterior). SECCION "${s.title}". NARRATIVA Y CONTENIDO: ${s.brief}. Layout apropiado (grid/split/cards), iconos SVG Lucide, imagenes disponibles donde aplique, data-gsap. Diseño nivel Awwwards.`,
            );
          }
        }
      } else {
        sectionInstructions.push(
          `<section id="hero"> min-h-screen con imagen fondo (${img0}), overlay, titulo huge, 2 CTAs. data-gsap.`,
          `<section id="beneficios"> py-24 grid 3 col con iconos SVG.`,
          `<section id="servicios"> py-24 servicios/productos en cards.`,
          `<section id="galeria"> py-24 grid de imagenes con hover scale.`,
          `<section id="testimonios"> py-24 3 testimonios con avatar y estrellas.`,
        );
      }

      // CONTACTO (si la IA no lo incluyó) + FOOTER siempre al final
      if (!sectionInstructions.some((s) => /id="contacto"/.test(s))) {
        sectionInstructions.push(
          `<section id="contacto"> py-24 bg-[var(--primary)] text-white. Grid 2 col: izquierda texto + datos contacto + redes SVG; derecha formulario${formEndpoint ? ` action="${formEndpoint}" method="POST" data-plia-contact` : ''} con campos nombre/email/telefono/mensaje.${formEndpoint ? ' Honeypot oculto name="_honeypot" + <p data-plia-msg style="display:none"></p>.' : ''} data-gsap.`,
        );
      }
      sectionInstructions.push(
        `<footer> py-16 bg-[#0a0a0a] text-gray-400. Multi-columna: marca+descripcion, links navegacion, redes sociales SVG (Instagram/Facebook/WhatsApp/TikTok del brief), contacto. Copyright ${new Date().getFullYear()}.`,
      );

      // Repartir en bloques de 3 secciones (cada bloque cabe en 8192 tokens)
      const PER_BLOCK = 3;
      const groups: string[][] = [];
      for (let i = 0; i < sectionInstructions.length; i += PER_BLOCK) {
        groups.push(sectionInstructions.slice(i, i + PER_BLOCK));
      }

      const blocks: string[] = [];
      for (let i = 0; i < groups.length; i++) {
        const block = await this.renderBlock(
          groups[i],
          i === 0,
          i === groups.length - 1,
          plan.design,
          brief,
          imageUrls,
          hasLogo,
          clientLogo,
          clientImages,
          formEndpoint,
          mode,
        );
        blocks.push(block);
      }

      let html = blocks.join('\n');
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

      const raw = await this.renderProvider.complete(
        system,
        [{ role: 'user', content: userMsg }],
        {
          model: MODEL_SONNET,
          maxTokens: 16000,
          temperature: 0.3,
          images: multimodalImages,
        },
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
