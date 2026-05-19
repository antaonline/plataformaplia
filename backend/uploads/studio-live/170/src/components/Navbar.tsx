import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Navbar() {
  return (
    <motion.nav
      className={cn('bg-surface shadow-md py-4')}
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-primary font-heading text-2xl tracking-tight">
          Clínica Veterinaria
        </a>
        <ul className="flex space-x-8 font-body text-text">
          <li>
            <a href="#inicio" className="hover:text-primary transition-colors duration-300">
              Inicio
            </a>
          </li>
          <li>
            <a href="#servicios" className="hover:text-primary transition-colors duration-300">
              Servicios
            </a>
          </li>
          <li>
            <a href="#citas" className="hover:text-primary transition-colors duration-300">
              Citas
            </a>
          </li>
          <li>
            <a href="#contacto" className="hover:text-primary transition-colors duration-300">
              Contacto
            </a>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}