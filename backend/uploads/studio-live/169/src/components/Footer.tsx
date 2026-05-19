import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Footer() {
  return (
    <footer className="bg-surface text-text py-12">
      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-3xl font-heading">Únete a Nuestra Comunidad</h2>
          <p className="text-center text-body max-w-lg">
            Conéctate con nosotros y mantente al día con las últimas noticias, eventos y competiciones de esports.
          </p>
          <div className="flex space-x-6">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className={cn(
                'text-secondary hover:text-accent transition-colors'
              )}
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className={cn(
                'text-secondary hover:text-accent transition-colors'
              )}
            >
              <Twitter size={24} />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className={cn(
                'text-secondary hover:text-accent transition-colors'
              )}
            >
              <Instagram size={24} />
            </a>
            <a
              href="mailto:info@esportscommunity.com"
              aria-label="Email"
              className={cn(
                'text-secondary hover:text-accent transition-colors'
              )}
            >
              <Mail size={24} />
            </a>
          </div>
          <p className="text-sm text-surface/70">
            &copy; 2023 Esports Community. Todos los derechos reservados.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}