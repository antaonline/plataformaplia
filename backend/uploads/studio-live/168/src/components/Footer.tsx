import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <footer className="bg-secondary text-surface py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-heading">PLIA Real Estate</h2>
            <p className="text-body mt-2">
              Somos expertos en la venta de propiedades de lujo. Contáctanos para encontrar tu hogar perfecto.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="https://facebook.com" aria-label="Facebook" className="text-surface hover:text-accent">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" className="text-surface hover:text-accent">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="text-surface hover:text-accent">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center text-sm"
        >
          <p>&copy; 2023 PLIA Real Estate. Todos los derechos reservados.</p>
          <p>
            <a href="#privacy" className="text-surface hover:text-accent">
              Política de Privacidad
            </a>{' '}
            |{' '}
            <a href="#terms" className="text-surface hover:text-accent">
              Términos de Uso
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}