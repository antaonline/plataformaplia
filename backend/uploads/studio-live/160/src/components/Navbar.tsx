import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Navbar() {
  return (
    <motion.nav
      className={cn(
        'bg-white',
        'shadow-md',
        'fixed',
        'w-full',
        'z-50',
        'flex',
        'justify-between',
        'items-center',
        'p-4'
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-xl font-black text-primary font-playfair">
        Sofubi Luxe
      </div>
      <ul className="flex space-x-6 text-lg font-roboto text-text">
        <li>
          <a
            href="#coleccion"
            className="hover:text-primary transition-colors ease-in-out duration-300"
          >
            Colección
          </a>
        </li>
        <li>
          <a
            href="#contacto"
            className="hover:text-primary transition-colors ease-in-out duration-300"
          >
            Contacto
          </a>
        </li>
      </ul>
    </motion.nav>
  );
}