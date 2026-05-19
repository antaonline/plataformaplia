import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <motion.footer
      className={cn('bg-surface text-text py-16 px-8')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-black font-playfair mb-4">Contacto</h2>
          <p className="font-montserrat mb-2">
            Dirección: Calle de los Sofubi, Miraflores, Lima, Perú
          </p>
          <p className="font-montserrat mb-2">Teléfono: +51 123 456 789</p>
          <p className="font-montserrat">Email: info@sofubilujo.com</p>
        </div>
        <div>
          <h2 className="text-3xl font-black font-playfair mb-4">Síguenos</h2>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-secondary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-secondary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-secondary transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm font-montserrat">
        © 2023 Sofubi Lujo. Todos los derechos reservados.
      </div>
    </motion.footer>
  );
}