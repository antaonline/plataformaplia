import {
  pathToSelector,
  camelToKebab,
  migrateOverrideMap,
  mergeOverride,
  serializeOverrides,
  parseOverridesCss,
  BP_MAX,
  OverrideMap,
} from './style-overrides.util';

describe('style-overrides.util', () => {
  describe('pathToSelector', () => {
    it('convierte ruta DOM a selector #root + nth-child (1-based)', () => {
      expect(pathToSelector('DIV:0>SECTION:1>H2:3')).toBe(
        '#root > div:nth-child(1) > section:nth-child(2) > h2:nth-child(4)',
      );
    });
  });

  describe('camelToKebab', () => {
    it('paddingTop → padding-top, backgroundColor → background-color', () => {
      expect(camelToKebab('paddingTop')).toBe('padding-top');
      expect(camelToKebab('backgroundColor')).toBe('background-color');
      expect(camelToKebab('width')).toBe('width');
    });
  });

  describe('migrateOverrideMap', () => {
    it('envuelve el formato viejo (plano por ruta) en desktop', () => {
      expect(migrateOverrideMap({ 'DIV:0': { paddingTop: '40px' } })).toEqual({
        desktop: { 'DIV:0': { paddingTop: '40px' } },
      });
    });
    it('deja intacto el formato nuevo (anidado por breakpoint)', () => {
      const nested = { mobile: { 'DIV:0': { paddingTop: '16px' } } };
      expect(migrateOverrideMap(nested)).toEqual(nested);
    });
    it('vacío / no-objeto → {}', () => {
      expect(migrateOverrideMap({})).toEqual({});
      expect(migrateOverrideMap(null)).toEqual({});
      expect(migrateOverrideMap('x')).toEqual({});
    });
  });

  describe('mergeOverride', () => {
    it('mergea y normaliza el breakpoint inválido a desktop', () => {
      const map: OverrideMap = {};
      mergeOverride(map, 'no-existe', 'DIV:0', { paddingTop: '40px' });
      expect(map).toEqual({ desktop: { 'DIV:0': { paddingTop: '40px' } } });
    });
    it('"" en una prop la elimina; sin props elimina la ruta y el bucket', () => {
      const map: OverrideMap = { desktop: { 'DIV:0': { paddingTop: '40px' } } };
      mergeOverride(map, 'desktop', 'DIV:0', { paddingTop: '' });
      expect(map).toEqual({});
    });
    it('guarda en el bucket del breakpoint correcto', () => {
      const map: OverrideMap = {};
      mergeOverride(map, 'mobile', 'DIV:0', { paddingTop: '16px' });
      expect(map.mobile).toEqual({ 'DIV:0': { paddingTop: '16px' } });
      expect(map.desktop).toBeUndefined();
    });
  });

  describe('serializeOverrides', () => {
    it('emite desktop como base y tablet/móvil como @media max-width', () => {
      const css = serializeOverrides({
        desktop: { 'DIV:0>SECTION:1': { paddingTop: '80px' } },
        tablet: { 'DIV:0>SECTION:1': { paddingTop: '48px' } },
        mobile: { 'DIV:0>SECTION:1': { paddingTop: '24px' } },
      });
      expect(css).toContain('#root > div:nth-child(1) > section:nth-child(2) {');
      expect(css).toContain('padding-top: 80px;');
      expect(css).toContain(`@media (max-width: ${BP_MAX.tablet}px) {`);
      expect(css).toContain(`@media (max-width: ${BP_MAX.mobile}px) {`);
      // Orden desktop-first: la base va antes que las media; tablet antes que móvil.
      expect(css.indexOf('80px')).toBeLessThan(css.indexOf('48px'));
      expect(css.indexOf('48px')).toBeLessThan(css.indexOf('24px'));
    });
    it('round-trip: serializa y vuelve a parsear al mismo mapa', () => {
      const map: OverrideMap = {
        desktop: { 'DIV:0': { paddingTop: '80px', backgroundColor: 'rgb(255,255,255)' } },
        mobile: { 'DIV:0': { paddingTop: '24px' } },
      };
      expect(parseOverridesCss(serializeOverrides(map))).toEqual(map);
    });
    it('mapa vacío → solo cabecera + marcador, sin reglas', () => {
      const css = serializeOverrides({});
      expect(css).toContain('PLIA_JSON:{}');
      expect(css).not.toContain('@media');
      expect(css).not.toContain('#root >');
    });
  });
});
