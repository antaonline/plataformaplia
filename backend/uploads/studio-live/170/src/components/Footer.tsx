import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <footer className="bg-surface text-text py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-heading font-black tracking-tighter mb-2">
              Clínica Veterinaria Amigable
            </h2>
            <p className="font-body text-sm">
              Dirección: Calle de los Patitas Felices, 123, Ciudad Mascota
            </p>
            <p className="font-body text-sm">Teléfono: +1 234 567 890</p>
            <p className="font-body text-sm">Email: contacto@clinicaveterinaria.com</p>
          </div>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-primary hover:text-secondary transition duration-300"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-primary hover:text-secondary transition duration-300"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className="text-primary hover:text-secondary transition duration-300"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="font-body text-xs text-surface/70">
            © {new Date().getFullYear()} Clínica Veterinaria Amigable. Todos los derechos reservados.
          </p>
          <a
            href="#"
            className="font-body text-xs text-primary hover:text-secondary transition duration-300"
          >
            Términos y Condiciones
          </a>
          <span className="mx-2">|</span>
          <a
            href="#"
            className="font-body text-xs text-primary hover:text-secondary transition duration-300"
          >
            Política de Privacidad
          </a>
        </div>
      </motion.div>
    </footer>
  );
}