import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { staggerContainer, fadeUp } from '../lib/utils';
import { cars } from '../data/cars';
import CarCard from './CarCard';

type Category = 'Todos' | 'Supercar' | 'GT' | 'Roadster';

const CATEGORIES: Category[] = ['Todos', 'Supercar', 'GT', 'Roadster'];

const sortOptions = [
  { label: 'Precio: Menor a Mayor', value: 'price-asc' },
  { label: 'Precio: Mayor a Menor', value: 'price-desc' },
  { label: 'Potencia', value: 'power' },
  { label: 'Más Rápido', value: 'speed' },
];

export default function CarCatalog() {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [sortBy, setSortBy] = useState('price-asc');
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = cars
    .filter((car) => activeCategory === 'Todos' || car.categoria === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.precio - b.precio;
      if (sortBy === 'price-desc') return b.precio - a.precio;
      if (sortBy === 'power') return b.potencia - a.potencia;
      if (sortBy === 'speed') return b.velocidad - a.velocidad;
      return 0;
    });

  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? '';

  return (
    <section id="catalogo" className="bg-bg py-28 relative overflow-hidden">
      {/* Background depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,30,58,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-[2px] bg-primary" />
            <span className="font-body text-primary text-sm tracking-[0.2em] uppercase font-semibold">
              Colección Exclusiva
            </span>
          </div>
          <h2 className="font-heading text-text uppercase tracking-tight text-6xl md:text-8xl leading-none mb-4">
            Catálogo
            <span className="block text-primary">2024 — 2025</span>
          </h2>
          <p className="font-body text-text/60 text-lg max-w-xl leading-relaxed">
            Cada vehículo de nuestra colección ha sido seleccionado por su rendimiento excepcional,
            diseño icónico y exclusividad garantizada.
          </p>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={16} className="text-primary mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'font-body text-sm font-semibold tracking-widest uppercase px-5 py-2 rounded-sm border transition-all duration-300',
                  activeCategory === cat
                    ? 'bg-primary border-primary text-text shadow-[0_0_20px_rgba(196,30,58,0.4)]'
                    : 'bg-transparent border-text/10 text-text/50 hover:border-primary/50 hover:text-text/80',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 font-body text-sm text-text/60 hover:text-text border border-text/10 hover:border-primary/40 px-4 py-2 rounded-sm transition-all duration-300 bg-surface"
            >
              <span>{activeSortLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-surface border border-text/10 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={[
                        'w-full text-left px-4 py-3 font-body text-sm transition-colors duration-200',
                        sortBy === opt.value
                          ? 'text-primary bg-primary/10'
                          : 'text-text/60 hover:text-text hover:bg-text/5',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-body text-text/30 text-xs tracking-widest uppercase mb-8"
        >
          {filtered.length} {filtered.length === 1 ? 'vehículo' : 'vehículos'} disponibles
        </motion.p>

        {/* Cars Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + sortBy}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            {filtered.map((car, index) => (
              <motion.div
                key={car.id}
                variants={fadeUp}
                custom={index}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-24"
          >
            <p className="font-heading text-text/20 text-4xl uppercase tracking-widest">
              Sin resultados
            </p>
            <p className="font-body text-text/30 text-sm mt-3">
              Prueba con otra categoría o contacta a nuestro equipo.
            </p>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-text/5 pt-12"
        >
          <div>
            <p className="font-heading text-text text-2xl uppercase tracking-wide">
              ¿No encuentras lo que buscas?
            </p>
            <p className="font-body text-text/40 text-sm mt-1">
              Accedemos a vehículos exclusivos fuera de catálogo bajo pedido.
            </p>
          </div>
          <a
            href="#contacto"
            className="group inline-flex items-center gap-3 bg-primary hover:bg-accent text-text font-body font-semibold text-sm tracking-widest uppercase px-8 py-4 rounded-sm transition-all duration-300 shadow-[0_0_30px_rgba(196,30,58,0.3)] hover:shadow-[0_0_40px_rgba(255,45,78,0.5)] whitespace-nowrap"
          >
            Consulta Personalizada
            <span className="w-5 h-[1px] bg-text/60 group-hover:w-8 transition-all duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}