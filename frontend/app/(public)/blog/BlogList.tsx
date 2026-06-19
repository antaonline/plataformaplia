'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { BlogPost } from './posts';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const [cat, setCat] = useState('Todos');

  const categories = useMemo(() => {
    const set = new Map<string, number>();
    posts.forEach((p) => set.set(p.category, (set.get(p.category) || 0) + 1));
    return ['Todos', ...[...set.keys()]];
  }, [posts]);

  const filtered = useMemo(
    () => (cat === 'Todos' ? posts : posts.filter((p) => p.category === cat)),
    [posts, cat],
  );

  return (
    <>
      {/* Barra secundaria de categorías del blog (no reemplaza el menú del sitio) */}
      <div className="sticky top-[76px] z-30 px-4 mb-10">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition ${
                cat === c
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-white text-foreground/70 border-border hover:border-foreground/30'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group rounded-3xl bg-white border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.cover} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-foreground">
                  {p.category}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-lg font-bold leading-snug group-hover:text-cta-foreground transition">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{fmtDate(p.date)} · {p.readingMinutes} min</span>
                  <ArrowUpRight size={16} className="text-cta-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
