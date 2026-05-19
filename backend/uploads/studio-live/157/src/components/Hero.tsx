import React from 'react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <motion.section className="bg-black text-white min-h-screen flex flex-col justify-center items-center" initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 50 }}>
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Bienvenido a Urban Dance Studio</h1>
      <p className="text-lg md:text-2xl">Descubre el arte y la pasión de la danza urbana en el corazón de Miraflores.</p>
    </motion.section>
  );
};