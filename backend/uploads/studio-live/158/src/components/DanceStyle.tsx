import React from 'react';
import { motion } from 'framer-motion';

interface DanceStyleProps {
  name: string;
  description: string;
}

export const DanceStyle: React.FC<DanceStyleProps> = ({ name, description }) => {
  return (
    <motion.div
      className="my-8 p-4 bg-white text-gray-900 rounded shadow-lg"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold">{name}</h2>
      <p className="mt-2 text-lg">{description}</p>
    </motion.div>
  );
};