'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';

type Demo = {
  slug: string;
  brand: string;
  label: string;
  category: string;
  url: string;
  thumb: string;
  accent: string;
};

export default function EjemplosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [cat, setCat] = useState<string>('Todos');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL del backend (NEXT_PUBLIC_API_URL puede venir con o sin sufijo /api).
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '').replace(/\/api$/, '');
    const showcaseUrl = apiOrigin ? `${apiOrigin}/api/projects/showcase` : '/api/projects/showcase';

    // Demos estáticos (manifest) + proyectos reales marcados como showcase.
    Promise.allSettled([
      fetch('/demos-manifest.json').then((r) => r.json()),
      fetch(showcaseUrl).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([m, s]) => {
        const demos: Demo[] = m.status === 'fulfilled' && Array.isArray(m.value) ? m.value : [];
        const showcase: Demo[] = s.status === 'fulfilled' && Array.isArray(s.value) ? s.value : [];
        setDemos([...showcase, ...demos]); // proyectos reales primero
      })
      .catch(() => setDemos([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Map<string, number>();
    demos.forEach((d) => set.set(d.category, (set.get(d.category) || 0) + 1));
    return ['Todos', ...[...set.keys()].sort()];
  }, [demos]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return demos.filter(
      (d) =>
        (cat === 'Todos' || d.category === cat) &&
        (!term || d.label.toLowerCase().includes(term) || d.brand.toLowerCase().includes(term) || d.category.toLowerCase().includes(term)),
    );
  }, [demos, cat, q]);

  return (
    <div className="bg-[#f7f7f5] min-h-screen">
      {/* Hero */}
      <section className="px-4 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground bg-cta/10 px-3 py-1.5 rounded-full mb-5">
            Nuestro trabajo
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Ejemplos de webs por rubro
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Mira el tipo de web que creamos para cada tipo de negocio. Explora por sector y abre cada
            demo en vivo. Tu web se vería así de profesional — adaptada a tu marca.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-4 sticky top-0 z-30 backdrop-blur-md bg-[#f7f7f5]/85 border-y border-border">
        <div className="max-w-7xl mx-auto py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition ${
                  cat === c
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-white text-foreground/70 border-border hover:border-foreground/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative shrink-0 lg:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar rubro…"
              className="w-full pl-9 pr-3 py-2 rounded-full border border-border bg-white text-sm outline-none focus:border-foreground/40"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-white border border-border overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-5 w-40 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No encontramos demos con ese filtro.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} {filtered.length === 1 ? 'ejemplo' : 'ejemplos'}
                {cat !== 'Todos' && <> en <strong className="text-foreground">{cat}</strong></>}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((d) => (
                  <a
                    key={d.slug}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-3xl bg-white border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.thumb}
                        alt={d.label}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      <span
                        className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ background: d.accent }}
                      >
                        {d.category}
                      </span>
                    </div>
                    <div className="p-5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold truncate">{d.label}</h3>
                        <p className="text-sm text-muted-foreground truncate">{d.brand}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-cta-foreground">
                        Ver demo
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-foreground text-background px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">¿Quieres una web así para tu negocio?</h2>
          <p className="mt-3 text-background/70 max-w-xl mx-auto">
            Cuéntanos de tu negocio y te creamos una web profesional, lista para vender.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/registro" className="bg-cta text-cta-foreground font-semibold px-7 py-3 rounded-full hover:opacity-90 transition">
              Crear mi web gratis
            </Link>
            <Link href="/planes" className="bg-background/10 border border-background/20 font-semibold px-7 py-3 rounded-full hover:bg-background/20 transition">
              Ver planes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
