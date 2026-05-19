import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { fadeUp, staggerContainer, fadeIn } from '../lib/utils';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://loremflickr.com/1920/1080/sofubi,vinyl,toy,japanese,figure"
          alt="Colección sofubi de lujo"
          width={1920}
          height={1080}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/50 to-bg/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-transparent to-bg/60" />
      </div>

      {/* Decorative golden lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent z-10" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent z-10" />

      {/* Decorative corner ornaments */}
      <div className="absolute top-28 left-8 z-10 hidden md:block">
        <div className="w-16 h-16 border-l border-t border-primary/50" />
      </div>
      <div className="absolute bottom-16 right-8 z-10 hidden md:block">
        <div className="w-16 h-16 border-r border-b border-primary/50" />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl z-0 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 mb-8"
        >
          <div className="h-px w-10 bg-primary/70" />
          <span className="text-primary font-body text-xs tracking-[0.3em] uppercase font-medium">
            Miraflores · Lima · Perú
          </span>
          <div className="h-px w-10 bg-primary/70" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-heading font-black text-text leading-[0.9] mb-6"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}
        >
          <span className="block italic text-primary/90">Arte Sofubi</span>
          <span className="block tracking-tight">de Colección</span>
          <span className="block italic text-accent/80 text-[0.7em]">Japonesa</span>
        </motion.h1>

        {/* Decorative separator */}
        <motion.div
          variants={fadeIn}
          className="flex items-center justify-center gap-4 my-8"
        >
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-primary/60" />
          <Star className="w-4 h-4 text-primary fill-primary" />
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-primary/60" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="font-body text-text/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Figuras sofubi de vinilo japonés de edición limitada. Piezas únicas de los artistas más
          exclusivos de Asia, disponibles para coleccionistas que exigen lo extraordinario.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate('coleccion')}
            className="group relative inline-flex items-center gap-3 bg-primary hover:bg-accent text-bg font-body font-semibold text-sm tracking-[0.15em] uppercase px-10 py-4 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Explorar Colección</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </button>

          <button
            onClick={() => onNavigate('membresia')}
            className="group inline-flex items-center gap-3 border border-primary/50 hover:border-primary text-text hover:text-primary font-body font-medium text-sm tracking-[0.15em] uppercase px-10 py-4 transition-all duration-300 bg-transparent hover:bg-primary/5"
          >
            <span>Membresía VIP</span>
            <div className="w-4 h-px bg-current group-hover:w-6 transition-all duration-300" />
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: '+200', label: 'Piezas Únicas' },
            { value: '+40', label: 'Artistas Asiáticos' },
            { value: '100%', label: 'Edición Limitada' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading font-black text-primary text-3xl md:text-4xl leading-none mb-1">
                {stat.value}
              </p>
              <p className="font-body text-text/50 text-xs tracking-widest uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="font-body text-text/30 text-xs tracking-[0.25em] uppercase">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}