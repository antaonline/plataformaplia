import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const artists = [
  {
    id: 1,
    name: 'Medicom Toy',
    origin: 'Tokio, Japón',
    specialty: 'Sofubi premium & Be@rbrick',
    description: 'El gigante del vinilo japonés. Sus piezas de edición limitada definen el estándar del coleccionismo mundial.',
    tags: ['Vinilo', 'Edición Limitada', 'Icónico'],
    image: 'https://loremflickr.com/400/500/japanese,toy,vinyl,figure',
    seed: 'medicom',
    accentColor: 'primary',
  },
  {
    id: 2,
    name: 'Blobpus',
    origin: 'Osaka, Japón',
    specialty: 'Kaiju underground & horror sofubi',
    description: 'Maestro del kaiju grotesco y visceral. Sus criaturas de vinilo son obras de arte del underground japonés.',
    tags: ['Kaiju', 'Horror', 'Underground'],
    image: 'https://loremflickr.com/400/500/monster,kaiju,vinyl,creature',
    seed: 'blobpus',
    accentColor: 'accent',
  },
  {
    id: 3,
    name: 'Marmit',
    origin: 'Tokio, Japón',
    specialty: 'Kaiju clásico & tokusatsu vintage',
    description: 'Herederos de la tradición Bullmark. Sus figuras rinden homenaje a los monstruos que definieron una era.',
    tags: ['Vintage', 'Tokusatsu', 'Clásico'],
    image: 'https://loremflickr.com/400/500/retro,robot,japanese,collectible',
    seed: 'marmit',
    accentColor: 'secondary',
  },
  {
    id: 4,
    name: 'Secret Base',
    origin: 'Tokio, Japón',
    specialty: 'Sofubi neo-kaiju & colaboraciones',
    description: 'Vanguardia del sofubi contemporáneo. Colaboraciones exclusivas con artistas globales y tirajes de autor.',
    tags: ['Neo-Kaiju', 'Colaboración', 'Arte'],
    image: 'https://loremflickr.com/400/500/abstract,toy,sculpture,dark',
    seed: 'secretbase',
    accentColor: 'primary',
  },
  {
    id: 5,
    name: 'Gargamel',
    origin: 'Tokio, Japón',
    specialty: 'Kaiju artesanal & pintado a mano',
    description: 'Cada pieza es única. El estudio de Kiyoka Ikeda eleva el sofubi a la categoría de escultura coleccionable.',
    tags: ['Artesanal', 'Pintado a mano', 'Escaso'],
    image: 'https://loremflickr.com/400/500/handpainted,figure,art,collectible',
    seed: 'gargamel',
    accentColor: 'secondary',
  },
  {
    id: 6,
    name: 'Marusan',
    origin: 'Tokio, Japón',
    specialty: 'Sofubi fundacional & Godzilla original',
    description: 'La casa que inventó el sofubi en los 60. Sus reediciones y originales son el Santo Grial del coleccionismo.',
    tags: ['Fundacional', 'Godzilla', 'Historia'],
    image: 'https://loremflickr.com/400/500/godzilla,monster,vintage,japan',
    seed: 'marusan',
    accentColor: 'accent',
  },
  {
    id: 7,
    name: 'Realxhead',
    origin: 'Tokio, Japón',
    specialty: 'Sofubi psicodélico & colorways únicos',
    description: 'Mirock Toy bajo el alias Realxhead produce los colorways más buscados del mercado secundario global.',
    tags: ['Psicodélico', 'Colorways', 'Cult'],
    image: 'https://loremflickr.com/400/500/psychedelic,colorful,toy,vinyl',
    seed: 'realxhead',
    accentColor: 'primary',
  },
  {
    id: 8,
    name: 'Skull Toys',
    origin: 'Osaka, Japón',
    specialty: 'Sofubi oscuro & ediciones micro-tiraje',
    description: 'Tirajes de 10 a 30 unidades por colorway. Sus piezas alcanzan multiplicadores de 10x en el mercado secundario.',
    tags: ['Micro-tiraje', 'Inversión', 'Oscuro'],
    image: 'https://loremflickr.com/400/500/skull,dark,toy,japan',
    seed: 'skulltoys',
    accentColor: 'accent',
  },
];

const accentMap: Record<string, string> = {
  primary: 'border-primary/60 text-primary bg-primary/10',
  accent: 'border-accent/60 text-accent bg-accent/10',
  secondary: 'border-secondary/60 text-secondary bg-secondary/10',
};

const glowMap: Record<string, string> = {
  primary: 'hover:shadow-[0_0_30px_rgba(196,30,58,0.35)]',
  accent: 'hover:shadow-[0_0_30px_rgba(255,58,92,0.35)]',
  secondary: 'hover:shadow-[0_0_30px_rgba(212,160,23,0.35)]',
};

