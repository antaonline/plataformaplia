import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

export const Hero = () => {
  return (
    <section id="inicio" className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-[#d4ff00]/10 blur-[120px] rounded-full" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8"
          >
            <Star className="w-4 h-4 text-[#d4ff00] fill-[#d4ff00]" />
            <span className="text-xs font-semibold text-white uppercase tracking-widest">La mejor clínica dental de Lince</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl"
          >
            Redefiniendo el arte de <br/>
            <span className="text-[#d4ff00] italic underline decoration-white/20">sonreír en Lima.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10"
          >
            Tecnología de última generación y especialistas certificados en Mariano Melgar 1175, Lince. Cuidamos tu salud bucal con precisión quirúrgica.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="bg-[#d4ff00] text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,255,0,0.4)] transition-all">
              Agendar Evaluación Gratuita <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
              Ver Casos de Éxito
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};