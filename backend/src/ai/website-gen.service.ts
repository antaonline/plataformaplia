import { Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, FallbackProvider } from '../experimental/iachat/generation/providers';
import { enforceContactForms } from './contact-form-enforcer';

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
}

const MODEL_SONNET =
  process.env.ANTHROPIC_MODEL_SONNET ||
  process.env.ANTHROPIC_MODEL ||
  'claude-sonnet-4-6';

const STATIC_RULES = `Generas SITIOS WEB ESTATICOS de calidad de agencia premium (HTML + Tailwind via CDN). REGLAS DURAS:
- Cada pagina es un .html COMPLETO y autocontenido: <!DOCTYPE html>, <head> con <script src="https://cdn.tailwindcss.com"></script>, Google Fonts via <link>, y <body>.
- PROHIBIDO React/JSX/build tools/imports. Solo HTML + clases Tailwind + JS vanilla minimo si hace falta.
- Contenido REAL y persuasivo en espanol especifico del negocio (NADA de lorem ipsum ni placeholders).
- Diseno cohesivo: respeta SIEMPRE la paleta y tipografia del design system dado. Espaciado generoso, jerarquia tipografica fuerte, secciones ricas, responsive impecable, microinteracciones CSS sutiles.
- Usa EXACTAMENTE las URLs de imagen que se te entreguen (no inventes URLs de imagen).`;

