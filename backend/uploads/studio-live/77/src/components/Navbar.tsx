import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#d4ff00] rounded-lg flex items-center justify-center">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <span className="text-white font-bold text-xl tracking-tighter">ODONTO <span className="text-[#d4ff00]">PERÚ</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#inicio" className="hover:text-[#d4ff00] transition-colors">Inicio</a>
          <a href="#servicios" className="hover:text-[#d4ff00] transition-colors">Servicios</a>
          <a href="#ubicacion" className="hover:text-[#d4ff00] transition-colors">Ubicación</a>
        </div>
        <button className="bg-[#d4ff00] text-black px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
          RESERVAR CITA
        </button>
      </div>
    </motion.nav>
  );
};