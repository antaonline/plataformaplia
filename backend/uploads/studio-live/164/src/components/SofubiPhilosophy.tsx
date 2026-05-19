import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, staggerContainer, slideInLeft, slideInRight } from '../lib/utils';

const stats = [
  { value: '500+', label: 'Piezas Exclusivas', description: 'En catálogo activo' },
  { value: '48', label: 'Artistas Maestros', description: 'De Japón y Asia' },
  { value: '12', label: 'Países de Origen', description: 'Colecciones globales' },
  { value: '1960', label: 'Año de Origen', description: 'Del arte sofubi' },
];

const principles = [
  {
    title: 'Vinilo Suave, Arte Duro',
    body: 'El sofubi —contracción de "soft vinyl" en japonés— nació en los talleres de Tokio como medio de expresión artística de posguerra. Cada figura es esculpida a mano, vaciada en vinilo suave y pintada con técnicas de capas que pueden llevar semanas.',
  },
  {
    title: 'Ediciones de Autor',
    body: 'Los maestros como Medicom Toy, Mori Katsura y los estudios de Nakano producen tiradas de 50 a 300 unidades numeradas. Adquirir una pieza es entrar en un círculo de coleccionistas que trasciende la geografía.',
  },
  {
    title: 'Inversión con Alma',
    body: 'El mercado secundario de sofubi premium ha crecido un 340% en la última década. Pero quienes coleccionan de verdad no compran para revender: compran porque cada figura cuenta una historia que ningún algoritmo puede replicar.',
  },
];

export default function SofubiPhilosophy() {
  return (
    <section className="bg-bg py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section Label */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex items-center gap-4 mb-20"
        >
          <motion.div variants={fadeUp} className="h-px w-16 bg-primary" />
          <motion.span
            variants={fadeUp}
            className="font-body text-primary text-xs tracking-[0.35em] uppercase"
          >
            La Filosofía
          </motion.span>
        </motion.div>

        {/* Main Layout: 2 columns asymmetric */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* LEFT: Text Column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.h2
              variants={slideInLeft}
              className="font-heading font-black italic text-5xl lg:text-7xl text-text leading-[0.92] tracking-tight mb-8"
            >
              Arte que{' '}
              <span className="text-primary">respira</span>
              <br />
              en vinilo
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-body text-text/60 text-lg leading-relaxed mb-12 max-w-lg"
            >
              El sofubi es la intersección perfecta entre la artesanía milenaria japonesa y la
              cultura pop de vanguardia. No son juguetes: son esculturas de edición limitada que
              habitan en la frontera entre el arte y el deseo.
            </motion.p>

            {/* Principles */}
            <div className="space-y-8">
              {principles.map((p, i) => (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  custom={i}
                  className="group border-l-2 border-primary/30 pl-6 hover:border-primary transition-colors duration-300"
                >
                  <h3 className="font-heading font-bold text-xl text-text mb-2 group-hover:text-primary transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="font-body text-text/55 text-sm leading-relaxed">{p.body}</p>
                </motion.div>
              ))}
            </div>

            {/* Decorative quote */}
            <motion.blockquote
              variants={fadeUp}
              className="mt-14 relative pl-8"
            >
              <span className="absolute left-0 top-0 font-heading text-6xl text-primary/40 leading-none select-none">"</span>
              <p className="font-heading italic text-2xl text-text/70 leading-snug">
                Cada pieza sofubi es un universo comprimido en 30 centímetros de vinilo suave.
              </p>
              <footer className="mt-3 font-body text-primary text-xs tracking-widest uppercase">
                — Keita Mizuno, Maestro Escultor, Tokio
              </footer>
            </motion.blockquote>
          </motion.div>

          {/* RIGHT: Image + Stats Column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col gap-8"
          >
            {/* Main Image */}
            <motion.div
              variants={slideInRight}
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: '4/5' }}
            >
              <img
                src="https://loremflickr.com/720/900/sofubi,vinyl,toy,japanese,craft"
                alt="Artesano japonés creando figura sofubi en taller de Tokio"
                width={720}
                height={900}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(135deg, #141414 0%, #1a1008 50%, #0A0A0A 100%)';
                  }
                }}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute top-6 right-6 bg-secondary/90 backdrop-blur-sm border border-secondary/50 rounded-full px-4 py-2"
              >
                <span className="font-body text-text text-xs tracking-widest uppercase font-semibold">
                  Arte Original
                </span>
              </motion.div>

              {/* Bottom image caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-body text-text/80 text-sm">
                  Taller artesanal, Nakano — Tokio, Japón
                </p>
                <p className="font-body text-text/40 text-xs mt-1">
                  Proceso de vaciado en vinilo suave, técnica tradicional
                </p>
              </div>
            </motion.div>

            {/* Secondary small image */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-xl overflow-hidden h-48"
            >
              <img
                src="https://loremflickr.com/720/300/kaiju,vinyl,figure,collection,japan"
                alt="Colección de figuras sofubi kaiju de edición limitada"
                width={720}
                height={300}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(90deg, #141414 0%, #1a0a0a 100%)';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-bg/40" />
              <div className="absolute inset-0 flex items-center px-8">
                <p className="font-heading italic text-xl text-text/90 max-w-xs">
                  Donde el kaiju se convierte en obra de arte
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-24 pt-16 border-t border-primary/20"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="group text-center lg:text-left"
              >
                <div className="font-heading font-black text-5xl lg:text-6xl text-primary leading-none mb-2 group-hover:text-accent transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="font-body font-semibold text-text text-sm tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className="font-body text-text/40 text-xs tracking-wide">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 flex items-center justify-center gap-6"
        >
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-primary/40" />
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <div className="w-3 h-3 rounded-full border border-primary/40" />
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-primary/40" />
        </motion.div>

      </div>
    </section>
  );
}