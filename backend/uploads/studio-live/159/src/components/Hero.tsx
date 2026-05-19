import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className={cn('relative bg-bg text-text')}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn('container mx-auto px-4 py-20')}
      >
        <div className={cn('flex flex-col items-start justify-center text-left')}>
          <h1 className={cn('text-5xl md:text-7xl font-black leading-tight tracking-tight', 'font-playfair')}>
            Descubre la Elegancia del Sofubi de Lujo
          </h1>
          <p className={cn('mt-4 text-lg md:text-xl font-montserrat max-w-lg')}>
            En nuestra tienda de juguetes sofubi en Miraflores, Lima, ofrecemos modelos exclusivos de sofubi asiáticos 
            que combinan arte y lujo. Explora nuestra colección única y lleva a casa una pieza de elegancia inigualable.
          </p>
          <a
            href="#collection"
            className={cn('mt-8 inline-block px-6 py-3 bg-accent text-bg font-semibold rounded hover:bg-opacity-90')}
          >
            Explorar Colección
          </a>
        </div>
      </motion.div>
      <div className={cn('absolute inset-0 -z-10')}>
        <img
          src="https://images.unsplash.com/photo-1601758123927-6c4f6c6d7d8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fHNvZnViaXxlbnwwfHx8fDE2NzU0NTY4MzM&ixlib=rb-1.2.1&q=80&w=1080"
          alt="Sofubi de lujo"
          className={cn('object-cover w-full h-full opacity-20')}
        />
      </div>
    </section>
  );
}