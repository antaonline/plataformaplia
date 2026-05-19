import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-bg">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/33345481/pexels-photo-33345481.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
          alt="Auto deportivo de lujo"
          width={1920}
          height={1080}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Cinematic overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
        {/* Subtle red radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(196,30,58,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Decorative vertical line */}
      <div className="absolute left-8 md:left-16 top-0 bottom-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-px h-32 bg-gradient-to-b from-transparent to-primary/60" />
        <div className="w-1 h-1 rounded-full bg-primary mt-1" />
        <div className="w-px flex-1 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent mt-1" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 md:px-16 lg:px-24 pt-28 pb-24">
        <div className="max-w-3xl">

          {/* Exclusivity badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <Shield size={14} className="text-secondary" />
            <span
              className="text-secondary font-body text-xs font-semibold tracking-[0.25em] uppercase"
            >
              Concesionaria de élite — Acceso exclusivo
            </span>
            <div className="h-px w-12 bg-secondary/50" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25 }}
            className="font-heading text-text uppercase leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '-0.01em' }}
          >
            Conduce{' '}
            <span
              className="text-primary"
              style={{
                textShadow: '0 0 60px rgba(196,30,58,0.35)',
              }}
            >
              lo
            </span>
            <br />
            imposible
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="font-body text-text/60 text-base md:text-lg leading-relaxed max-w-xl mb-10"
          >
            Curación de los supercars más exclusivos del mundo. Cada vehículo es una obra de ingeniería
            seleccionada para quienes no aceptan compromisos entre potencia y elegancia.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            {/* Primary CTA */}
            <button
              className="group inline-flex items-center justify-center gap-3 bg-primary hover:bg-accent text-text font-body font-semibold text-sm tracking-widest uppercase px-8 py-4 transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
            >
              <span>Explorar catálogo</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            {/* Secondary CTA */}
            <button
              className="group inline-flex items-center justify-center gap-3 border border-text/20 hover:border-secondary/60 text-text/70 hover:text-secondary font-body font-semibold text-sm tracking-widest uppercase px-8 py-4 transition-all duration-300 bg-transparent hover:bg-secondary/5"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
            >
              <span>Agendar test drive</span>
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.78 }}
            className="flex flex-wrap gap-x-10 gap-y-4"
          >
            {[
              { value: '+120', label: 'Vehículos en stock' },
              { value: '18', label: 'Años de experiencia' },
              { value: '40+', label: 'Marcas premium' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="font-heading text-3xl text-text leading-none"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {stat.value}
                </span>
                <span className="font-body text-xs text-text/40 tracking-wider uppercase mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-body text-xs text-text/30 tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-text/30" />
        </motion.div>
      </motion.div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />
    </section>
  );
}