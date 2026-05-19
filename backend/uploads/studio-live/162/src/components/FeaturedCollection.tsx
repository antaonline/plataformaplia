import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { products } from '../data/products';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface ProductCardProps {
  product: (typeof products)[0];
  index: number;
  featured?: boolean;
}

function ProductCard({ product, index, featured = false }: ProductCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <motion.article
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-white/5 backdrop-blur-md border border-white/10',
        'hover:border-primary/50 hover:shadow-[0_0_40px_rgba(196,30,58,0.25)]',
        'transition-all duration-500 cursor-pointer',
        featured ? 'row-span-2' : ''
      )}
    >
      {/* Image Container */}
      <div
        className={cn(
          'relative overflow-hidden',
          featured ? 'aspect-[3/4]' : 'aspect-square'
        )}
      >
        {imgError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-primary/10 to-bg flex items-center justify-center">
            <span className="font-heading text-4xl text-primary/40 tracking-widest">
              SOFUBI
            </span>
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={`Figura sofubi ${product.name} por ${product.artist}`}
            width={featured ? 600 : 400}
            height={featured ? 800 : 400}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Carmesí glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.limitedEdition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-bg text-xs font-bold font-body tracking-wider uppercase">
              <Zap size={10} className="fill-bg" />
              Edición Limitada
            </span>
          )}
          {!product.available && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-text/60 text-xs font-body tracking-wider uppercase border border-white/20">
              Agotado
            </span>
          )}
          {product.available && product.limitedEdition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-xs font-bold font-body tracking-wider uppercase">
              Disponible
            </span>
          )}
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-xs font-bold font-body tracking-widest uppercase">
              <Star size={10} className="fill-white" />
              Destacado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col flex-1 p-4', featured ? 'p-6' : 'p-4')}>
        {/* Artist */}
        <p className="font-body text-xs tracking-[0.2em] uppercase text-secondary mb-1.5 font-semibold">
          {product.artist}
        </p>

        {/* Name */}
        <h3
          className={cn(
            'font-heading uppercase tracking-wide text-text leading-none mb-2',
            featured ? 'text-3xl' : 'text-xl'
          )}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'font-body text-text/60 leading-relaxed mb-4 flex-1',
            featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'
          )}
        >
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
          <div className="flex flex-col">
            <span className="font-body text-xs text-text/40 uppercase tracking-wider">
              Precio
            </span>
            <span
              className={cn(
                'font-heading text-secondary leading-none',
                featured ? 'text-3xl' : 'text-2xl'
              )}
            >
              S/ {product.price.toLocaleString('es-PE')}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            disabled={!product.available}
            aria-label={`Consultar ${product.name}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all duration-300',
              product.available
                ? 'bg-primary text-white hover:bg-accent hover:shadow-[0_0_20px_rgba(255,58,92,0.5)]'
                : 'bg-white/5 text-text/30 cursor-not-allowed border border-white/10'
            )}
          >
            {product.available ? (
              <>
                Consultar
                <ArrowRight size={14} />
              </>
            ) : (
              'No disponible'
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedCollection() {
  const featured = products[0];
  const rest = products.slice(1, 6);

  return (
    <section
      id="coleccion"
      aria-labelledby="collection-heading"
      className="relative py-28 bg-bg overflow-hidden"
    >
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(240,237,232,0.5) 40px, rgba(240,237,232,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(240,237,232,0.5) 40px, rgba(240,237,232,0.5) 41px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-body text-sm tracking-[0.3em] uppercase text-secondary font-semibold mb-3"
            >
              Colección Actual
            </motion.p>
            <h2
              id="collection-heading"
              className="font-heading text-6xl md:text-7xl lg:text-8xl uppercase tracking-wide text-text leading-none"
            >
              Piezas
              <br />
              <span className="text-primary">Exclusivas</span>
            </h2>
          </div>

          <div className="max-w-sm">
            <p className="font-body text-text/60 leading-relaxed text-sm mb-4">
              Cada figura es seleccionada directamente de estudios japoneses y artistas
              independientes. Autenticidad certificada, ediciones numeradas, entregadas
              en Miraflores.
            </p>
            <motion.a
              href="#contacto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 font-body font-semibold text-sm text-accent hover:text-white transition-colors duration-300 group"
            >
              Ver catálogo completo
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.a>
          </div>
        </motion.div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Featured large card — spans 2 rows on lg */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-2">
            <ProductCard product={featured} index={0} featured />
          </div>

          {/* Top row — 2 cards */}
          {rest.slice(0, 2).map((product, i) => (
            <div key={product.id} className="md:col-span-1 lg:col-span-1">
              <ProductCard product={product} index={i + 1} />
            </div>
          ))}

          {/* Bottom row — 3 cards spanning full width minus featured */}
          {rest.slice(2, 5).map((product, i) => (
            <div key={product.id} className="md:col-span-1 lg:col-span-1">
              <ProductCard product={product} index={i + 3} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-white/10 hidden sm:block" />
          <motion.a
            href="#contacto"
            whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(196,30,58,0.45)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-body font-bold text-base tracking-wide transition-all duration-300 hover:bg-accent"
          >
            Consultar disponibilidad
            <ArrowRight size={18} />
          </motion.a>
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-white/10 hidden sm:block" />
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { value: '100%', label: 'Autenticidad garantizada' },
            { value: '+200', label: 'Piezas importadas' },
            { value: 'Lima', label: 'Entrega en Miraflores' },
            { value: '48h', label: 'Respuesta de consulta' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="font-heading text-2xl text-secondary tracking-wide">
                {item.value}
              </span>
              <span className="font-body text-xs text-text/40 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}