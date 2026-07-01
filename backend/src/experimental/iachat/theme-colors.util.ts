/**
 * Utilidades PURAS para el editor de tema global (colores). Los proyectos usan
 * tokens shadcn en formato de canales HSL ("H S% L%") dentro de un bloque
 * `:root { … }` en globals.css, y Tailwind los consume con `hsl(var(--token))`.
 *
 * Aquí va la conversión hex↔HSL (los color pickers del navegador hablan hex) y
 * el parse/patch del bloque :root. Todo testeado en theme-colors.util.spec.ts.
 */

/** Tokens de color que administra el editor de tema (en orden de UI). */
export const THEME_TOKENS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'foreground',
  'card',
  'muted',
  'border',
] as const;
export type ThemeToken = (typeof THEME_TOKENS)[number];

/** Tokens "de marca" cuyo texto encima (`-foreground`) se recalcula para que
 *  siempre quede legible al cambiar el color base. */
export const BRAND_TOKENS: ThemeToken[] = ['primary', 'secondary', 'accent'];

/** "#rrggbb" | "#rgb" → "H S% L%" (canales shadcn, redondeados). */
export function hexToHslChannels(hex: string): string {
  const raw = hex.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '0 0% 0%';
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** "H S% L%" → "#rrggbb". Tolerante a espacios/decimales. */
export function hslChannelsToHex(str: string): string {
  const m = str.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return '#000000';
  const h = ((parseFloat(m[1]) % 360) + 360) % 360 / 360;
  const s = Math.min(100, Math.max(0, parseFloat(m[2]))) / 100;
  const l = Math.min(100, Math.max(0, parseFloat(m[3]))) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => {
    const v = Math.round(x * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Devuelve un color de texto legible ("casi negro" o "casi blanco") para
 *  poner ENCIMA del color dado, según su luminancia relativa (WCAG). */
export function readableForeground(hslChannels: string): string {
  const hex = hslChannelsToHex(hslChannels).replace('#', '');
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * lin(parseInt(hex.slice(0, 2), 16)) +
    0.7152 * lin(parseInt(hex.slice(2, 4), 16)) +
    0.0722 * lin(parseInt(hex.slice(4, 6), 16));
  return L > 0.45 ? '0 0% 10%' : '0 0% 100%';
}

/** Lee los tokens `--x: …;` del PRIMER bloque `:root { … }`. */
export function parseRootTokens(css: string): Record<string, string> {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  const out: Record<string, string> = {};
  if (!m) return out;
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let g: RegExpExecArray | null;
  while ((g = re.exec(m[1]))) out[g[1]] = g[2].trim();
  return out;
}

/**
 * Reemplaza (o agrega) tokens dentro del PRIMER bloque `:root { … }`,
 * preservando todo lo demás del archivo. `patch` mapea nombre de token (sin
 * `--`) → valor en canales HSL. Si el archivo no tiene `:root`, lo deja igual.
 */
export function patchRootTokens(css: string, patch: Record<string, string>): string {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m || m.index == null) return css;
  let block = m[1];
  for (const [k, v] of Object.entries(patch)) {
    const tokenRe = new RegExp('(--' + k + '\\s*:\\s*)[^;]+(;)');
    if (tokenRe.test(block)) {
      block = block.replace(tokenRe, (_full, pre, semi) => pre + v + semi);
    } else {
      // Agregar el token nuevo al final del bloque, con sangría coherente.
      block = block.replace(/(\s*)$/, (_m2, tail) => `    --${k}: ${v};${tail}`);
    }
  }
  const newBlock = m[0].replace(m[1], () => block);
  return css.slice(0, m.index) + newBlock + css.slice(m.index + m[0].length);
}

/** Conjunto de cambios de color (hex) ya listo para el patch del :root,
 *  incluyendo los `-foreground` de los tokens de marca para mantener contraste. */
export function buildColorPatch(hexByToken: Record<string, string>): Record<string, string> {
  const patch: Record<string, string> = {};
  for (const [token, hex] of Object.entries(hexByToken)) {
    if (typeof hex !== 'string' || !hex) continue;
    const channels = hexToHslChannels(hex);
    patch[token] = channels;
    if (BRAND_TOKENS.includes(token as ThemeToken)) {
      patch[`${token}-foreground`] = readableForeground(channels);
    }
  }
  return patch;
}

/** Tokens de tema actuales del CSS, convertidos a hex (solo los que existen). */
export function readThemeHex(css: string): Record<string, string> {
  const tokens = parseRootTokens(css);
  const out: Record<string, string> = {};
  for (const t of THEME_TOKENS) {
    if (tokens[t]) out[t] = hslChannelsToHex(tokens[t]);
  }
  return out;
}
