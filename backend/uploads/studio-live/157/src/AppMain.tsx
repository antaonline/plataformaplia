import React from 'react';
import { Hero } from './components/Hero';
import { StylesList } from './components/StylesList';
import { Footer } from './components/Footer';
import { motion } from 'framer-motion';

export const AppMain = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      <Hero />
      <StylesList />
      <Footer />
    </motion.div>
  );
};