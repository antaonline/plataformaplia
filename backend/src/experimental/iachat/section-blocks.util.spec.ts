import {
  locateMainInner,
  splitJsxSiblings,
  moveBlock,
  duplicateBlock,
} from './section-blocks.util';

const PAGE = `import Hero from "@/components/sections/Hero";
import Menu from "@/components/sections/Menu";
import Footer from "@/components/sections/Footer";

export default function Index() {
  return (
    <main className="min-h-screen bg-background font-body antialiased">
      <Hero />
      <Menu />
      <section data-plia-section="s-abc" className="bg-primary text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4">¿Listo para empezar?</h2>
        </div>
      </section>
      <Footer />
    </main>
  );
}
`;

describe('section-blocks.util', () => {
  it('ubica el interior de <main> y reconstruye sin pérdida', () => {
    const loc = locateMainInner(PAGE);
    expect(loc).not.toBeNull();
    expect(loc!.head + loc!.inner + loc!.tail).toBe(PAGE);
    expect(loc!.head).toContain('<main');
    expect(loc!.tail.startsWith('</main>')).toBe(true);
  });

  it('divide en 4 bloques hermanos y los gaps son solo whitespace', () => {
    const loc = locateMainInner(PAGE)!;
    const parsed = splitJsxSiblings(loc.inner);
    expect(parsed).not.toBeNull();
    expect(parsed!.blocks.length).toBe(4);
    expect(parsed!.gaps.length).toBe(5);
    parsed!.gaps.forEach((g) => expect(/\S/.test(g)).toBe(false));
    // reconstrucción exacta
    let inner = '';
    parsed!.blocks.forEach((b, k) => (inner += parsed!.gaps[k] + b));
    inner += parsed!.gaps[4];
    expect(inner).toBe(loc.inner);
    // identidad de los bloques
    expect(parsed!.blocks[0]).toContain('<Hero');
    expect(parsed!.blocks[1]).toContain('<Menu');
    expect(parsed!.blocks[2]).toContain('data-plia-section="s-abc"');
    expect(parsed!.blocks[3]).toContain('<Footer');
  });

  it('mueve la sección (idx 2) hacia arriba, intercambiándola con Menu', () => {
    const r = moveBlock(PAGE, 2, 'up');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // nuevo orden: Hero, section, Menu, Footer
    const iHero = r.src.indexOf('<Hero');
    const iSec = r.src.indexOf('data-plia-section');
    const iMenu = r.src.indexOf('<Menu');
    const iFooter = r.src.indexOf('<Footer');
    expect(iHero).toBeLessThan(iSec);
    expect(iSec).toBeLessThan(iMenu);
    expect(iMenu).toBeLessThan(iFooter);
    // el resto del archivo intacto
    expect(r.src.startsWith('import Hero')).toBe(true);
    expect(r.src).toContain('export default function Index()');
    expect(r.src.trimEnd().endsWith('}')).toBe(true);
    // mismo conjunto de caracteres (no se perdió nada): longitudes iguales
    expect(r.src.length).toBe(PAGE.length);
  });

  it('mueve hacia abajo y es reversible (volver a subir restituye el original)', () => {
    const down = moveBlock(PAGE, 1, 'down');
    expect(down.ok).toBe(true);
    if (!down.ok) return;
    const back = moveBlock(down.src, 2, 'up');
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.src).toBe(PAGE);
  });

  it('rechaza índices fuera de rango sin tocar el archivo', () => {
    expect(moveBlock(PAGE, 0, 'up')).toEqual({ ok: false, reason: 'oob' });
    expect(moveBlock(PAGE, 3, 'down')).toEqual({ ok: false, reason: 'oob' });
    expect(moveBlock(PAGE, 99, 'up')).toEqual({ ok: false, reason: 'oob' });
  });

  it('duplica un bloque debajo, con id nuevo en la copia', () => {
    const r = duplicateBlock(PAGE, 2, 's-new');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const count = (r.src.match(/<section/g) || []).length;
    expect(count).toBe(2);
    expect(r.src).toContain('data-plia-section="s-abc"');
    expect(r.src).toContain('data-plia-section="s-new"');
    // la copia va después del original y antes del footer
    expect(r.src.indexOf('s-abc')).toBeLessThan(r.src.indexOf('s-new'));
    expect(r.src.indexOf('s-new')).toBeLessThan(r.src.indexOf('<Footer'));
  });

  it('maneja una expresión {map} de nivel superior con < > y =>', () => {
    const page = `export default function Index() {
  return (
    <main>
      <Hero />
      {items.map((it) => (
        <Card key={it.id} active={it.n > 0 ? true : false} />
      ))}
      <Footer />
    </main>
  );
}`;
    const loc = locateMainInner(page)!;
    const parsed = splitJsxSiblings(loc.inner);
    expect(parsed).not.toBeNull();
    expect(parsed!.blocks.length).toBe(3); // Hero, {map}, Footer
    expect(parsed!.blocks[1].startsWith('{items.map')).toBe(true);
    const r = moveBlock(page, 0, 'down');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.src.indexOf('items.map')).toBeLessThan(r.src.indexOf('<Hero'));
  });

  it('aborta de forma segura ante texto suelto a nivel superior', () => {
    const bad = `export default function Index() {
  return (
    <main>
      <Hero /> texto suelto <Footer />
    </main>
  );
}`;
    expect(moveBlock(bad, 0, 'down')).toEqual({ ok: false, reason: 'parse-blocks' });
  });

  it('devuelve no-main cuando no hay <main>', () => {
    expect(moveBlock('<div><Hero /></div>', 0, 'down')).toEqual({ ok: false, reason: 'no-main' });
  });
});
