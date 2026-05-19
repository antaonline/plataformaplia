import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TARGET_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 43 * 60 * 1000);

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="block font-heading text-5xl md:text-7xl text-text leading-none tabular-nums"
        >
          {display}
        </motion.span>
      </div>
      <span className="font-body text-xs uppercase tracking-[0.2em] text-secondary/50 mt-1">
        {label}
      </span>
    </div>
  );
}

export default function PromoHero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(TARGET_DATE));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(TARGET_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-bg" style={{ minHeight: '92vh' }}>
      {/* Background image with aggressive overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/31502130/pexels-photo-31502130.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
          alt=""
          width={1600}
          height={900}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Multi-layer dark overlay for ultra-dark aesthetic */}
        <div className="absolute inset-0 bg-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />
      </div>

      {/* Accent vertical line decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[92vh] py-24">
        <div className="max-w-3xl">

          {/* Campaign badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <Zap size={14} className="text-accent fill-accent" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-accent font-semibold">
              Campaña Limitada — Drop 004
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="font-heading uppercase text-text leading-none tracking-tight">
              <span className="block text-[clamp(4rem,12vw,9rem)]">HASTA</span>
              <span className="block text-[clamp(4rem,12vw,9rem)] text-accent">40% OFF</span>
              <span className="block text-[clamp(2.5rem,7vw,5.5rem)] text-secondary/70">
                COLECCIÓN OTOÑO
              </span>
            </h2>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body text-secondary/60 text-base md:text-lg mt-6 mb-12 max-w-md leading-relaxed"
          >
            Piezas de edición limitada. Stock crítico. Sin reposición.
            La ventana se cierra cuando el contador llega a cero.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12"
          >
            <p className="font-body text-xs uppercase tracking-[0.25em] text-secondary/40 mb-5">
              La oferta termina en
            </p>
            <div className="flex items-start gap-4 md:gap-8">
              <CountdownUnit value={timeLeft.days} label="Días" />
              <span className="font-heading text-4xl md:text-6xl text-accent/60 leading-none mt-1 select-none">:</span>
              <CountdownUnit value={timeLeft.hours} label="Horas" />
              <span className="font-heading text-4xl md:text-6xl text-accent/60 leading-none mt-1 select-none">:</span>
              <CountdownUnit value={timeLeft.minutes} label="Min" />
              <span className="font-heading text-4xl md:text-6xl text-accent/60 leading-none mt-1 select-none">:</span>
              <CountdownUnit value={timeLeft.seconds} label="Seg" />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 bg-accent text-bg font-body font-bold text-sm uppercase tracking-[0.15em] px-8 py-4 transition-all duration-200 hover:bg-accent/90"
            >
              Comprar Ahora
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 border border-secondary/20 text-secondary/70 font-body font-medium text-sm uppercase tracking-[0.15em] px-8 py-4 hover:border-secondary/50 hover:text-text transition-all duration-200"
            >
              Ver Colección
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent/60 via-accent/20 to-transparent z-20" />

      {/* Floating promo tag - desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2"
      >
        <div className="border border-accent/30 bg-surface/80 backdrop-blur-sm px-6 py-8 flex flex-col items-center gap-4">
          <span className="font-heading text-7xl text-accent leading-none">40</span>
          <div className="w-full h-px bg-accent/30" />
          <span className="font-body text-xs uppercase tracking-[0.2em] text-secondary/60">
            % descuento
          </span>
          <div className="w-8 h-8 border border-accent/40 flex items-center justify-center">
            <Zap size={14} className="text-accent fill-accent" />
          </div>
          <span className="font-body text-[10px] uppercase tracking-[0.15em] text-secondary/40 text-center">
            Tiempo<br />limitado
          </span>
        </div>
      </motion.div>
    </section>
  );
}