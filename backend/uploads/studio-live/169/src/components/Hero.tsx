import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-text">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <h1 className={cn('font-heading text-6xl tracking-wide text-accent mb-4')}>
          Bienvenidos a la Comunidad Esports Elite
        </h1>
        <p className="font-body text-lg max-w-2xl mb-8">
          Conéctate con los mejores jugadores, participa en torneos emocionantes y asciende en los rankings para demostrar tu valía en el mundo de los esports.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-accent text-bg font-body font-semibold py-3 px-6 rounded-full shadow-lg"
        >
          Únete Ahora
        </motion.button>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg opacity-60 pointer-events-none"></div>
    </section>
  );
}