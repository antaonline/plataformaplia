import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <motion.footer
      className={cn(
        'bg-surface text-text py-12',
        'flex flex-col items-center space-y-6'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="text-center">
        <h2 className="text-xl font-playfair font-black">Sofubi Luxe</h2>
        <p className="text-base font-roboto">Juguetes de lujo con esencia asiática</p>
      </div>
      <div className="flex space-x-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <Facebook className="text-primary w-6 h-6 hover:text-secondary" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Instagram className="text-primary w-6 h-6 hover:text-secondary" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <Twitter className="text-primary w-6 h-6 hover:text-secondary" />
        </a>
      </div>
      <div className="text-center text-sm font-roboto">
        <p>Ubicación: Miraflores, Lima, Perú</p>
        <p>Email: info@sofubiluxe.com</p>
        <p>Teléfono: +51 123 456 789</p>
      </div>
    </motion.footer>
  );
}