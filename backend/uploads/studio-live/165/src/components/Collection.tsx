import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { products } from '../data/products';

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Collection() {
  return (
    <section id="collection" className="bg-bg py-24 md:py-32">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-accent font-body text-xs tracking-[0.25em] uppercase font-semibold mb-3 block">
              Temporada 2025
            </span>
            <h2 className="font-heading text-secondary text-6xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tight">
              Colección<br />
              <span className="text-accent">Destacada</span>
            </h2>
          </div>
          <p className="font-body text-secondary/50 text-sm md:text-base max-w-xs leading-relaxed">
            Piezas diseñadas para quienes no piden permiso. Cada drop es una declaración de identidad.
          </p>
        </motion.div>

        {/* Filter tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {['Todo', 'Hoodies', 'Tees', 'Pantalones', 'Accesorios'].map((tag, i) => (
            <button
              key={tag}
              className={cn(
                'font-body text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-300',
                i === 0
                  ? 'bg-accent border-accent text-bg font-semibold'
                  : 'border-secondary/20 text-secondary/50 hover:border-accent hover:text-accent bg-transparent'
              )}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-secondary/5"
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mt-16"
        >
          <button className="group font-body font-semibold text-sm tracking-widest uppercase text-secondary border border-secondary/30 px-10 py-4 hover:border-accent hover:text-accent transition-all duration-300 flex items-center gap-3">
            Ver colección completa
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  category: string;
  tag?: string;
  image: string;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface group relative cursor-pointer overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-primary">
        <img
          src={product.image}
          alt={product.name}
          width={600}
          height={800}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Orange overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-accent/80 flex items-center justify-center transition-opacity duration-400',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="text-center transform transition-transform duration-400"
            style={{ transform: hovered ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <button className="font-body font-bold text-xs tracking-[0.2em] uppercase text-bg bg-secondary px-8 py-3 hover:bg-bg hover:text-secondary transition-colors duration-200">
              Añadir al carrito
            </button>
            <p className="font-body text-bg/80 text-xs mt-3 tracking-wider">
              Ver detalles →
            </p>
          </div>
        </div>

        {/* Tag badge */}
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className="font-body text-[10px] font-bold tracking-widest uppercase bg-accent text-bg px-3 py-1">
              {product.tag}
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-5 border-t border-secondary/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-accent/80 font-semibold block mb-1">
              {product.category}
            </span>
            <h3 className="font-heading text-secondary text-xl uppercase tracking-wide leading-tight truncate">
              {product.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="font-body font-bold text-secondary text-base">
              {typeof product.price === 'number' ? `€${product.price}` : product.price}
            </span>
          </div>
        </div>

        {/* Size indicators */}
        <div className="flex gap-2 mt-3">
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <span
              key={size}
              className="font-body text-[9px] tracking-wider text-secondary/30 hover:text-accent cursor-pointer transition-colors duration-200"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}