const borderHoverMap: Record<string, string> = {
  primary: 'hover:border-primary/60',
  accent: 'hover:border-accent/60',
  secondary: 'hover:border-secondary/60',
};

const overlayMap: Record<string, string> = {
  primary: 'from-primary/60',
  accent: 'from-accent/60',
  secondary: 'from-secondary/60',
};

const dotMap: Record<string, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  secondary: 'bg-secondary',
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ArtistsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 420;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-28 bg-bg overflow-hidden"
      aria-labelledby="artists-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(240,237,232,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-secondary" />
              <span className="font-body text-secondary text-sm tracking-[0.25em] uppercase font-semibold">
                Casas de autor
              </span>
            </div>
            <h2
              id="artists-heading"
              className="font-heading text-6xl lg:text-8xl text-text tracking-wider leading-none uppercase mb-6"
            >
              Maestros del
              <br />
              <span className="text-primary">Vinilo</span>
            </h2>
            <p className="font-body text-text/60 text-lg leading-relaxed max-w-xl">
              Representamos exclusivamente a los estudios más codiciados del sofubi japonés.
              Cada artista es una firma de autor con décadas de historia y comunidades de
              coleccionistas en todo el mundo.
            </p>
          </motion.div>

          {/* Navigation controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <span className="font-body text-text/40 text-sm hidden lg:block">
              {artists.length} artistas disponibles
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                aria-label="Anterior artista"
                className="w-12 h-12 rounded-full border border-text/20 bg-surface/60 backdrop-blur flex items-center justify-center text-text/60 hover:text-text hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Siguiente artista"
                className="w-12 h-12 rounded-full border border-text/20 bg-surface/60 backdrop-blur flex items-center justify-center text-text/60 hover:text-text hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group"
              >
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scrollable carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {artists.map((artist, i) => (
              <motion.article
                key={artist.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={cn(
                  'flex-shrink-0 w-80 group relative rounded-2xl overflow-hidden',
                  'border border-white/8 bg-surface/60 backdrop-blur-sm',
                  'transition-all duration-500 cursor-pointer',
                  glowMap[artist.accentColor],
                  borderHoverMap[artist.accentColor],
                )}
                style={{ minWidth: '320px' }}
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${artist.seed}/400/500`}
                    alt={`${artist.name} — ${artist.specialty}`}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = 'none';
                      const parent = t.parentElement;
                      if (parent) {
                        parent.style.background =
                          'linear-gradient(135deg, #12121A 0%, #1a1a2e 100%)';
                      }
                    }}
                  />
                  {/* Overlay gradient */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t to-transparent opacity-70',
                      overlayMap[artist.accentColor],
                    )}
                  />
                  {/* Origin badge */}
                  <div className="absolute top-4 left-4">
                    <span className="font-body text-xs text-text/80 bg-bg/70 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full tracking-wide">
                      {artist.origin}
                    </span>
                  </div>
                  {/* External link icon on hover */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-bg/70 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <ExternalLink size={14} className="text-text/80" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Status dot + name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        dotMap[artist.accentColor],
                      )}
                    />
                    <h3 className="font-heading text-2xl text-text tracking-wider uppercase leading-none">
                      {artist.name}
                    </h3>
                  </div>

                  <p className="font-body text-sm text-text/50 mb-3 tracking-wide">
                    {artist.specialty}
                  </p>

                  <p className="font-body text-sm text-text/70 leading-relaxed mb-5 line-clamp-2">
                    {artist.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {artist.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'font-body text-xs px-2.5 py-1 rounded-full border tracking-wide',
                          accentMap[artist.accentColor],
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    `bg-${artist.accentColor}`,
                  )}
                  style={{
                    background:
                      artist.accentColor === 'primary'
                        ? '#C41E3A'
                        : artist.accentColor === 'accent'
                        ? '#FF3A5C'
                        : '#D4A017',
                  }}
                />
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: '8+', label: 'Estudios exclusivos', color: 'text-primary' },
            { value: '60+', label: 'Años de historia sofubi', color: 'text-secondary' },
            { value: '500+', label: 'Piezas en catálogo', color: 'text-accent' },
            { value: '100%', label: 'Autenticidad garantizada', color: 'text-secondary' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl bg-surface/40 border border-white/6 backdrop-blur-sm"
            >
              <div className={cn('font-heading text-4xl lg:text-5xl tracking-wider mb-2', stat.color)}>
                {stat.value}
              </div>
              <div className="font-body text-text/50 text-sm tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}