/**
 * Lógica PURA de los overrides de estilo del editor visual (padding/tamaño/
 * tipografía/color), compartida y unit-testeable. El servicio la usa para
 * escribir `src/plia-overrides.css`; el bridge del scaffold replica la MISMA
 * lógica en JS plano (hay un spec que verifica que no se desincronicen).
 *
 * Formato del mapa: anidado por breakpoint.
 *   { desktop|tablet|mobile: { rutaDOM: { propCamel: valor } } }
 * Se serializa como: desktop = base; tablet/móvil = @media max-width
 * (cascada desktop-first, el más chico gana en pantallas pequeñas).
 */

export type StyleMap = Record<string, string>;
export type BreakpointMap = Record<string, StyleMap>; // { rutaDOM: {prop:val} }
export type OverrideMap = Record<string, BreakpointMap>; // { bp: BreakpointMap }

/** Anchos de corte (px) de cada breakpoint no-base. Debe coincidir con el bridge. */
export const BP_MAX: Record<string, number> = { tablet: 1024, mobile: 640 };

export function camelToKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/** "DIV:0>SECTION:1" → "#root > div:nth-child(1) > section:nth-child(2)". */
export function pathToSelector(path: string): string {
  const segs = path
    .split('>')
    .map((seg) => {
      const [tag, idx] = seg.split(':');
      const n = parseInt(idx, 10);
      if (!tag || Number.isNaN(n)) return '';
      return `${tag.toLowerCase()}:nth-child(${n + 1})`;
    })
    .filter(Boolean);
  // El '#root' (id) da especificidad alta: gana a las clases de Tailwind sin
  // !important (y los inline del editor en vivo siguen mandando al arrastrar).
  return ['#root', ...segs].join(' > ');
}

/** Normaliza el JSON crudo del archivo: migra el formato viejo (plano por ruta)
 *  al nuevo anidado por breakpoint (lo mete en `desktop`). */
export function migrateOverrideMap(raw: unknown): OverrideMap {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const hasBp = ['desktop', 'tablet', 'mobile'].some((k) => k in obj);
  if (hasBp) return obj as OverrideMap;
  return Object.keys(obj).length ? { desktop: obj as BreakpointMap } : {};
}

/** Mergea un override de un elemento en el mapa. "" en una prop = quitarla. */
export function mergeOverride(
  map: OverrideMap,
  breakpoint: string,
  path: string,
  style: StyleMap,
): OverrideMap {
  const bp = breakpoint === 'tablet' || breakpoint === 'mobile' ? breakpoint : 'desktop';
  const bpMap = map[bp] || (map[bp] = {});
  const next = { ...(bpMap[path] || {}), ...style };
  for (const k of Object.keys(next)) {
    if (next[k] === '' || next[k] == null) delete next[k];
  }
  if (Object.keys(next).length === 0) delete bpMap[path];
  else bpMap[path] = next;
  if (Object.keys(bpMap).length === 0) delete map[bp];
  return map;
}

/** Reescribe el .css completo: marcador JSON (fuente de verdad) + reglas. */
export function serializeOverrides(map: OverrideMap): string {
  const header =
    '/* PLIA · estilos del editor visual. Generado automáticamente — no editar a mano. */';
  const json = `/*PLIA_JSON:${JSON.stringify(map)}*/`;
  const block = (bpMap: BreakpointMap, pad: string) =>
    Object.keys(bpMap)
      .map((path) => {
        const sel = pathToSelector(path);
        const decls = Object.entries(bpMap[path])
          .map(([prop, val]) => `${pad}  ${camelToKebab(prop)}: ${val};`)
          .join('\n');
        return `${pad}${sel} {\n${decls}\n${pad}}`;
      })
      .join('\n\n');
  const parts: string[] = [];
  if (map.desktop && Object.keys(map.desktop).length) parts.push(block(map.desktop, ''));
  for (const bp of ['tablet', 'mobile']) {
    if (map[bp] && Object.keys(map[bp]).length) {
      parts.push(`@media (max-width: ${BP_MAX[bp]}px) {\n${block(map[bp], '  ')}\n}`);
    }
  }
  return `${header}\n${json}\n${parts.join('\n\n')}${parts.length ? '\n' : ''}`;
}

/** Extrae el mapa desde el contenido del .css (lee el marcador PLIA_JSON). */
export function parseOverridesCss(css: string): OverrideMap {
  const m = css.match(/PLIA_JSON:([\s\S]*?)\*\//);
  if (!m) return {};
  try {
    return migrateOverrideMap(JSON.parse(m[1].trim()));
  } catch {
    return {};
  }
}
