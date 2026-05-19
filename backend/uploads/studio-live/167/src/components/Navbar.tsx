import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Navbar() {
  return (
    <motion.nav
      className={cn(
        'flex items-center justify-between px-8 py-4 bg-surface shadow-md fixed top-0 w-full z-50',
        'lg:px-16'
      )}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-4">
        <img
          src="https://images.pexels.com/photos/14983017/pexels-photo-14983017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="Restaurant Logo"
          width={50}
          height={50}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="text-primary font-heading text-2xl font-black tracking-tight">
          Restaurante Sakura
        </span>
      </div>
      <ul className="flex space-x-8 font-body text-text text-lg">
        <li>
          <a href="#home" className="hover:text-accent transition-colors">
            Inicio
          </a>
        </li>
        <li>
          <a href="#menu" className="hover:text-accent transition-colors">
            Menú
          </a>
        </li>
        <li>
          <a href="#reservations" className="hover:text-accent transition-colors">
            Reservas
          </a>
        </li>
        <li>
          <a href="#contact" className="hover:text-accent transition-colors">
            Contacto
          </a>
        </li>
      </ul>
    </motion.nav>
  );
}