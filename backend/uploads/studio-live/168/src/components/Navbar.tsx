import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      className="bg-bg px-8 py-4 shadow-md"
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-primary font-heading text-3xl tracking-tight">
            <span className="text-accent">PLIA</span> Realty
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <a href="#home" className="text-text font-body hover:text-primary transition-colors">
            Inicio
          </a>
          <a href="#properties" className="text-text font-body hover:text-primary transition-colors">
            Cacadadez
          </a>
          <a href="#search" className="text-text font-body hover:text-primary transition-colors">
            Búsqueda Avanzada
          </a>
          <a href="#contact" className="text-text font-body hover:text-primary transition-colors">
            Contacto
          </a>
          <button className="bg-accent text-bg font-body py-2 px-4 rounded hover:bg-accent/80 transition-colors">
            Contáctanos <ArrowRight className="inline-block ml-2" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}