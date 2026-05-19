import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Zap } from 'lucide-react';
import { fadeUp, staggerContainer } from '../lib/utils';

interface Product {
  id: number;
  nombre: string;
  artista: string;
  origen: string;
  precio: number;
  edicionLimitada: boolean;
  imagen: string;
  categoria: string;
  unidades?: number;
}

const featured: Product[] = [
  {
    id: 1,
    nombre: 'Oni Phantom Ver. Black',
    artista: 'Mori Katsura',
    origen: 'Japón',
    precio: 1890,
    edicionLimitada: true,
    imagen: 'https://loremflickr.com/600/720/vinyl,toy,figure,japan',
    categoria: 'Oni Series',
    unidades: 30,
  },
  {
    id: 2,
    nombre: 'Ghost Rabbit Neon',
    artista: 'Secret Base',
    origen: 'Japón',
    precio: 2450,
    edicionLimitada: true,
    imagen: 'https://loremflickr.com/600/800/sofubi,collectible,art,toy',
    categoria: 'Kaiju',
    unidades: 15,
  },
  {
    id: 3,
    nombre: 'Yokai Drifter Crimson',
    artista: 'Restore',
    origen: 'Japón',
    precio: 3200,
    edicionLimitada: true,
    imagen: 'https://loremflickr.com/600/680/japanese,monster,figure,vinyl',
    categoria: 'Yokai Collection',
    unidades: 8,
  },
  {
    id: 4,
    nombre: 'Micro Kaiju 001',
    artista: 'Medicom Toy',
    origen: 'Japón',
    precio: 980,
    edicionLimitada: false,
    imagen: 'https://loremflickr.com/600/600/kaiju,toy,designer,figure',
    categoria: 'Micro Series',
  },
  {
    id: 5,
    nombre: 'Tengu Spirit Gold',
    artista: 'Bounty Hunter',
    origen: 'Japón',
    precio: 4100,
    edicionLimitada: true,
    imagen: 'https://loremflickr.com/600/750/tengu,japan,art,collectible',
    categoria: 'Spirit Series',
    unidades: 5,
  },
  {
    id: 6,
    nombre: 'Neo Kappa Ultraviolet',
    artista: 'Gargamel',
    origen: 'Japón',
    precio: 2750,
    edicionLimitada: true,
    imagen: 'https://loremflickr.com/600/700/vinyl,art,designer,toy,neon',
    categoria: 'Neo Folklore',
    unidades: 12,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function formatPrice(precio: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
  }).format(precio);
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isLarge = index === 0 || index === 4;
  const isTall = index === 1;

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`group relative bg-surface rounded-2xl overflow-hidden border border-primary/15 flex flex-col
        ${isLarge ? 'md:col-span-2' : ''}
        ${isTall ? 'md:row-span-2' : ''}
      `}
      style={{
        boxShadow: '0 4px 32px rgba(192,38,211,0.04)',
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 8px 48px rgba(192,38,211,0.22), 0 0 0 1px rgba(192,38,211,0.25)',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
    >
      {/* Imagen */}
      <div
        className={`relative overflow-hidden bg-bg/60 ${
          isLarge ? 'aspect-[16/9]' : isTall ? 'aspect-[3/4]' : 'aspect-[4/5]'
        }`}
      >
        <img
          src={product.imagen}
          alt={`${product.nombre} por ${product.artista}`}
          width={600}
          height={isLarge ? 338 : isTall ? 800 : 750}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background =
                'linear-gradient(135deg, #13131C 0%, #1e0a2e 50%, #0A0A0F 100%)';
            }
          }}
        />

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Glow neón en hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 60px rgba(192,38,211,0.12)',
          }}
        />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.edicionLimitada && (
            <span className="flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
              <Zap size={9} className="fill-white" />
              Ed. Limitada
            </span>
          )}
          <span className="bg-bg/70 backdrop-blur-sm text-accent/80 text-[10px] font-body tracking-wider uppercase px-2.5 py-1 rounded-full border border-accent/20">
            {product.categoria}
          </span>
        </div>

        {/* Unidades si aplica */}
        {product.unidades && product.unidades <= 15 && (
          <div className="absolute top-3 right-3">
            <span className="bg-surface/80 backdrop-blur-sm text-accent text-[10px] font-body font-semibold px-2.5 py-1 rounded-full border border-primary/30">
              Solo {product.unidades} uds.
            </span>
          </div>
        )}

        {/* Origen */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-surface/90 backdrop-blur-sm text-text/60 text-[10px] font-body px-2 py-0.5 rounded-md">
            {product.origen}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-text/40 text-[11px] font-body tracking-widest uppercase mb-1">
              {product.artista}
            </p>
            <h3 className="font-heading font-extrabold text-text text-base md:text-lg leading-tight tracking-tight truncate">
              {product.nombre}
            </h3>
          </div>
          <Star
            size={14}
            className="text-primary/50 flex-shrink-0 mt-1 group-hover:text-primary transition-colors duration-300"
          />
        </div>

        {/* Divisor */}
        <div className="h-px bg-primary/10 group-hover:bg-primary/25 transition-colors duration-300" />

        {/* Precio + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-text/30 text-[10px] font-body uppercase tracking-widest mb-0.5">
              Precio
            </p>
            <p className="font-heading font-extrabold text-accent text-xl leading-none tracking-tight">
              {formatPrice(product.precio)}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-accent text-xs font-heading font-bold tracking-wide uppercase px-3.5 py-2 rounded-xl transition-all duration-200"
            aria-label={`Ver detalles de ${product.nombre}`}
          >
            Ver pieza
            <ArrowRight size={12} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedCollection() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-bg relative overflow-hidden">
      {/* Fondo decorativo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.04] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #C026D3 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="text-primary text-xs font-body font-semibold tracking-[0.25em] uppercase mb-4"
            >
              — Colección Destacada
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-heading font-extrabold text-text text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.03em]"
            >
              Piezas que{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #C026D3 0%, #F0ABFC 60%, #7C3AED 100%)',
                }}
              >
                Definen
              </span>
              <br />
              una Colección
            </motion.h2>
          </div>

          <motion.div variants={fadeUp} className="flex flex-col items-start md:items-end gap-3">
            <p className="text-text/50 font-body text-sm max-w-xs md:text-right leading-relaxed">
              Cada pieza es seleccionada directamente desde Japón. Arte vinilo en su máxima expresión, disponible en Lima.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-accent font-heading font-bold text-sm tracking-wide uppercase border-b border-accent/40 hover:border-accent pb-0.5 transition-colors duration-200"
            >
              Ver catálogo completo
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Grid asimétrico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Footer de sección */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-primary/10"
        >
          <p className="text-text/30 font-body text-sm text-center sm:text-left">
            Nuevas piezas cada semana · Envíos a todo Lima y provincias
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-heading font-extrabold text-accent text-2xl leading-none">+200</p>
              <p className="text-text/30 text-[11px] font-body uppercase tracking-widest mt-1">Piezas</p>
            </div>
            <div className="h-8 w-px bg-primary/15" aria-hidden="true" />
            <div className="text-center">
              <p className="font-heading font-extrabold text-accent text-2xl leading-none">40+</p>
              <p className="text-text/30 text-[11px] font-body uppercase tracking-widest mt-1">Artistas</p>
            </div>
            <div className="h-8 w-px bg-primary/15" aria-hidden="true" />
            <div className="text-center">
              <p className="font-heading font-extrabold text-accent text-2xl leading-none">100%</p>
              <p className="text-text/30 text-[11px] font-body uppercase tracking-widest mt-1">Auténtico</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}