import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

const looks = [
  {
    id: 1,
    name: 'SHADOW RUNNER',
    season: 'FW 2025',
    tag: 'Outerwear',
    src: 'https://images.pexels.com/photos/19658525/pexels-photo-19658525.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    alt: 'Look Shadow Runner — chaqueta oversized urbana nocturna',
    span: 'row-span-2',
  },
  {
    id: 2,
    name: 'CONCRETE DRIFT',
    season: 'FW 2025',
    tag: 'Layering',
    src: 'https://images.pexels.com/photos/5213982/pexels-photo-5213982.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    alt: 'Look Concrete Drift — capas urbanas con hoodie y cargo',
    span: '',
  },
  {
    id: 3,
    name: 'VOID SIGNAL',
    season: 'FW 2025',
    tag: 'Essentials',
    src: 'https://images.pexels.com/photos/6596875/pexels-photo-6596875.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    alt: 'Look Void Signal — outfit minimalista negro industrial',
    span: '',
  },
  {
    id: 4,
    name: 'ASPHALT CULT',
    season: 'FW 2025',
    tag: 'Full Look',
    src: 'https://images.pexels.com/photos/5101796/pexels-photo-5101796.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Look Asphalt Cult — full look editorial urbano',
    span: 'col-span-2',
  },
];

