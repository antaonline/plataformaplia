import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <footer className="bg-surface text-text py-12">
      <motion.div
        className="container mx-auto flex flex-col md:flex-row justify-between items-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 md:mb-0">
          <h2 className="font-heading text-xl font-black tracking-tight text-primary">Contacto</h2>
          <p className="font-body mt-2">Teléfono: +81 123-456-7890</p>
          <p className="font-body">Email: info@restaurantejapones.com</p>
          <p className="font-body">Dirección: 123 Calle Sakura, Tokio, Japón</p>
        </div>
        <div className="flex space-x-6 mb-6 md:mb-0">
          <a href="https://www.facebook.com" aria-label="Facebook" className="text-primary hover:text-accent transition">
            <Facebook />
          </a>
          <a href="https://www.instagram.com" aria-label="Instagram" className="text-primary hover:text-accent transition">
            <Instagram />
          </a>
          <a href="https://www.twitter.com" aria-label="Twitter" className="text-primary hover:text-accent transition">
            <Twitter />
          </a>
        </div>
        <div>
          <p className="font-body text-sm text-secondary">© {new Date().getFullYear()} Restaurante Japonés. Todos los derechos reservados.</p>
        </div>
      </motion.div>
    </footer>
  );
}