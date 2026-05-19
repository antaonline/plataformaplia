import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Sparkles } from 'lucide-react';
import { collection } from '../data/collection';

interface PieceCardProps {
  piece: (typeof collection)[0];
  size?: 'large' | 'medium' | 'small';
  index?: number;
}

function PieceCard({ piece, size = 'small', index = 0 }: PieceCardProps) {
  const imgHeight =
    size === 'large' ? 'h-[400px] lg:h-[500px]' : size === 'medium' ? 'h-[260px]' : 'h-[210px]';
  const titleSize =
    size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-lg';
  const priceSize =
    size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-xl';
  const padding = size === 'large' ? 'p-7' : size === 'medium' ? 'p-5' : 'p-4';

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative overflow-hidden rounded-sm bg-surface border border-primary/20 cursor-pointer
        hover:border-primary/60 hover:shadow-[0_0_40px_rgba(201,168,76,0.18)] transition-all duration-500 flex flex-col"
    >
      {/* Image */}
      <div className={`relative overflow-hidden flex-shrink-0 ${imgHeight}`}>
        <img
          src={piece.imagen}
          alt={piece.nombre}
          width={600}
          height={500}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = 'none';
            const p = t.parentElement;
            if (p) {
              p.style.background =
                'linear-gradient(135deg, #141414 0%, #1e1a0e 50%, #0A0A0A 100%)';
            }
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent opacity-75 group-hover:opacity-55 transition-opacity duration-500" />

        {/* Edición limitada badge */}
        {piece.edicionLimitada && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-secondary/90 backdrop-blur-sm border border-secondary/50 text-text text-[10px] font-body font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm">
            <Sparkles size={9} className="text-accent" />
            Edición Limitada
          </div>
        )}

        {/* Rareza badge */}
        {piece.rareza && (
          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-bg text-[9px] font-body font-black tracking-widest uppercase px-2 py-1 rounded-sm">
            {piece.rareza}
          </div>
        )}

        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className={`relative flex flex-col flex-1 ${padding}`}>
        {/* Origin */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={11} className="text-primary/70 flex-shrink-0" />
          <span className="text-primary/70 font-body text-[11px] tracking-widest uppercase truncate">
            {piece.origen}
          </span>
        </div>

        {/* Name */}
        <h3
          className={`font-heading italic font-bold text-text leading-tight mb-2 group-hover:text-accent transition-colors duration-300 ${titleSize}`}
        >
          {piece.nombre}
        </h3>

        {/* Artist */}
        {piece.artista && (
          <p className="font-body text-text/45 text-[11px] tracking-wide mb-2 uppercase">
            Por <span className="text-accent/70">{piece.artista}</span>
          </p>
        )}

        {/* Description */}
        {(size === 'large' || size === 'medium') && (
          <p className="font-body text-text/55 text-sm leading-relaxed mb-4 line-clamp-2">
            {piece.descripcion}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="font-body text-[10px] text-text/40 tracking-widest uppercase block mb-0.5">
              Precio
            </span>
            <span
              className={`font-heading font-black text-primary tracking-tight ${priceSize}`}
            >
              {piece.precio}
            </span>
          </div>
          <div className="flex items-center gap-0.5 pb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className="text-primary/50 fill-primary/30 group-hover:text-accent group-hover:fill-accent/50 transition-colors duration-300"
              />
            ))}
          </div>
        </div>

        {/* Hover line */}
        <div className="mt-4 h-px bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.article>
  );
}

export default function FeaturedCollection() {
  const featured = collection.slice(0, 9);

  return (
    <section id="coleccion" className="bg-bg py-28 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(201,168,76,0.07),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_85%,rgba(139,26,26,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_60%,rgba(201,168,76,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 mb-5"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="font-body text-primary text-xs tracking-[0.3em] uppercase font-semibold">
              Colección Destacada
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-black italic text-text tracking-tight leading-none mb-5"
          >
            Piezas de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Excepción
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="font-body text-text/55 text-lg max-w-xl leading-relaxed"
          >
            Cada figura es una obra de arte irrepetible. Selección curada de los maestros vinilistas
            más cotizados de Japón y China, disponibles exclusivamente en Zofubi Luxury.
          </motion.p>
        </motion.div>

        {/* ── Row 1: 1 large + 2 medium ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
          {/* Large hero card spans 1 col but taller */}
          <div className="md:col-span-2 lg:col-span-1">
            <PieceCard piece={featured[0]} size="large" index={0} />
          </div>
          <div className="flex flex-col gap-4 lg:gap-5">
            <PieceCard piece={featured[1]} size="medium" index={1} />
          </div>
          <div className="flex flex-col gap-4 lg:gap-5">
            <PieceCard piece={featured[2]} size="medium" index={2} />
          </div>
        </div>

        {/* ── Row 2: 3 equal small ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
          <PieceCard piece={featured[3]} size="small" index={3} />
          <PieceCard piece={featured[4]} size="small" index={4} />
          <PieceCard piece={featured[5]} size="small" index={5} />
        </div>

        {/* ── Row 3: 1 medium wide + 2 small ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <div className="md:col-span-2 lg:col-span-1">
            <PieceCard piece={featured[6]} size="medium" index={6} />
          </div>
          <PieceCard piece={featured[7]} size="small" index={7} />
          <PieceCard piece={featured[8]} size="small" index={8} />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-text/45 text-sm tracking-widest uppercase mb-6">
            Más de 120 piezas exclusivas disponibles
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 bg-transparent border border-primary/50 hover:border-primary text-primary hover:text-accent font-body text-sm font-semibold tracking-[0.2em] uppercase px-10 py-4 rounded-sm transition-all duration-300 hover:shadow-[0_0_28px_rgba(201,168,76,0.22)]"
          >
            <Sparkles size={14} />
            Explorar Colección Completa
            <Sparkles size={14} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}