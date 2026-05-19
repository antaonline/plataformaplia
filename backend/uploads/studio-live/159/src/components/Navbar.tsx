import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex justify-between items-center px-8 py-4',
        'bg-surface text-text shadow-lg'
      )}
    >
      <div className="text-xl font-black tracking-tight font-playfair">
        Sofubi Lux
      </div>
      <ul className="flex space-x-8">
        <li>
          <a
            href="#hero"
            className="hover:text-accent transition-colors duration-300"
          >
            Inicio
          </a>
        </li>
        <li>
          <a
            href="#collection"
            className="hover:text-accent transition-colors duration-300"
          >
            Colección
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="hover:text-accent transition-colors duration-300"
          >
            Contacto
          </a>
        </li>
      </ul>
      <button
        className={cn(
          'flex items-center space-x-2 bg-accent px-4 py-2 rounded-full',
          'text-surface hover:bg-opacity-90 transition-all duration-300'
        )}
      >
        <span>Compra Ahora</span>
        <ArrowRight size={16} />
      </button>
    </motion.nav>
  );
}