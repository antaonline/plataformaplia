import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '../lib/utils';

const stats = [
  { value: '47K', label: 'Comunidad activa' },
  { value: '12', label: 'Colecciones lanzadas' },
  { value: '98%', label: 'Satisfacción total' },
  { value: '6', label: 'Años en la calle' },
];

export default function Culture() {
  return (
    <section className="bg-bg py-28 md:py-36 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="block w-8 h-px bg-accent" />
          <span className="font-body text-accent text-xs tracking-[0.25em] uppercase font-semibold">
            Nuestra Cultura
          </span>
        </motion.div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT: Editorial text block */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="flex flex-col"
          >
            {/* Headline */}
            <motion.h2
              variants={staggerItem}
              className="font-heading text-secondary uppercase leading-none tracking-tight mb-8"
              style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', lineHeight: 0.92 }}
            >
              No SEGUIMOS
              <br />
              <span className="text-accent">TENDENCIAS.</span>
              <br />
              LAS CREAMOS.
            </motion.h2>

            {/* Manifesto copy */}
            <motion.p
              variants={staggerItem}
              className="font-body text-secondary/60 text-base md:text-lg leading-relaxed max-w-md mb-6"
            >
              URBN DISTRICT nació en las calles, no en una sala de juntas. Cada pieza que diseñamos
              lleva el peso de una subcultura que se niega a ser diluida por el mainstream.
            </motion.p>
            <motion.p
              variants={staggerItem}
              className="font-body text-secondary/60 text-base md:text-lg leading-relaxed max-w-md mb-12"
            >
              Aquí no hay tendencias de temporada ni colecciones descartables. Hay actitud,
              artesanía y una comunidad que entiende que la ropa es lenguaje.
            </motion.p>

            {/* Manifesto quote */}
            <motion.blockquote
              variants={staggerItem}
              className="border-l-2 border-accent pl-6 mb-14"
            >
              <p className="font-heading text-secondary text-2xl md:text-3xl uppercase tracking-wide leading-tight">
                "Viste lo que eres,<br />no lo que te dicen ser."
              </p>
              <cite className="font-body text-accent text-xs tracking-[0.2em] uppercase mt-3 block not-italic">
                — Fundadores, URBN District 2018
              </cite>
            </motion.blockquote>

            {/* Stats row */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="font-heading text-accent text-4xl md:text-5xl leading-none tracking-tight">
                    {stat.value}
                  </span>
                  <span className="font-body text-secondary/50 text-xs tracking-[0.15em] uppercase leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Image composition */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img
                src="https://images.pexels.com/photos/3958289/pexels-photo-3958289.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
                alt="Cultura URBN District — modelo editorial en entorno urbano"
                width={900}
                height={1200}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) parent.style.background = '#141414';
                }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />

              {/* Floating tag — bottom left */}
              <div className="absolute bottom-6 left-6 bg-surface/80 backdrop-blur-sm border border-secondary/10 px-4 py-3">
                <p className="font-body text-secondary/50 text-xs tracking-widest uppercase mb-1">Temporada</p>
                <p className="font-heading text-secondary text-xl uppercase tracking-wide">AW 2025</p>
              </div>
            </div>

            {/* Floating accent card — top right, offset */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -top-8 -right-4 md:-right-8 bg-accent px-5 py-4 w-40"
            >
              <p className="font-heading text-bg text-4xl leading-none">100%</p>
              <p className="font-body text-bg/80 text-xs tracking-[0.15em] uppercase mt-1 leading-tight">
                Diseño<br />Original
              </p>
            </motion.div>

            {/* Decorative vertical text */}
            <div
              className="absolute -left-10 top-1/2 -translate-y-1/2 hidden xl:block"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              <span className="font-heading text-secondary/10 text-6xl uppercase tracking-[0.3em] select-none">
                CULTURA
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom horizontal rule with label */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 flex items-center gap-6 origin-left"
        >
          <div className="flex-1 h-px bg-secondary/10" />
          <span className="font-body text-secondary/20 text-xs tracking-[0.3em] uppercase whitespace-nowrap">
            Est. Madrid 2018
          </span>
          <div className="w-16 h-px bg-accent/40" />
        </motion.div>

      </div>
    </section>
  );
}