const overlayVariants = {
  rest: { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const borderVariants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

interface LookCardProps {
  look: (typeof looks)[number];
  index: number;
}

function LookCard({ look, index }: LookCardProps) {
  return (
    <motion.div
      className={cn('relative overflow-hidden group cursor-pointer', look.span)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      animate="rest"
    >
      {/* Image */}
      <div className="w-full h-full min-h-[320px] bg-surface">
        <img
          src={look.src}
          alt={look.alt}
          width={800}
          height={1100}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = 'none';
            const parent = el.parentElement;
            if (parent) parent.style.background = '#141414';
          }}
        />
      </div>

      {/* Permanent dark gradient at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent pointer-events-none" />

      {/* Season badge top-left */}
      <div className="absolute top-4 left-4 z-10">
        <span className="font-body text-xs tracking-[0.2em] uppercase text-secondary/70 bg-bg/60 backdrop-blur-sm px-3 py-1 border border-secondary/10">
          {look.season}
        </span>
      </div>

      {/* Tag top-right */}
      <div className="absolute top-4 right-4 z-10">
        <span className="font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/50 px-3 py-1 bg-bg/60 backdrop-blur-sm">
          {look.tag}
        </span>
      </div>

      {/* Bottom overlay content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {/* Animated orange border line */}
        <motion.div
          className="h-[2px] bg-accent origin-left mb-4"
          variants={borderVariants}
        />

        <div className="flex items-end justify-between">
          <div>
            <motion.p
              className="font-body text-xs tracking-[0.25em] uppercase text-secondary/50 mb-1"
              variants={overlayVariants}
            >
              Look Editorial
            </motion.p>
            <h3 className="font-heading text-3xl md:text-4xl text-text tracking-wide uppercase leading-none">
              {look.name}
            </h3>
          </div>

          {/* CTA icon */}
          <motion.div
            className="flex-shrink-0 ml-4"
            variants={overlayVariants}
          >
            <div className="w-10 h-10 border border-accent/60 flex items-center justify-center bg-accent/10 hover:bg-accent transition-colors duration-300">
              <ArrowUpRight size={18} className="text-accent group-hover:text-text transition-colors duration-300" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Lookbook() {
  return (
    <section id="lookbook" className="bg-bg py-28 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
              — Lookbook FW 2025
            </p>
            <h2 className="font-heading text-6xl md:text-8xl text-text uppercase leading-none tracking-tight">
              LOOKS
              <br />
              <span className="text-secondary/20">DE CALLE</span>
            </h2>
          </motion.div>

          <motion.p
            className="font-body text-sm md:text-base text-secondary/50 max-w-xs md:text-right leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Cada pieza construida para dominar el asfalto.
            Colección otoño-invierno 2025, disponible ahora.
          </motion.p>
        </div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[480px_380px] gap-3">
          {/* Card 1 — tall left column */}
          <motion.div
            className="relative overflow-hidden group cursor-pointer md:row-span-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover="hover"
            animate="rest"
          >
            <div className="w-full h-full min-h-[480px] bg-surface">
              <img
                src={looks[0].src}
                alt={looks[0].alt}
                width={800}
                height={1100}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) parent.style.background = '#141414';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-secondary/70 bg-bg/60 backdrop-blur-sm px-3 py-1 border border-secondary/10">
                {looks[0].season}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/50 px-3 py-1 bg-bg/60 backdrop-blur-sm">
                {looks[0].tag}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <motion.div className="h-[2px] bg-accent origin-left mb-4" variants={borderVariants} />
              <div className="flex items-end justify-between">
                <div>
                  <motion.p className="font-body text-xs tracking-[0.25em] uppercase text-secondary/50 mb-1" variants={overlayVariants}>
                    Look Editorial
                  </motion.p>
                  <h3 className="font-heading text-3xl md:text-4xl text-text tracking-wide uppercase leading-none">
                    {looks[0].name}
                  </h3>
                </div>
                <motion.div className="flex-shrink-0 ml-4" variants={overlayVariants}>
                  <div className="w-10 h-10 border border-accent/60 flex items-center justify-center bg-accent/10 hover:bg-accent transition-colors duration-300">
                    <ArrowUpRight size={18} className="text-accent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 — top center */}
          <motion.div
            className="relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover="hover"
            animate="rest"
          >
            <div className="w-full h-full min-h-[320px] bg-surface">
              <img
                src={looks[1].src}
                alt={looks[1].alt}
                width={700}
                height={600}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) parent.style.background = '#141414';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-secondary/70 bg-bg/60 backdrop-blur-sm px-3 py-1 border border-secondary/10">
                {looks[1].season}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/50 px-3 py-1 bg-bg/60 backdrop-blur-sm">
                {looks[1].tag}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <motion.div className="h-[2px] bg-accent origin-left mb-4" variants={borderVariants} />
              <div className="flex items-end justify-between">
                <div>
                  <motion.p className="font-body text-xs tracking-[0.25em] uppercase text-secondary/50 mb-1" variants={overlayVariants}>
                    Look Editorial
                  </motion.p>
                  <h3 className="font-heading text-2xl md:text-3xl text-text tracking-wide uppercase leading-none">
                    {looks[1].name}
                  </h3>
                </div>
                <motion.div className="flex-shrink-0 ml-4" variants={overlayVariants}>
                  <div className="w-10 h-10 border border-accent/60 flex items-center justify-center bg-accent/10 hover:bg-accent transition-colors duration-300">
                    <ArrowUpRight size={18} className="text-accent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 — top right */}
          <motion.div
            className="relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover="hover"
            animate="rest"
          >
            <div className="w-full h-full min-h-[320px] bg-surface">
              <img
                src={looks[2].src}
                alt={looks[2].alt}
                width={700}
                height={600}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) parent.style.background = '#141414';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-secondary/70 bg-bg/60 backdrop-blur-sm px-3 py-1 border border-secondary/10">
                {looks[2].season}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/50 px-3 py-1 bg-bg/60 backdrop-blur-sm">
                {looks[2].tag}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <motion.div className="h-[2px] bg-accent origin-left mb-4" variants={borderVariants} />
              <div className="flex items-end justify-between">
                <div>
                  <motion.p className="font-body text-xs tracking-[0.25em] uppercase text-secondary/50 mb-1" variants={overlayVariants}>
                    Look Editorial
                  </motion.p>
                  <h3 className="font-heading text-2xl md:text-3xl text-text tracking-wide uppercase leading-none">
                    {looks[2].name}
                  </h3>
                </div>
                <motion.div className="flex-shrink-0 ml-4" variants={overlayVariants}>
                  <div className="w-10 h-10 border border-accent/60 flex items-center justify-center bg-accent/10 hover:bg-accent transition-colors duration-300">
                    <ArrowUpRight size={18} className="text-accent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Card 4 — bottom spanning center+right */}
          <motion.div
            className="relative overflow-hidden group cursor-pointer md:col-span-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.36, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover="hover"
            animate="rest"
          >
            <div className="w-full h-full min-h-[320px] bg-surface">
              <img
                src={looks[3].src}
                alt={looks[3].alt}
                width={800}
                height={900}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) parent.style.background = '#141414';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-secondary/70 bg-bg/60 backdrop-blur-sm px-3 py-1 border border-secondary/10">
                {looks[3].season}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/50 px-3 py-1 bg-bg/60 backdrop-blur-sm">
                {looks[3].tag}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <motion.div className="h-[2px] bg-accent origin-left mb-4" variants={borderVariants} />
              <div className="flex items-end justify-between">
                <div>
                  <motion.p className="font-body text-xs tracking-[0.25em] uppercase text-secondary/50 mb-1" variants={overlayVariants}>
                    Look Editorial
                  </motion.p>
                  <h3 className="font-heading text-3xl md:text-5xl text-text tracking-wide uppercase leading-none">
                    {looks[3].name}
                  </h3>
                </div>
                <motion.div className="flex-shrink-0 ml-4" variants={overlayVariants}>
                  <div className="w-10 h-10 border border-accent/60 flex items-center justify-center bg-accent/10 hover:bg-accent transition-colors duration-300">
                    <ArrowUpRight size={18} className="text-accent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-secondary/10 pt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm text-secondary/40 tracking-wide">
            Colección completa disponible en tienda y online.
          </p>
          <button
            className="group flex items-center gap-3 font-heading text-xl tracking-widest uppercase text-text border border-secondary/20 px-8 py-4 hover:border-accent hover:text-accent transition-all duration-300"
            aria-label="Ver lookbook completo"
          >
            Ver Lookbook Completo
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}