import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className={cn("bg-surface text-text py-20", "px-4 sm:px-8 lg:px-16", "flex flex-col items-center")}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className={cn("text-4xl sm:text-6xl font-black", "font-playfair-display tracking-tight mb-4")}>
          Bienvenidos a Sofubi Luxe
        </h1>
        <p className={cn("text-lg sm:text-xl font-roboto", "max-w-2xl mx-auto mb-8")}>
          Descubre nuestra exclusiva colección de juguetes sofubi de lujo, donde el arte y la cultura asiática se unen en cada pieza.
        </p>
        <button
          className={cn("bg-primary text-white px-6 py-3 flex items-center", "rounded-full shadow-lg hover:bg-secondary", "transition-colors duration-300")}
        >
          Explorar Colección
          <ArrowRight className="ml-2" />
        </button>
      </motion.div>
      <motion.img
        src="https://loremflickr.com/1280/720/luxury,toy,figure"
        alt="Juguetes Sofubi de Lujo"
        width="1280"
        height="720"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
        className={cn("mt-12 rounded-lg shadow-xl")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      />
    </section>
  );
}