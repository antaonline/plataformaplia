import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../lib/utils';
import { brandsData } from '../data/brands';

export default function BrandsSection() {
  const duplicated = [...brandsData, ...brandsData];

  return (
    <section className="py-28 bg-bg overflow-hidden relative">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 50%, rgba(192,38,211,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-body text-primary text-xs tracking-[0.25em] uppercase mb-4 flex items-center gap-3"
          >
            <span className="inline-block w-8 h-px bg-primary" />
            Casas Exclusivas
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="font-heading font-extrabold text-text text-5xl lg:text-6xl leading-none tracking-[-0.03em] max-w-xl"
          >
            Marcas que{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)',
              }}
            >
              definen
            </span>{' '}
            el arte
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-body text-text/50 text-base mt-5 max-w-lg leading-relaxed"
          >
            Representamos directamente a los estudios más influyentes del underground japonés y
            asiático. Cada pieza llega autenticada y numerada.
          </motion.p>
        </motion.div>

        {/* Infinite scroll strip */}
        <div className="relative">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #0A0A0F 0%, transparent 100%)',
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, #0A0A0F 0%, transparent 100%)',
            }}
          />

          <div className="overflow-hidden">
            <motion.div
              className="flex gap-5"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 30,
                ease: 'linear',
                repeat: Infinity,
              }}
              style={{ width: 'max-content' }}
            >
              {duplicated.map((brand, idx) => (
                <BrandCard key={`${brand.nombre}-${idx}`} brand={brand} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Grid detallado */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16"
        >
          {brandsData.slice(0, 6).map((brand) => (
            <BrandDetailCard key={brand.nombre} brand={brand} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Tarjeta compacta para el carrusel ── */
interface Brand {
  nombre: string;
  pais: string;
  descripcion: string;
  imagen: string;
  fundacion: string;
  insignia: string;
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl border"
      style={{
        background: 'rgba(19,19,28,0.9)',
        borderColor: 'rgba(192,38,211,0.18)',
        minWidth: '220px',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border"
        style={{ borderColor: 'rgba(192,38,211,0.25)' }}
      >
        <img
          src={brand.imagen}
          alt={brand.nombre}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = 'none';
            if (t.parentElement) {
              t.parentElement.style.background =
                'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)';
            }
          }}
        />
      </div>
      <div>
        <p className="font-heading font-bold text-text text-sm leading-tight">{brand.nombre}</p>
        <p className="font-body text-text/40 text-xs mt-0.5">{brand.pais}</p>
      </div>
    </div>
  );
}

/* ── Tarjeta detallada para el grid ── */
function BrandDetailCard({ brand }: { brand: Brand }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group relative rounded-2xl overflow-hidden border cursor-pointer"
      style={{
        background: 'rgba(19,19,28,0.95)',
        borderColor: 'rgba(192,38,211,0.15)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 40px rgba(192,38,211,0.08)',
          background: 'radial-gradient(ellipse at top, rgba(192,38,211,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Image banner */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={brand.imagen}
          alt={`${brand.nombre} - ${brand.pais}`}
          width={480}
          height={144}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = 'none';
            if (t.parentElement) {
              t.parentElement.style.background =
                'linear-gradient(135deg, rgba(192,38,211,0.3) 0%, rgba(124,58,237,0.3) 100%)';
            }
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 30%, rgba(19,19,28,0.95) 100%)',
          }}
        />

        {/* Insignia badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-body font-semibold tracking-widest uppercase"
          style={{
            background: 'rgba(192,38,211,0.2)',
            border: '1px solid rgba(240,171,252,0.3)',
            color: '#F0ABFC',
          }}
        >
          {brand.insignia}
        </div>

        {/* Fundacion */}
        <div className="absolute bottom-3 left-4">
          <p className="font-body text-text/40 text-[10px] tracking-widest uppercase">
            Est. {brand.fundacion}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-text text-lg leading-tight tracking-[-0.02em]">
            {brand.nombre}
          </h3>
          <span className="font-body text-primary text-xs mt-1 flex-shrink-0">{brand.pais}</span>
        </div>
        <p className="font-body text-text/50 text-sm leading-relaxed">{brand.descripcion}</p>

        {/* CTA link */}
        <div className="mt-4 flex items-center gap-2 text-accent text-xs font-body font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Ver colección</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M7 3l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, transparent, #C026D3 50%, transparent)',
        }}
      />
    </motion.div>
  );
}