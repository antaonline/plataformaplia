import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../lib/utils';

const stats = [
  { value: '1960s', label: 'Origen en Japón', detail: 'Tokio, era dorada del vinilo' },
  { value: '+340%', label: 'Revalorización', detail: 'Piezas vintage en 10 años' },
  { value: '< 300', label: 'Unidades por edición', detail: 'Tirajes ultra-limitados' },
  { value: '100%', label: 'Vinilo japonés', detail: 'Material original auténtico' },
];

const pillars = [
  {
    title: 'Qué es el Sofubi',
    body:
      'Sofubi (ソフビ) es la abreviación japonesa de "soft vinyl" — vinilo blando. Cada figura es esculpida a mano, moldeada en vinilo de alta densidad y pintada con aerógrafo en ediciones absolutamente limitadas. No son juguetes masivos: son objetos de arte tridimensional con alma propia.',
  },
  {
    title: 'Historia del Vinilo Japonés',
    body:
      'Nacido en los talleres de Tokio de los años 60, el sofubi surgió como respuesta artesanal a los monstruos kaiju de la cultura pop japonesa. Estudios como Bullmark y Marusan establecieron los cánones estéticos que hoy siguen artistas independientes de todo el mundo, manteniendo vivos los procesos de producción originales.',
  },
  {
    title: 'Por Qué Coleccionar',
    body:
      'Una pieza sofubi auténtica es simultáneamente escultura, patrimonio cultural y activo coleccionable. Su valor crece con el tiempo: ediciones agotadas de artistas como Blobpus o Marmit alcanzan precios múltiples a su valor original en mercados secundarios de Tokio, Nueva York y Lima.',
  },
];

export default function CultureSection() {
  return (
    <section id="cultura" className="relative bg-bg py-32 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 60px, #D4A017 60px, #D4A017 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, #D4A017 60px, #D4A017 61px)',
          }}
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="block w-8 h-px bg-secondary" />
          <span className="font-body text-secondary text-xs tracking-[0.3em] uppercase">
            Cultura & Origen
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-text text-6xl lg:text-8xl tracking-wider uppercase leading-none mb-20"
        >
          El Arte del
          <br />
          <span className="text-primary">Vinilo Japonés</span>
        </motion.h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* LEFT — Editorial image stack */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img
                src="https://loremflickr.com/720/900/kaiju,vinyl,toy,japanese"
                alt="Figura sofubi kaiju de vinilo japonés auténtico"
                width={720}
                height={900}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(135deg, #12121A 0%, #1a0a10 50%, #0A0A0F 100%)';
                  }
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />

              {/* Floating badge */}
              <div className="absolute top-6 left-6 bg-white/5 backdrop-blur border border-secondary/30 rounded-xl px-4 py-3">
                <p className="font-heading text-secondary text-2xl tracking-wider">SOFUBI</p>
                <p className="font-body text-text/60 text-xs tracking-widest uppercase">ソフビ</p>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-body text-text/50 text-xs tracking-widest uppercase mb-1">
                  Vinilo blando · Hecho a mano en Japón
                </p>
                <div className="h-px bg-gradient-to-r from-secondary/50 to-transparent" />
              </div>
            </div>

            {/* Secondary image — offset */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute -bottom-10 -right-6 w-48 h-48 lg:w-64 lg:h-64 rounded-xl overflow-hidden border-2 border-surface shadow-2xl"
            >
              <img
                src="https://loremflickr.com/400/400/toy,figure,monster,collectible"
                alt="Detalle de figura sofubi coleccionable"
                width={400}
                height={400}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(135deg, #C41E3A20 0%, #12121A 100%)';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="font-body text-text/70 text-xs tracking-wider">Detalle artesanal</p>
              </div>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-16 grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  className="bg-surface/60 backdrop-blur border border-white/5 hover:border-secondary/30 rounded-xl p-5 transition-colors duration-300"
                >
                  <p className="font-heading text-secondary text-3xl tracking-wider leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="font-body text-text text-sm font-semibold mb-0.5">{stat.label}</p>
                  <p className="font-body text-text/40 text-xs">{stat.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Pillar content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:pt-8"
          >
            <div className="space-y-10">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  className="group relative"
                >
                  {/* Number */}
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center group-hover:border-primary/60 group-hover:bg-primary/10 transition-all duration-300">
                      <span className="font-heading text-primary text-xl tracking-wider">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-heading text-text text-3xl tracking-wider uppercase mb-4 group-hover:text-secondary transition-colors duration-300">
                        {pillar.title}
                      </h3>
                      <p className="font-body text-text/60 text-base leading-relaxed">
                        {pillar.body}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  {i < pillars.length - 1 && (
                    <div className="mt-10 ml-18 h-px bg-gradient-to-r from-white/5 via-white/10 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pull quote */}
            <motion.blockquote
              variants={fadeUp}
              className="mt-14 relative pl-6 border-l-2 border-primary"
            >
              <div className="absolute -top-2 -left-1 w-2 h-2 rounded-full bg-primary" />
              <p className="font-body text-text/80 text-lg italic leading-relaxed mb-4">
                "Cada pieza sofubi auténtica lleva décadas de tradición artesanal japonesa. 
                En Sofubi Miraflores traemos ese legado directamente a Lima, con certificación 
                de autenticidad y procedencia garantizada."
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-8 h-px bg-secondary" />
                <cite className="font-body text-secondary text-sm tracking-widest uppercase not-italic">
                  Sofubi Miraflores · Lima, Perú
                </cite>
              </footer>
            </motion.blockquote>

            {/* CTA inline */}
            <motion.div variants={fadeUp} className="mt-12">
              <button
                onClick={() => {
                  const el = document.getElementById('coleccion');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-3 font-body text-sm tracking-widest uppercase text-text/70 hover:text-text transition-colors duration-300"
              >
                <span className="w-10 h-px bg-text/30 group-hover:w-16 group-hover:bg-accent transition-all duration-300" />
                Explorar la colección completa
                <svg
                  className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}