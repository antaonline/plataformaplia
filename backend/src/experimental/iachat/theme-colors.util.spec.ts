import {
  hexToHslChannels,
  hslChannelsToHex,
  readableForeground,
  parseRootTokens,
  patchRootTokens,
  buildColorPatch,
  readThemeHex,
} from './theme-colors.util';

const CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 60 17% 98%;
    --foreground: 16 27% 14%;
    --primary: 14 56% 51%;
    --primary-foreground: 16 27% 14%;
    --secondary: 16 27% 14%;
    --accent: 46 65% 52%;
    --radius: 0.5rem;
  }
}

body { background-color: hsl(var(--background)); }
`;

describe('theme-colors.util', () => {
  it('convierte hex → canales HSL en casos exactos', () => {
    expect(hexToHslChannels('#ffffff')).toBe('0 0% 100%');
    expect(hexToHslChannels('#000000')).toBe('0 0% 0%');
    expect(hexToHslChannels('#ff0000')).toBe('0 100% 50%');
    expect(hexToHslChannels('#fff')).toBe('0 0% 100%'); // forma corta
  });

  it('convierte canales HSL → hex en casos exactos', () => {
    expect(hslChannelsToHex('0 100% 50%')).toBe('#ff0000');
    expect(hslChannelsToHex('0 0% 100%')).toBe('#ffffff');
    expect(hslChannelsToHex('0 0% 0%')).toBe('#000000');
  });

  it('hace round-trip hex→hsl→hex con tolerancia ±2 por canal', () => {
    for (const hex of ['#cb5733', '#0e7c86', '#6d28d9', '#a7c957']) {
      const back = hslChannelsToHex(hexToHslChannels(hex));
      const a = hex.replace('#', '');
      const b = back.replace('#', '');
      for (let i = 0; i < 3; i++) {
        const ca = parseInt(a.slice(i * 2, i * 2 + 2), 16);
        const cb = parseInt(b.slice(i * 2, i * 2 + 2), 16);
        expect(Math.abs(ca - cb)).toBeLessThanOrEqual(2);
      }
    }
  });

  it('elige texto legible según luminancia', () => {
    expect(readableForeground('0 0% 5%')).toBe('0 0% 100%'); // fondo oscuro → texto claro
    expect(readableForeground('0 0% 95%')).toBe('0 0% 10%'); // fondo claro → texto oscuro
    expect(readableForeground('14 56% 51%')).toBe('0 0% 100%'); // naranja medio-oscuro
  });

  it('parsea los tokens del :root', () => {
    const t = parseRootTokens(CSS);
    expect(t.primary).toBe('14 56% 51%');
    expect(t.background).toBe('60 17% 98%');
    expect(t.radius).toBe('0.5rem');
  });

  it('lee el tema como hex (solo tokens de color conocidos)', () => {
    const hex = readThemeHex(CSS);
    expect(hex.primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(hex.background).toMatch(/^#[0-9a-f]{6}$/);
    expect(hex.radius).toBeUndefined(); // radius no es color
    // primary 14 56% 51% ≈ naranja → componente rojo dominante
    const r = parseInt(hex.primary.slice(1, 3), 16);
    const b = parseInt(hex.primary.slice(5, 7), 16);
    expect(r).toBeGreaterThan(b);
  });

  it('patchea solo el token pedido y preserva el resto del archivo', () => {
    const out = patchRootTokens(CSS, { primary: '210 100% 50%' });
    expect(out).toContain('--primary: 210 100% 50%;');
    expect(out).toContain('--secondary: 16 27% 14%;'); // intacto
    expect(out).toContain('--radius: 0.5rem;'); // intacto
    expect(out).toContain('body { background-color: hsl(var(--background)); }'); // resto intacto
    expect(out.startsWith('@tailwind base;')).toBe(true);
  });

  it('buildColorPatch agrega -foreground para tokens de marca', () => {
    const patch = buildColorPatch({ primary: '#1a1a1a', background: '#ffffff' });
    expect(patch.primary).toBeDefined();
    expect(patch['primary-foreground']).toBe('0 0% 100%'); // primary oscuro → texto claro
    expect(patch.background).toBeDefined();
    expect(patch['background-foreground']).toBeUndefined(); // background no es de marca
  });

  it('aplicar buildColorPatch + patchRootTokens recolorea de forma coherente', () => {
    const patch = buildColorPatch({ primary: '#2563eb' });
    const out = patchRootTokens(CSS, patch);
    const t = parseRootTokens(out);
    // round-trip con tolerancia ±2 por canal (el HSL redondea)
    const got = hslChannelsToHex(t.primary).replace('#', '');
    const want = '2563eb';
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(parseInt(got.slice(i * 2, i * 2 + 2), 16) - parseInt(want.slice(i * 2, i * 2 + 2), 16))).toBeLessThanOrEqual(2);
    }
    expect(t['primary-foreground']).toBe('0 0% 100%'); // azul medio → texto blanco
  });

  it('no rompe si el CSS no tiene :root', () => {
    expect(patchRootTokens('body { color: red; }', { primary: '0 0% 0%' })).toBe(
      'body { color: red; }',
    );
    expect(parseRootTokens('body {}')).toEqual({});
  });
});
