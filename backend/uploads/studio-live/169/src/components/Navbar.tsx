import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface text-text py-4 shadow-md fixed w-full z-50"
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="text-lg font-heading text-accent">
          Esports Elite
        </div>
        <ul className="flex space-x-8 font-body text-sm">
          <li>
            <a
              href="#hero"
              className="hover:text-secondary transition-colors"
            >
              Inicio
            </a>
          </li>
          <li>
            <a
              href="#tournaments"
              className="hover:text-secondary transition-colors"
            >
              Torneos
            </a>
          </li>
          <li>
            <a
              href="#rankings"
              className="hover:text-secondary transition-colors"
            >
              Rankings
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="hover:text-secondary transition-colors flex items-center"
            >
              Contacto
              <ArrowRight className="ml-1 w-4 h-4" />
            </a>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}