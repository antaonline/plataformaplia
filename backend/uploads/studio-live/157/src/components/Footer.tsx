import React from 'react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.footer className="bg-black text-white py-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <p>© 2023 Urban Dance Studio Miraflores. Todos los derechos reservados.</p>
    </motion.footer>
  );
};