/**
 * Utilidades PURAS para la tipografía del tema global. En estos proyectos no
 * hay sistema de fuentes cableado (sin fontFamily en Tailwind ni Google Fonts),
 * así que lo resolvemos por completo dentro de globals.css:
 *   1) un `@import` de Google Fonts AL INICIO del archivo (obligatorio: un
 *      @import después de cualquier regla es ignorado por CSS),
 *   2) un bloque base al FINAL con las variables --font-heading/--font-body y
 *      su aplicación a body + encabezados.
 *
 * Ambas piezas van entre marcadores para poder re-aplicarlas de forma
 * idempotente (cambiar de par no acumula imports ni bloques).
 */

export interface FontPairing {
  id: string;
  name: string;
  headingLabel: string;
  bodyLabel: string;
  /** Valor CSS de font-family para encabezados. */
  heading: string;
  /** Valor CSS de font-family para el cuerpo. */
  body: string;
  /** href de Google Fonts (vacío para fuentes del sistema). */
  import: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'elegante',
    name: 'Elegante',
    headingLabel: 'Playfair Display',
    bodyLabel: 'Inter',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700;800&display=swap',
  },
  {
    id: 'moderno',
    name: 'Moderno',
    headingLabel: 'Poppins',
    bodyLabel: 'Inter',
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    headingLabel: 'Fraunces',
    bodyLabel: 'Inter',
    heading: "'Fraunces', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500&display=swap',
  },
  {
    id: 'tech',
    name: 'Tecnológico',
    headingLabel: 'Space Grotesk',
    bodyLabel: 'Inter',
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap',
  },
  {
    id: 'clasico',
    name: 'Clásico',
    headingLabel: 'Merriweather',
    bodyLabel: 'Source Sans 3',
    heading: "'Merriweather', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;600&display=swap',
  },
  {
    id: 'amigable',
    name: 'Amigable',
    headingLabel: 'Quicksand',
    bodyLabel: 'Nunito',
    heading: "'Quicksand', system-ui, sans-serif",
    body: "'Nunito', system-ui, sans-serif",
    import:
      'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600&family=Quicksand:wght@600;700&display=swap',
  },
  {
    id: 'sistema',
    name: 'Sistema',
    headingLabel: 'Predeterminada',
    bodyLabel: 'Predeterminada',
    heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    import: '',
  },
];

const IMPORT_START = '/* PLIA-FONTS-IMPORT:start */';
const IMPORT_END = '/* PLIA-FONTS-IMPORT:end */';
const BASE_START = '/* PLIA-FONTS-BASE:start */';
const BASE_END = '/* PLIA-FONTS-BASE:end */';

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeManagedBlock(css: string, start: string, end: string): string {
  const re = new RegExp('[\\t ]*' + escapeRe(start) + '[\\s\\S]*?' + escapeRe(end) + '\\n?', 'g');
  return css.replace(re, '');
}

/** Aplica (o reemplaza) el par tipográfico en el CSS. Idempotente. */
export function applyFontPairing(css: string, p: FontPairing): string {
  let out = removeManagedBlock(css, IMPORT_START, IMPORT_END);
  out = removeManagedBlock(out, BASE_START, BASE_END);

  if (p.import) {
    const importBlock = `${IMPORT_START}\n@import url('${p.import}');\n${IMPORT_END}\n`;
    out = importBlock + out;
  }

  const baseBlock =
    `${BASE_START}\n` +
    `:root { --font-heading: ${p.heading}; --font-body: ${p.body}; }\n` +
    `body { font-family: var(--font-body) !important; }\n` +
    `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading) !important; }\n` +
    `${BASE_END}\n`;
  out = out.replace(/\s*$/, '\n') + baseBlock;
  return out;
}

/** Detecta el par tipográfico activo. Matchea encabezado Y cuerpo, porque
 *  varios pares comparten el mismo cuerpo (p. ej. Inter). */
export function readCurrentFontId(css: string): string | null {
  const s = css.indexOf(BASE_START);
  if (s < 0) return null;
  const e = css.indexOf(BASE_END, s);
  if (e < 0) return null;
  const block = css.slice(s, e);
  const mb = block.match(/--font-body:\s*([^;]+);/);
  const mh = block.match(/--font-heading:\s*([^;]+);/);
  if (!mb || !mh) return null;
  const body = mb[1].trim();
  const heading = mh[1].trim();
  const found = FONT_PAIRINGS.find(
    (p) => p.body.trim() === body && p.heading.trim() === heading,
  );
  return found ? found.id : null;
}
