import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <motion.footer
      className={cn(
        'bg-surface text-text py-12',
        'border-t border-gray-200 mt-16'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Tienda Sofubi de Lujo</h2>
            <p className="text-sm mt-2">Miraflores, Lima, Perú</p>
            <p className="text-sm">info@sofubilujoperu.com</p>
            <p className="text-sm">+51 123 456 789</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-primary hover:text-secondary"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-primary hover:text-secondary"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className="text-primary hover:text-secondary"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}