import React from 'react';
import { motion } from 'framer-motion';

export const StylesList = () => {
  return (
    <motion.div className="bg-gray-900 text-white py-10" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 50 }}>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-8">Nuestros Estilos</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add each style as a component or card here */}
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Hip Hop</h3>
          <p>Aprende movimientos auténticos del Hip Hop que te conectarán con la cultura urbana.</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Breakdance</h3>
          <p>Domina los movimientos acrobáticos y el estilo libre del Breakdance.</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Street Jazz</h3>
          <p>Fusiona la técnica del jazz con la energía callejera en Street Jazz.</p>
        </div>
      </div>
    </motion.div>
  );
};