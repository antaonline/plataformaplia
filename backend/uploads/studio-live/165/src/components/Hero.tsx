import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-bg overflow-hidden flex items-center">
      {/* Background texture via CSS gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#E8571A08_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#F5F0E808_0%,_transparent_50%)] pointer-events-none" />

      {/* Vertical text decoration */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-10">
        <div className="w-px h-24 bg-gradient-to-b from-transparent to-accent/60" />
        <span
          className="text-accent/50 font-body text-[10px] tracking-[0.3em] uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          SS 2025 Collection
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-accent/60 to-transparent" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[80vh]">

          {/* LEFT: Text block */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center z-10 order-2 lg:order-1">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 w-fit"
            >
              <div className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-4 py-2 rounded-none">
                <Zap size={12} className="text-accent fill-accent" />
                <span className="font-body text-accent text-xs tracking-[0.2em] uppercase font-semibold">
                  Nueva Colección
                </span>
              </div>
              <div className="w-8 h-px bg-accent/40" />
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-secondary uppercase leading-[0.9] text-[clamp(4rem,10vw,8rem)] tracking-[-0.02em]"
              >
                URBN
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading uppercase leading-[0.9] text-[clamp(4rem,10vw,8rem)] tracking-[-0.02em]"
                style={{ WebkitTextStroke: '1px #F5F0E8', color: 'transparent' }}
              >
                DISTRICT
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-accent uppercase leading-[0.9] text-[clamp(4rem,10vw,8rem)] tracking-[-0.02em]"
              >
                2025
              </motion.h1>
            </div>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="font-body text-secondary/60 text-base lg:text-lg leading-relaxed max-w-sm mb-10"
            >
              Ropa que habla por ti. Piezas construidas para la calle, diseñadas para durar. Sin concesiones.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <button
                className={cn(
                  'group flex items-center gap-3 bg-accent text-bg font-body font-bold text-sm tracking-[0.12em] uppercase',
                  'px-8 py-4 transition-all duration-300 hover:bg-secondary hover:text-bg'
                )}
              >
                Explorar Colección
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button className="group flex items-center gap-3 font-body text-secondary/70 text-sm tracking-[0.12em] uppercase hover:text-secondary transition-colors duration-300">
                <span className="w-8 h-px bg-secondary/40 group-hover:w-12 group-hover:bg-secondary transition-all duration-300" />
                Ver Lookbook
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex items-center gap-8 mt-14 pt-8 border-t border-secondary/10"
            >
              {[
                { value: '48', label: 'Piezas' },
                { value: '12K+', label: 'Comunidad' },
                { value: '100%', label: 'Calidad' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-heading text-secondary text-3xl tracking-tight leading-none">
                    {stat.value}
                  </span>
                  <span className="font-body text-secondary/40 text-xs tracking-[0.15em] uppercase mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Editorial image */}
          <div className="lg:col-span-6 xl:col-span-7 relative order-1 lg:order-2 flex items-center justify-end">

            {/* Decorative frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[620px] ml-auto"
            >
              {/* Accent border top-right */}
              <div className="absolute -top-3 -right-3 w-24 h-24 border-t-2 border-r-2 border-accent z-20 pointer-events-none" />
              {/* Accent border bottom-left */}
              <div className="absolute -bottom-3 -left-3 w-24 h-24 border-b-2 border-l-2 border-secondary/30 z-20 pointer-events-none" />

              {/* Image container */}
              <div className="relative overflow-hidden aspect-[3/4] bg-surface">
                <img
                  src="https://images.pexels.com/photos/12151002/pexels-photo-12151002.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
                  alt="Modelo editorial URBN DISTRICT colección 2025"
                  width={620}
                  height={826}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.parentElement as HTMLElement).style.background = '#141414';
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />

                {/* Floating tag */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="absolute bottom-8 left-6 bg-bg/80 backdrop-blur-sm border border-secondary/10 px-4 py-3"
                >
                  <p className="font-body text-secondary/50 text-[10px] tracking-[0.2em] uppercase mb-1">Destacado</p>
                  <p className="font-heading text-secondary text-xl tracking-wide uppercase">Cargo Oversized</p>
                  <p className="font-body text-accent text-sm font-semibold mt-1">€89</p>
                </motion.div>
              </div>

              {/* Background accent blob */}
              <div className="absolute -z-10 inset-0 translate-x-4 translate-y-4 bg-accent/8" />
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="absolute bottom-0 right-0 hidden lg:flex flex-col items-center gap-2"
            >
              <span className="font-body text-secondary/30 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-12 bg-gradient-to-b from-secondary/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}