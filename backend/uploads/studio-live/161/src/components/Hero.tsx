import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className={cn('bg-primary text-surface py-20')}>
      <motion.div
        className="container mx-auto px-6 flex flex-col lg:flex-row items-center lg:space-x-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="lg:w-1/2">
          <h1 className="text-5xl font-black font-serif mb-4 tracking-tight">
            Bienvenidos a Sofubi Exquisito
          </h1>
          <p className="text-lg font-sans mb-6">
            Descubre nuestra exclusiva colección de juguetes sofubi, donde el lujo y el arte asiático se encuentran. Únicos en Miraflores, Lima, Perú.
          </p>
          <a
            href="#productos"
            className={cn(
              'inline-flex items-center px-6 py-3 bg-secondary text-surface font-bold rounded-lg shadow-lg hover:bg-accent transition-colors'
            )}
          >
            Explorar Colección
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
        <motion.div
          className="lg:w-1/2 mt-10 lg:mt-0"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src="https://loremflickr.com/640/480/luxury,asian,toy"
            alt="Figura de Juguete Sofubi"
            width="640"
            height="480"
            className="rounded-lg shadow-lg"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}