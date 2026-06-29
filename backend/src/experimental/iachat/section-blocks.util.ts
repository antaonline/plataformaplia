/**
 * Utilidades PURAS para operaciones estructurales sobre la página del proyecto
 * (reordenar / duplicar bloques de nivel superior dentro de <main>).
 *
 * Diseño defensivo: cualquier ambigüedad de parseo devuelve un fallo explícito
 * (`{ ok: false, reason }`) en vez de adivinar, de modo que NUNCA se corrompe
 * el archivo. El peor caso es un no-op.
 */

export type BlockResult =
  | { ok: true; src: string }
  | { ok: false; reason: string };

/** Ubica el contenido interno de <main>…</main>. Asume que no hay <main>
 *  anidados (cierto en estas páginas generadas). */
export function locateMainInner(
  src: string,
): { head: string; inner: string; tail: string } | null {
  const openM = src.match(/<main\b[^>]*>/);
  if (!openM || openM.index == null) return null;
  const openEnd = openM.index + openM[0].length;
  const closeIdx = src.lastIndexOf('</main>');
  if (closeIdx < 0 || closeIdx < openEnd) return null;
  return {
    head: src.slice(0, openEnd),
    inner: src.slice(openEnd, closeIdx),
    tail: src.slice(closeIdx),
  };
}

/**
 * Divide el contenido interno de <main> en bloques JSX hermanos de nivel
 * superior, conservando los espacios entre ellos (gaps.length === blocks+1).
 * Devuelve null ante cualquier cosa que no sepa parsear con certeza.
 */
export function splitJsxSiblings(
  inner: string,
): { blocks: string[]; gaps: string[] } | null {
  const n = inner.length;
  const isWs = (c: string) => c === ' ' || c === '\t' || c === '\n' || c === '\r';

  const skipString = (i: number): number => {
    const q = inner[i];
    i++;
    while (i < n) {
      if (inner[i] === '\\') { i += 2; continue; }
      if (inner[i] === q) return i + 1;
      i++;
    }
    return -1;
  };
  const skipBraces = (i: number): number => {
    let depth = 0;
    while (i < n) {
      const c = inner[i];
      if (c === '"' || c === "'" || c === '`') { i = skipString(i); if (i < 0) return -1; continue; }
      if (c === '{') { depth++; i++; continue; }
      if (c === '}') { depth--; i++; if (depth === 0) return i; continue; }
      i++;
    }
    return -1;
  };
  const tagNameAt = (i: number): string => {
    let j = i + 1;
    if (inner[j] === '/') j++;
    let name = '';
    while (j < n && /[A-Za-z0-9._-]/.test(inner[j])) { name += inner[j]; j++; }
    return name;
  };
  const scanOpenTag = (i: number): { end: number; selfClosing: boolean } => {
    let j = i + 1;
    while (j < n) {
      const c = inner[j];
      if (c === '"' || c === "'" || c === '`') { j = skipString(j); if (j < 0) return { end: -1, selfClosing: false }; continue; }
      if (c === '{') { j = skipBraces(j); if (j < 0) return { end: -1, selfClosing: false }; continue; }
      if (c === '>') return { end: j + 1, selfClosing: inner[j - 1] === '/' };
      j++;
    }
    return { end: -1, selfClosing: false };
  };
  const scanElement = (i: number): number => {
    const name = tagNameAt(i);
    if (!name) return -1;
    const open = scanOpenTag(i);
    if (open.end < 0) return -1;
    if (open.selfClosing) return open.end;
    let j = open.end;
    let depth = 1;
    while (j < n) {
      const c = inner[j];
      if (c === '{') { j = skipBraces(j); if (j < 0) return -1; continue; }
      if (c === '<') {
        if (inner[j + 1] === '/') {
          const cn = tagNameAt(j);
          let k = j + 2;
          while (k < n && inner[k] !== '>') k++;
          if (k >= n) return -1;
          k++;
          if (cn === name) { depth--; if (depth === 0) return k; }
          j = k;
          continue;
        }
        const cn = tagNameAt(j);
        const ot = scanOpenTag(j);
        if (ot.end < 0) return -1;
        if (cn === name && !ot.selfClosing) depth++;
        j = ot.end;
        continue;
      }
      j++;
    }
    return -1;
  };

  const blocks: string[] = [];
  const gaps: string[] = [];
  let i = 0;
  let gapStart = 0;
  while (i < n) {
    if (isWs(inner[i])) { i++; continue; }
    gaps.push(inner.slice(gapStart, i));
    let end: number;
    if (inner[i] === '<') {
      if (inner[i + 1] === '/') return null; // tag de cierre suelto
      end = scanElement(i);
    } else if (inner[i] === '{') {
      end = skipBraces(i);
    } else {
      return null; // texto suelto a nivel superior
    }
    if (end < 0 || end <= i) return null;
    blocks.push(inner.slice(i, end));
    i = end;
    gapStart = i;
  }
  gaps.push(inner.slice(gapStart));
  if (gaps.length !== blocks.length + 1) return null;
  // Garantía dura: los espacios entre bloques deben ser SOLO whitespace.
  for (const g of gaps) if (/\S/.test(g)) return null;
  return { blocks, gaps };
}

function rebuild(blocks: string[], gaps: string[]): string {
  let inner = '';
  for (let k = 0; k < blocks.length; k++) inner += gaps[k] + blocks[k];
  inner += gaps[blocks.length];
  return inner;
}

/** Reordena el bloque `index` (hijo directo de <main>) una posición arriba/abajo. */
export function moveBlock(src: string, index: number, dir: 'up' | 'down'): BlockResult {
  const loc = locateMainInner(src);
  if (!loc) return { ok: false, reason: 'no-main' };
  const parsed = splitJsxSiblings(loc.inner);
  if (!parsed) return { ok: false, reason: 'parse-blocks' };
  const { blocks, gaps } = parsed;
  const i = Number(index);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (!Number.isInteger(i) || i < 0 || i >= blocks.length || j < 0 || j >= blocks.length) {
    return { ok: false, reason: 'oob' };
  }
  const tmp = blocks[i];
  blocks[i] = blocks[j];
  blocks[j] = tmp;
  return { ok: true, src: loc.head + rebuild(blocks, gaps) + loc.tail };
}

/** Duplica el bloque `index`, insertando la copia justo debajo. Si el bloque es
 *  una <section> con data-plia-section, la copia recibe `freshId`. */
export function duplicateBlock(src: string, index: number, freshId: string): BlockResult {
  const loc = locateMainInner(src);
  if (!loc) return { ok: false, reason: 'no-main' };
  const parsed = splitJsxSiblings(loc.inner);
  if (!parsed) return { ok: false, reason: 'parse-blocks' };
  const { blocks, gaps } = parsed;
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= blocks.length) return { ok: false, reason: 'oob' };
  const clone = blocks[i].replace(/data-plia-section="[^"]*"/, `data-plia-section="${freshId}"`);
  const sep = /\n/.test(gaps[i + 1]) ? gaps[i + 1] : '\n      ';
  let inner = '';
  for (let k = 0; k < blocks.length; k++) {
    inner += gaps[k] + blocks[k];
    if (k === i) inner += sep + clone;
  }
  inner += gaps[blocks.length];
  return { ok: true, src: loc.head + inner + loc.tail };
}
