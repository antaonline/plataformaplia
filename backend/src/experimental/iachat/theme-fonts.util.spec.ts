import { FONT_PAIRINGS, applyFontPairing, readCurrentFontId } from './theme-fonts.util';

const CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 14 56% 51%;
    --background: 60 17% 98%;
  }
}

body { background-color: hsl(var(--background)); }
`;

const byId = (id: string) => FONT_PAIRINGS.find((p) => p.id === id)!;

describe('theme-fonts.util', () => {
  it('agrega @import al inicio (antes de @tailwind) y bloque base al final', () => {
    const out = applyFontPairing(CSS, byId('elegante'));
    expect(out.indexOf('@import')).toBeLessThan(out.indexOf('@tailwind base;'));
    expect(out).toContain("--font-heading: 'Playfair Display'");
    expect(out).toContain("--font-body: 'Inter'");
    expect(out).toContain('body { font-family: var(--font-body) !important; }');
    expect(out).toContain('h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading) !important; }');
    // resto del archivo intacto
    expect(out).toContain('--primary: 14 56% 51%;');
    expect(out).toContain('body { background-color: hsl(var(--background)); }');
  });

  it('es idempotente: aplicar dos veces no acumula imports ni bloques', () => {
    const once = applyFontPairing(CSS, byId('elegante'));
    const twice = applyFontPairing(once, byId('elegante'));
    expect(twice).toBe(once);
    expect((twice.match(/@import/g) || []).length).toBe(1);
    expect((twice.match(/PLIA-FONTS-BASE:start/g) || []).length).toBe(1);
  });

  it('cambiar de par reemplaza (un solo import, un solo bloque base)', () => {
    const a = applyFontPairing(CSS, byId('elegante'));
    const b = applyFontPairing(a, byId('moderno'));
    expect((b.match(/@import/g) || []).length).toBe(1);
    expect((b.match(/PLIA-FONTS-IMPORT:start/g) || []).length).toBe(1);
    expect(b).toContain("--font-heading: 'Poppins'");
    expect(b).not.toContain("Playfair Display");
  });

  it('detecta el par activo con readCurrentFontId', () => {
    expect(readCurrentFontId(CSS)).toBeNull();
    expect(readCurrentFontId(applyFontPairing(CSS, byId('tech')))).toBe('tech');
    expect(readCurrentFontId(applyFontPairing(CSS, byId('clasico')))).toBe('clasico');
  });

  it('"sistema" no agrega @import y usa fuentes del sistema', () => {
    const out = applyFontPairing(CSS, byId('sistema'));
    expect(out).not.toContain('@import');
    expect(out).toContain('--font-body: system-ui');
    expect(readCurrentFontId(out)).toBe('sistema');
  });

  it('de un par con import a "sistema" elimina el @import', () => {
    const withImport = applyFontPairing(CSS, byId('elegante'));
    expect(withImport).toContain('@import');
    const reset = applyFontPairing(withImport, byId('sistema'));
    expect(reset).not.toContain('@import');
    expect(reset).toContain('--font-body: system-ui');
  });

  it('todos los pares tienen id único y campos completos', () => {
    const ids = FONT_PAIRINGS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    FONT_PAIRINGS.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.heading).toContain('serif'); // 'serif' o 'sans-serif'
      expect(p.body).toBeTruthy();
    });
  });
});
