import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../lib/utils';

const brands = [
  {
    name: 'Ferrari',
    country: 'Italia',
    founded: '1939',
    tagline: 'Pasión italiana sin compromiso',
    logo: 'https://images.pexels.com/photos/12801141/pexels-photo-12801141.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Lamborghini',
    country: 'Italia',
    founded: '1963',
    tagline: 'Potencia que desafía la razón',
    logo: 'https://images.pexels.com/photos/10496354/pexels-photo-10496354.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Porsche',
    country: 'Alemania',
    founded: '1931',
    tagline: 'Ingeniería al límite absoluto',
    logo: 'https://images.pexels.com/photos/16070470/pexels-photo-16070470.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'McLaren',
    country: 'Reino Unido',
    founded: '1963',
    tagline: 'Tecnología de Fórmula 1 en la calle',
    logo: 'https://images.pexels.com/photos/18234136/pexels-photo-18234136.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Bugatti',
    country: 'Francia',
    founded: '1909',
    tagline: 'La cima de la hiperperfección',
    logo: 'https://images.pexels.com/photos/16685580/pexels-photo-16685580.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Aston Martin',
    country: 'Reino Unido',
    founded: '1913',
    tagline: 'Elegancia británica en movimiento',
    logo: 'https://images.pexels.com/photos/31813761/pexels-photo-31813761.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export default function BrandsSection() {
  return (
    <section className="relative bg-bg py-32 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(196,30,58,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="font-body text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            Marcas Representadas
          </p>
          <h2 className="font-heading text-text uppercase text-6xl lg:text-8xl tracking-tight leading-none mb-6">
            Solo Lo{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #C41E3A 0%, #B8960C 100%)' }}>
              Mejor
            </span>
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-6" />
          <p className="font-body text-text/60 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Somos distribuidores autorizados de las marcas más exclusivas del mundo. Cada vehículo en
            nuestro catálogo pasa por un riguroso proceso de selección que garantiza autenticidad,
            procedencia y excelencia mecánica.
          </p>
        </motion.div>

        {/* Brands grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {brands.map((brand, index) => (
            <BrandCard key={brand.name} brand={brand} index={index} />
          ))}
        </motion.div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 pt-10 border-t border-white/[0.06]"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {[
              { label: 'Distribución Autorizada', value: '100%' },
              { label: 'Garantía de Origen', value: 'Certificada' },
              { label: 'Marcas de Élite', value: '6+' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="font-heading text-4xl lg:text-5xl uppercase tracking-tight text-transparent bg-clip-text mb-1"
                  style={{ backgroundImage: 'linear-gradient(90deg, #C41E3A 0%, #B8960C 100%)' }}
                >
                  {item.value}
                </div>
                <div className="font-body text-text/50 text-xs uppercase tracking-[0.2em]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
}

interface Brand {
  name: string;
  country: string;
  founded: string;
  tagline: string;
  logo: string;
}

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay: index * 0.07 },
        },
      }}
      className="group relative"
    >
      <div
        className="relative flex flex-col items-center justify-center p-6 rounded-xl border border-white/[0.06] bg-surface cursor-pointer overflow-hidden transition-all duration-300 ease-out"
        style={{
          boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 0 30px rgba(196,30,58,0.25), 0 0 60px rgba(196,30,58,0.08), 0 2px 20px rgba(0,0,0,0.5)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,30,58,0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Background glow on hover (CSS-only via pseudo approach) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(196,30,58,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Logo image */}
        <div className="relative w-full h-12 flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            width={120}
            height={48}
            className="object-contain w-auto h-10 filter brightness-75 group-hover:brightness-110 transition-all duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback text logo */}
          <div
            className="hidden items-center justify-center w-full h-10"
            aria-hidden="true"
          >
            <span
              className="font-heading text-2xl uppercase tracking-widest text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #C41E3A 0%, #B8960C 100%)' }}
            >
              {brand.name}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-primary/40 group-hover:bg-primary/80 group-hover:w-12 transition-all duration-300 mb-3" />

        {/* Brand name */}
        <h3 className="font-heading text-text uppercase text-xl tracking-wide text-center leading-none mb-1">
          {brand.name}
        </h3>

        {/* Country & year */}
        <p className="font-body text-text/40 text-xs text-center tracking-[0.15em] uppercase mb-3">
          {brand.country} · {brand.founded}
        </p>

        {/* Tagline — visible on hover */}
        <div className="overflow-hidden max-h-0 group-hover:max-h-10 transition-all duration-300 ease-out">
          <p className="font-body text-text/60 text-xs text-center leading-snug px-1">
            {brand.tagline}
          </p>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden rounded-tr-xl">
          <div
            className="absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(196,30,58,0.6) 50%)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}