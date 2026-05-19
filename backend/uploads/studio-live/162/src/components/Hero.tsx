import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles, Shield } from 'lucide-react';
import { fadeUp, staggerContainer } from '../lib/utils';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.4 + 0.1,
}));

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-bg">
      {/* Background layered gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-surface to-bg" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/5 via-transparent to-transparent" />
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#F0EDE8 1px, transparent 1px), linear-gradient(90deg, #F0EDE8 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Decorative particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor:
                p.id % 3 === 0
                  ? '#C41E3A'
                  : p.id % 3 === 1
                  ? '#D4A017'
                  : '#FF3A5C',
              opacity: p.opacity,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [p.opacity, p.opacity * 2.5, p.opacity],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Glow orb behind figure */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] z-0 pointer-events-none" />
      <div className="absolute right-1/4 top-1/3 w-[300px] h-[300px] rounded-full bg-secondary/8 blur-[80px] z-0 pointer-events-none" />

      {/* Main layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center min-h-screen">
        {/* Left: Copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 lg:gap-8 pt-20 lg:pt-0"
        >
          {/* Location badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-body font-semibold tracking-widest uppercase backdrop-blur-sm">
              <MapPin size={12} className="text-secondary" />
              Miraflores · Lima · Perú
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeUp} className="flex flex-col gap-1">
            <h1 className="font-heading text-text uppercase leading-none tracking-wider">
              <span className="block text-7xl sm:text-8xl lg:text-9xl">
                Arte
              </span>
              <span className="block text-7xl sm:text-8xl lg:text-9xl text-primary">
                Vinilo
              </span>
              <span className="block text-7xl sm:text-8xl lg:text-9xl">
                Japonés
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="font-body text-text/70 text-base sm:text-lg leading-relaxed max-w-md"
          >
            Figuras sofubi de edición limitada, directamente de los talleres
            más exclusivos de Tokio. Cada pieza es una obra irrepetible para
            coleccionistas que exigen lo extraordinario.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-4"
          >
            {[
              { icon: Shield, label: 'Autenticidad garantizada' },
              { icon: Sparkles, label: 'Ediciones limitadas' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-text/50 text-xs font-body font-medium tracking-wide"
              >
                <Icon size={13} className="text-secondary" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <motion.button
              onClick={() => onNavigate('coleccion')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-text font-body font-semibold text-sm tracking-widest uppercase rounded-sm overflow-hidden transition-all duration-300 hover:bg-accent"
              style={{
                boxShadow: '0 0 0 0 #C41E3A',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 32px 4px rgba(196,30,58,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 0 0 #C41E3A';
              }}
            >
              <span>Ver Colección</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>

            <motion.button
              onClick={() => onNavigate('contacto')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-secondary/50 text-secondary font-body font-semibold text-sm tracking-widest uppercase rounded-sm bg-transparent hover:bg-secondary/10 transition-all duration-300"
            >
              <span>Contactar</span>
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="flex gap-8 pt-4 border-t border-white/8 mt-2"
          >
            {[
              { value: '+200', label: 'Figuras en stock' },
              { value: '100%', label: 'Piezas originales' },
              { value: 'Tokio', label: 'Origen directo' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-heading text-2xl text-secondary tracking-wide">
                  {value}
                </span>
                <span className="font-body text-text/40 text-xs tracking-wider uppercase">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Hero image */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className="relative flex items-center justify-center lg:justify-end"
        >
          {/* Decorative ring */}
          <div className="absolute w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full border border-primary/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-secondary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Floating accent dots */}
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 right-8 w-4 h-4 rounded-full bg-secondary/60"
          />
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 left-8 w-3 h-3 rounded-full bg-primary/70"
          />

          {/* Image container */}
          <div className="relative w-[320px] h-[420px] sm:w-[400px] sm:h-[520px] lg:w-[460px] lg:h-[580px] rounded-sm overflow-hidden">
            <img
              src="https://loremflickr.com/920/1160/vinyl,toy,kaiju,japanese"
              alt="Figura sofubi de vinilo japonés de edición limitada"
              width={460}
              height={580}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = 'none';
                const parent = el.parentElement;
                if (parent) {
                  parent.style.background =
                    'linear-gradient(135deg, #12121A 0%, #1e0a10 50%, #0A0A0F 100%)';
                }
              }}
            />
            {/* Gradient overlays for cohesion */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent" />

            {/* Floating info card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="absolute bottom-6 left-6 right-6 p-4 rounded-sm bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-text text-lg tracking-wider uppercase leading-none">
                    Blobpus × Gargamel
                  </p>
                  <p className="font-body text-text/50 text-xs mt-1 tracking-wide">
                    Edición Tokio 2024 · Vinilo suave japonés
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading text-secondary text-xl tracking-wide leading-none">
                    S/ 980
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-[10px] font-body font-semibold tracking-widest uppercase rounded-sm">
                    Limitado
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="font-body text-text/30 text-[10px] tracking-[0.3em] uppercase">
          Explorar
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-text/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}