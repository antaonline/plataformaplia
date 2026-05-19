import React from 'react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-urban-dance bg-cover bg-center h-96 flex items-center justify-center"
    >
      <h1 className="text-5xl font-bold text-center">Bienvenidos a Urban Dance Studio</h1>
    </motion.div>
  );
};