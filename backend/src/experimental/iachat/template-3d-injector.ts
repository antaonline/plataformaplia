/**
 * Detector e inyector de templates 3D pre-armados.
 *
 * Cuando el cliente confirma un template desde el Templates3DDialog del
 * frontend, el mensaje llega al backend con la forma:
 *
 *   [TEMPLATE_3D]<slug>[/TEMPLATE_3D]
 *   Quiero que agregues esta pagina 3D...
 *   === HTML COMPLETO DEL TEMPLATE ===
 *   <!DOCTYPE html>...
 *   === FIN HTML ===
 *   ```json
 *   { "templateSlug": "...", "input": {...} }
 *   ```
 *
 * En vez de mandar todo eso a Claude (que cuesta ~$0.25 y a veces
 * "interpreta" el HTML rompiendolo), este modulo detecta el marcador,
 * extrae el HTML tal cual, y lo persiste DIRECTAMENTE como pagina del
 * proyecto. Cero tokens consumidos.
 *
 * Destino del HTML:
 *   - Como tenemos proyectos Next.js, el HTML autocontenido (con Three.js
 *     CDN + DOCTYPE completo) no encaja como page Next directa. Lo
 *     envolvemos en un componente React que monta el HTML en un iframe
 *     srcDoc. El HTML se codifica en base64 dentro del .tsx para evitar
 *     pesadillas de escape de backticks y ${...}.
 *   - Archivos generados:
 *       app/showcase/page.tsx       (Next route)
 *       lib/showcase-html.ts        (HTML base64 + decoder)
 */

const RE_TEMPLATE_TAG = /\[TEMPLATE_3D\]([a-z0-9-]+)\[\/TEMPLATE_3D\]/i;
const RE_HTML_BLOCK = /===\s*HTML COMPLETO DEL TEMPLATE\s*===([\s\S]*?)===\s*FIN HTML\s*===/i;
const RE_META_JSON = /```json\s*([\s\S]*?)```/i;

export interface Template3DInjection {
  /** Slug del template (product-showcase, etc.). */
  slug: string;
  /** HTML completo extraido tal cual. */
  html: string;
  /** Metadata opcional (input que uso el cliente). */
  meta: any;
  /** Archivos a inyectar al proyecto (path -> contenido). */
  files: Record<string, string>;
  /** Respuesta humana del "assistant" para mostrar en el chat. */
  assistantResponse: string;
}

/**
 * Detecta si un mensaje del cliente trae un template 3D pre-armado.
 * Devuelve null si NO es un mensaje de template (flujo normal sigue).
 */
export function detectTemplate3DInjection(
  content: string,
): Template3DInjection | null {
  if (!content) return null;
  const tagMatch = content.match(RE_TEMPLATE_TAG);
  if (!tagMatch) return null;

  const slug = tagMatch[1].toLowerCase();

  const htmlMatch = content.match(RE_HTML_BLOCK);
  if (!htmlMatch) {
    // Tag presente pero HTML mal formateado: no hacer nada, dejar que el
    // flujo normal (Claude) lo procese. Mejor failure mode.
    return null;
  }
  const html = htmlMatch[1].trim();
  if (!html.toLowerCase().startsWith('<!doctype html')) {
    // Sanity check: HTML debe empezar con DOCTYPE. Si no, abortar.
    return null;
  }

  let meta: any = {};
  const metaMatch = content.match(RE_META_JSON);
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1]);
    } catch {
      // Meta corrupta -> seguimos sin ella.
    }
  }

  const files = buildProjectFiles(slug, html, meta);
  const productName = meta?.input?.productName || 'tu producto';

  const assistantResponse =
    `Listo. Inserte el template 3D "${slug}" como una nueva pagina del proyecto:\n\n` +
    `- \`app/showcase/page.tsx\` (ruta /showcase)\n` +
    `- \`lib/showcase-html.ts\` (HTML del template 3D codificado)\n\n` +
    `Cuando veas el preview, navega a /showcase para ver la experiencia 3D ` +
    `scroll-driven de ${productName}. El HTML usa Three.js + GSAP cargados ` +
    `via CDN — todo el efecto funciona sin que tengas que instalar nada.\n\n` +
    `Si queres editar texto/colores, mejor abri el dialog Templates 3D otra ` +
    `vez, ajusta los inputs y dale "Usar este template" de nuevo — eso ` +
    `regenera la pagina /showcase con tus cambios. Editar el HTML directo ` +
    `te puede romper la escena Three.js.`;

  return { slug, html, meta, files, assistantResponse };
}

/**
 * Codifica HTML a base64 (sin chunks raros). Node nativo, sin deps.
 */
function htmlToBase64(html: string): string {
  return Buffer.from(html, 'utf8').toString('base64');
}

/**
 * Construye el set de archivos Next que se inyectan al proyecto.
 */
function buildProjectFiles(
  slug: string,
  html: string,
  meta: any,
): Record<string, string> {
  const b64 = htmlToBase64(html);
  const sizeKb = (html.length / 1024).toFixed(1);

  const showcaseHtmlTs = `// Generado automaticamente por el template 3D "${slug}".
// HTML autocontenido (Three.js + GSAP via CDN) codificado en base64 para evitar
// problemas de escape de backticks/template literals en el .tsx que lo monta.
// Tamano original: ${sizeKb} KB.

const HTML_B64 = '${b64}';

/**
 * Decodifica el HTML del template 3D. Se llama una sola vez al montar el
 * componente y se memoiza, asi que no hay overhead por render.
 */
export function getShowcaseHtml(): string {
  if (typeof window === 'undefined') {
    // SSR: devolvemos string vacio para no llenar el HTML del servidor
    // con 24KB de markup que no podemos hidratar. El iframe se monta en
    // el cliente.
    return '';
  }
  // atob es nativo del browser. Convertir bytes -> UTF-8 string.
  const binary = atob(HTML_B64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

export const SHOWCASE_META = ${JSON.stringify(meta || {}, null, 2)};
`;

  const pageTsx = `"use client";

import { useMemo } from 'react';
import { getShowcaseHtml } from '@/lib/showcase-html';

/**
 * Pagina /showcase: monta el template 3D pre-armado en un iframe full
 * viewport. El iframe esta sandboxed con allow-scripts para que Three.js
 * pueda ejecutarse pero sin que pueda navegar el padre.
 *
 * No cargamos el HTML en SSR porque pesa ~${sizeKb} KB de markup mas codigo
 * que solo tiene sentido en el cliente. En SSR devolvemos un placeholder
 * que se reemplaza apenas se hidrata.
 */
export default function ShowcasePage() {
  const html = useMemo(() => getShowcaseHtml(), []);

  if (!html) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'sans-serif',
        }}
      >
        Cargando experiencia 3D...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      title="Showcase 3D"
      sandbox="allow-scripts allow-same-origin allow-popups"
      style={{
        width: '100vw',
        height: '100vh',
        border: 0,
        display: 'block',
      }}
    />
  );
}
`;

  return {
    '/app/showcase/page.tsx': pageTsx,
    '/lib/showcase-html.ts': showcaseHtmlTs,
  };
}