@Injectable()
export class WebsiteGenService {
  private readonly logger = new Logger(WebsiteGenService.name);
  private provider = new FallbackProvider([PROVIDERS.claude, PROVIDERS.openai]);

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
        ? 'Es una LANDING: EXACTAMENTE 1 pagina de ventas (index.html). PROHIBIDO paginas internas.'
        : 'Es una WEB INSTITUCIONAL: entre 2 y 5 paginas internas (index.html + p.ej. nosotros.html, contacto.html, y las que pida el rubro). Se enlazan entre si.';
    const system = `${STATIC_RULES}\n\nDevuelve SOLO este JSON valido (sin texto fuera):
{
 "projectName":"...",
 "design":{"vibe":"...","palette":{"primary":"#hex","secondary":"#hex","accent":"#hex","bg":"#hex","text":"#hex"},"fonts":{"heading":"Google Font","body":"Google Font"}},
 "pages":[{"file":"index.html","purpose":"que contiene"}],
 "imagePrompts":[{"id":"hero","prompt":"prompt en ingles para DALL-E, fotorealista, alta calidad","usage":"hero"}]
}
${pageRule}
imagePrompts: 3-6 imagenes necesarias para el sitio (hero, secciones, etc.). Las imagenes que suba el cliente (si las hay) las VES en este mensaje: son contenido REAL del negocio (logo, fotos del local, productos, equipo, etc). PRIORIDAD: estas imagenes del cliente DEBEN usarse en el sitio final donde correspondan (logo en el header, fotos del local en hero/ubicacion, fotos de productos en galeria, fotos del equipo en seccion equipo, etc). SOLO genera prompts en imagePrompts para cubrir SLOTS que las imagenes del cliente NO cubren. Si el cliente sube 3 fotos de productos, no generes prompts adicionales para productos — usa las del cliente.`;
    // El logo va primero en el array de imagenes multimodales para que la
    // IA lo VEA y pueda identificarlo (por su forma/transparencia/copy).
    const multimodalImages = clientLogo ? [clientLogo, ...clientImages] : clientImages;
    const raw = await this.provider.complete(
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
        ? parsed!.imagePrompts.filter((x) => x && x.prompt).slice(0, 6)
        : [],
    };
    return safe;
  }

  /** Fase 2: genera el HTML completo de cada pagina (sin JSON, calidad alta). */
  async renderAll(
    plan: SitePlan,
    brief: string,
    mode: WebMode,
    imageUrls: Record<string, string>,
    clientImages: string[] = [],
    clientLogo?: string,
    formEndpoint?: string,
  ): Promise<Record<string, string>> {
    const ds = plan.design;
    const imgList = Object.entries(imageUrls)
      .map(([usage, url]) => `- ${usage}: ${url}`)
      .join('\n');
    const clientImgList = clientImages
      .filter((s) => /^https?:\/\//.test(s))
      .map((u, i) => `- imagen_cliente_${i + 1}: ${u}`)
      .join('\n');
    const hasLogo = !!clientLogo && /^https?:\/\//.test(clientLogo);
    const system = `${STATIC_RULES}

DESIGN SYSTEM (respetar al pie de la letra):
- Vibe: ${ds.vibe}
- Paleta: primary ${ds.palette.primary}, secondary ${ds.palette.secondary}, accent ${ds.palette.accent}, bg ${ds.palette.bg}, text ${ds.palette.text}
- Tipografia: titulos "${ds.fonts.heading}", cuerpo "${ds.fonts.body}" (cargar via Google Fonts <link> y aplicar)
ARQUITECTURA (${mode}):
${plan.pages.map((p) => `- ${p.file}: ${p.purpose}`).join('\n')}
${mode === 'WEB' ? 'Enlaza las paginas entre si con <a href="archivo.html"> (mismo directorio).' : 'Una sola pagina, sin navegacion a otras paginas.'}
${hasLogo ? `LOGO OFICIAL DEL CLIENTE (es EL logo de la marca, OBLIGATORIO usarlo):
- imagen_cliente_logo: ${clientLogo}
INSTRUCCIONES DURAS PARA EL LOGO:
1. Colocalo en el HEADER/NAV de la pagina (esquina superior izquierda, tamano apropiado tipo h-8 o h-10 Tailwind).
2. Tambien puede ir en el FOOTER como brand mark.
3. El logo se ve en este mensaje (multimodal): respeta su forma original.
4. Si el logo tiene fondo transparente (PNG sin fondo), lucira limpio sobre cualquier color del header.
5. NO lo reemplaces por iconos genericos, texto, ni imagenes IA aunque el plan sugiera otra cosa para el header.
` : ''}
IMAGENES GENERADAS POR IA (usa estas URLs reales, NO inventes):
${imgList || '(sin imagenes IA generadas)'}
${clientImgList ? `IMAGENES DEL CLIENTE (CONTENIDO REAL DEL NEGOCIO — son OBLIGATORIAS):
${clientImgList}
INSTRUCCIONES DURAS PARA LAS IMAGENES DEL CLIENTE:
1. Las puedes VER en este mensaje (son multimodales). Analiza qué muestra cada una: ¿es un logo? ¿el interior del local? ¿productos? ¿el equipo? ¿una foto promocional?
2. USALAS en la web final con las URLs imagen_cliente_N exactas. NO inventes URLs.
3. Si imagen_cliente_1 es un logo -> ponlo en el header/nav y/o como brand mark.
4. Si son fotos de productos/figuras/objetos -> usalas en la galeria o seccion de productos.
5. Si son fotos del local/espacio -> hero o seccion de ubicacion/ambiente.
6. Si son fotos del equipo/personas -> seccion equipo o testimonios.
7. Las imagenes del cliente TIENEN PRIORIDAD sobre las generadas por IA en su categoria.
8. Si NO hay imagen IA para un slot Y hay imagen cliente apropiada -> usa la del cliente.
` : ''}
${formEndpoint ? `FORMULARIOS DE CONTACTO (OBLIGATORIO si el brief pide contacto/reservas/consulta/cotizacion):
- Si la pagina necesita un formulario, su accion DEBE ser:
    <form action="${formEndpoint}" method="POST" data-plia-contact>
- NUNCA uses formsubmit.co, getform.io, mailto:, ni ningun servicio externo.
- Campos minimos obligatorios: name (required), email (required, type=email), message (required, textarea).
- Campos opcionales segun rubro: phone, subject, business, date, time, party_size, etc.
- INCLUYE SIEMPRE este campo honeypot oculto (anti-spam, no quitar):
    <input type="text" name="_honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true">
- Coloca DENTRO del form un elemento para mensajes:
    <p data-plia-msg style="margin-top:12px;font-size:14px;display:none;"></p>
- Al final de la pagina (justo antes de </body>), INCLUYE EXACTAMENTE este script para UX inline sin recargar:
<script>
document.querySelectorAll('form[data-plia-contact]').forEach(function(f){
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var msg = f.querySelector('[data-plia-msg]');
    var btn = f.querySelector('button[type="submit"], input[type="submit"]');
    var origBtn = btn ? btn.innerHTML : null;
    if(btn){ btn.disabled = true; btn.innerHTML = 'Enviando...'; }
    try {
      var res = await fetch(f.action, { method:'POST', body:new FormData(f), headers:{'Accept':'application/json'} });
      var data = await res.json().catch(function(){return {};});
      if(msg){ msg.style.display='block'; msg.textContent = data.message || (res.ok?'¡Recibido! Te contactaremos pronto.':'No se pudo enviar.'); msg.style.color = res.ok ? '#16a34a' : '#dc2626'; }
      if(res.ok){ f.reset(); }
    } catch(err){
      if(msg){ msg.style.display='block'; msg.textContent = 'Error de red. Intenta de nuevo.'; msg.style.color = '#dc2626'; }
    } finally {
      if(btn){ btn.disabled = false; btn.innerHTML = origBtn; }
    }
  });
});
</script>
` : ''}
SALIDA: devuelve SOLO el HTML completo de la pagina pedida. Sin explicaciones, sin cercas \`\`\`. Empieza por <!DOCTYPE html>.`;

    const files: Record<string, string> = {};
    // Pasamos las imagenes del cliente como multimodales tambien en el
    // render para que Claude/Gemini VEA su contenido (no solo el URL) y
    // pueda decidir donde encajan visualmente. El logo va primero.
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    const multimodalImages = hasLogo
      ? [clientLogo as string, ...validClientImages]
      : validClientImages;
    for (const page of plan.pages) {
      const user = `Brief del negocio:\n${brief}\n\nGenera AHORA la pagina: ${page.file}\nProposito: ${page.purpose}${hasLogo ? '\nNota: la PRIMERA imagen adjunta es el LOGO del cliente.' : ''}\nDevuelve solo el HTML completo.`;
      const raw = await this.provider.complete(
        system,
        [{ role: 'user', content: user }],
        {
          model: MODEL_SONNET,
          maxTokens: 16000,
          temperature: 0.7,
          images: multimodalImages,
        },
      );
      // Enforce contact form rules: aunque el system prompt lo dice,
      // Claude a veces omite el action, honeypot, script de submit, o
      // traduce los names a espanol. Este post-procesado garantiza que
      // todo form de contacto generado va al endpoint correcto y envia.
      files[page.file] = enforceContactForms(
        this.stripFences(raw),
        formEndpoint,
      );
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

      const raw = await this.provider.complete(
        system,
        [{ role: 'user', content: userMsg }],
        {
          model: MODEL_SONNET,
          maxTokens: 32000, // mas alto: el HTML de entrada puede ser grande
          temperature: 0.3, // baja temperatura = ediciones predecibles
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
      // Garantizar reglas de form aunque sea una edicion. Si el form ya
      // estaba bien, no cambia nada (idempotente). Si Claude lo preservo
      // pero estaba roto, este paso lo arregla.
      if (formEndpoint) {
        edited[file] = enforceContactForms(edited[file], formEndpoint);
      }
    }
    return edited;
  }
}
