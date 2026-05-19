import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-white',
        'shadow-md',
        'fixed',
        'w-full',
        'z-50',
        'py-4',
        'px-8',
        'flex',
        'justify-between',
        'items-center'
      )}
    >
      <div className={cn('text-primary', 'text-3xl', 'font-serif', 'tracking-tight')}>
        Sofubi Luxe
      </div>
      <ul className={cn('flex', 'space-x-6', 'text-lg', 'font-sans', 'text-text')}>
        <li>
          <a href="#home" className="hover:text-primary transition-colors duration-300">
            Inicio
          </a>
        </li>
        <li>
          <a href="#products" className="hover:text-primary transition-colors duration-300">
            Productos
          </a>
        </li>
        <li>
          <a href="#about" className="hover:text-primary transition-colors duration-300">
            Sobre Nosotros
          </a>
        </li>
        <li>
          <a href="#contact" className="hover:text-primary transition-colors duration-300">
            Contacto
          </a>
        </li>
      </ul>
    </motion.nav>
  );
};

export default Navbar;