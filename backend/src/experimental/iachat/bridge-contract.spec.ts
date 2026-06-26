import { readFileSync } from 'fs';
import { join } from 'path';
import { pathToSelector, camelToKebab, BP_MAX } from './style-overrides.util';

/**
 * Verificación del BRIDGE real (scaffolds/plia-studio-base/index.html): extrae
 * sus funciones puras de overrides y comprueba que NO se desincronicen del
 * backend (mismo selector, mismo camel→kebab, mismos breakpoints). Si alguien
 * toca una de las dos copias y no la otra, este test falla.
 */
describe('bridge ↔ backend: contrato de overrides', () => {
  const html = readFileSync(
    join(process.cwd(), 'scaffolds', 'plia-studio-base', 'index.html'),
    'utf8',
  );

  // Bloque contiguo de funciones PURAS del bridge (sin DOM): de `var BP_MAX`
  // hasta antes de renderLiveOverrides (que ya usa document).
  const start = html.indexOf('var BP_MAX');
  const end = html.indexOf('function renderLiveOverrides');
  const src = html.slice(start, end);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const bridge = new Function(
    src + '; return { BP_MAX: BP_MAX, camelKebab: camelKebab, selOf: selOf, ovBlock: ovBlock };',
  )() as {
    BP_MAX: Record<string, number>;
    camelKebab: (p: string) => string;
    selOf: (path: string) => string;
    ovBlock: (m: Record<string, Record<string, string>>) => string;
  };

  it('el bloque de funciones puras se extrajo del bridge', () => {
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(typeof bridge.selOf).toBe('function');
  });

  it('selOf del bridge === pathToSelector del backend', () => {
    for (const p of ['DIV:0', 'DIV:0>SECTION:1>H2:3', 'MAIN:2>DIV:0>UL:1>LI:4']) {
      expect(bridge.selOf(p)).toBe(pathToSelector(p));
    }
  });

  it('camelKebab del bridge === camelToKebab del backend', () => {
    for (const k of ['paddingTop', 'backgroundColor', 'borderRadius', 'width']) {
      expect(bridge.camelKebab(k)).toBe(camelToKebab(k));
    }
  });

  it('los breakpoints del bridge coinciden con los del backend', () => {
    expect(bridge.BP_MAX.tablet).toBe(BP_MAX.tablet);
    expect(bridge.BP_MAX.mobile).toBe(BP_MAX.mobile);
  });

  it('ovBlock genera la misma regla base que el backend (selector + kebab)', () => {
    const rule = bridge.ovBlock({ 'DIV:0>SECTION:1': { paddingTop: '40px' } });
    expect(rule).toBe('#root > div:nth-child(1) > section:nth-child(2){padding-top:40px;}');
  });

  it('el bridge usa los anchos de BP_MAX en sus @media (render media-aware)', () => {
    const render = html.slice(end, html.indexOf('function setOv'));
    expect(render).toContain('max-width:' + "' + BP_MAX.tablet + '");
    expect(render).toContain('max-width:' + "' + BP_MAX.mobile + '");
  });

  it('el vh-cap cubre html/body/#root (no solo clases)', () => {
    expect(html).toContain("'html,body,#root{min-height:'");
  });

  it('el inspector/undo escriben por ruta+breakpoint (PLIA_SET_STYLE_AT → setOv)', () => {
    expect(html).toContain('PLIA_SET_STYLE_AT');
    expect(html).toContain('setOv(e.data.bp || bpNow, e.data.path, e.data.style)');
  });
});
