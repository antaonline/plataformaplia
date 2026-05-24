import { Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, FallbackProvider } from '../experimental/iachat/generation/providers';

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
    const raw = await this.provider.complete(
      system,
      [{ role: 'user', content: brief }],
      { model: MODEL_SONNET, json: true, maxTokens: 3000, images: clientImages },
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
  ): Promise<Record<string, string>> {
    const ds = plan.design;
    const imgList = Object.entries(imageUrls)
      .map(([usage, url]) => `- ${usage}: ${url}`)
      .join('\n');
    const clientImgList = clientImages
      .filter((s) => /^https?:\/\//.test(s))
      .map((u, i) => `- imagen_cliente_${i + 1}: ${u}`)
      .join('\n');
    const system = `${STATIC_RULES}

DESIGN SYSTEM (respetar al pie de la letra):
- Vibe: ${ds.vibe}
- Paleta: primary ${ds.palette.primary}, secondary ${ds.palette.secondary}, accent ${ds.palette.accent}, bg ${ds.palette.bg}, text ${ds.palette.text}
- Tipografia: titulos "${ds.fonts.heading}", cuerpo "${ds.fonts.body}" (cargar via Google Fonts <link> y aplicar)
ARQUITECTURA (${mode}):
${plan.pages.map((p) => `- ${p.file}: ${p.purpose}`).join('\n')}
${mode === 'WEB' ? 'Enlaza las paginas entre si con <a href="archivo.html"> (mismo directorio).' : 'Una sola pagina, sin navegacion a otras paginas.'}
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
SALIDA: devuelve SOLO el HTML completo de la pagina pedida. Sin explicaciones, sin cercas \`\`\`. Empieza por <!DOCTYPE html>.`;

    const files: Record<string, string> = {};
    // Pasamos las imagenes del cliente como multimodales tambien en el
    // render para que Claude/Gemini VEA su contenido (no solo el URL) y
    // pueda decidir donde encajan visualmente.
    const validClientImages = clientImages.filter((s) => /^https?:\/\//.test(s));
    for (const page of plan.pages) {
      const user = `Brief del negocio:\n${brief}\n\nGenera AHORA la pagina: ${page.file}\nProposito: ${page.purpose}\nDevuelve solo el HTML completo.`;
      const raw = await this.provider.complete(
        system,
        [{ role: 'user', content: user }],
        {
          model: MODEL_SONNET,
          maxTokens: 16000,
          temperature: 0.7,
          images: validClientImages,
        },
      );
      files[page.file] = this.stripFences(raw);
    }
    if (!files['index.html']) {
      const firstKey = Object.keys(files)[0];
      if (firstKey) files['index.html'] = files[firstKey];
    }
    return files;
  }
}
