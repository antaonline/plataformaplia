import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const SearchAdvanced = () => {
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([100000, 1000000]);
  const [size, setSize] = useState([50, 500]);

  const handleSearch = () => {
    // Lógica de búsqueda aquí
  };

  return (
    <section className="bg-surface py-16">
      <motion.div
        className="container mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-primary font-heading text-4xl font-black mb-8">Búsqueda Avanzada</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <label htmlFor="location" className="text-text font-body mb-2">Ubicación</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-secondary rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Ej. Ciudad de México"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="priceRange" className="text-text font-body mb-2">Rango de Precios</label>
            <input
              type="range"
              id="priceRange"
              min="100000"
              max="1000000"
              step="10000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="w-full mb-2"
            />
            <input
              type="range"
              id="priceRange"
              min="100000"
              max="1000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="w-full"
            />
            <div className="text-text mt-2">
              {`$${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`}
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="size" className="text-text font-body mb-2">Tamaño (m²)</label>
            <input
              type="range"
              id="size"
              min="50"
              max="500"
              step="10"
              value={size[0]}
              onChange={(e) => setSize([+e.target.value, size[1]])}
              className="w-full mb-2"
            />
            <input
              type="range"
              id="size"
              min="50"
              max="500"
              step="10"
              value={size[1]}
              onChange={(e) => setSize([size[0], +e.target.value])}
              className="w-full"
            />
            <div className="text-text mt-2">
              {`${size[0]} - ${size[1]} m²`}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={handleSearch}
            className="bg-accent text-bg font-body font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition"
          >
            Buscar
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default SearchAdvanced;