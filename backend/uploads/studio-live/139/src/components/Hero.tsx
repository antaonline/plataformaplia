import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 to-purple-600">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <h1 className="text-6xl font-display text-gold">Bienvenidos a Urban Elegance</h1>
        <p className="text-2xl text-white mt-4">Donde la danza cobra vida en Miraflores</p>
      </motion.div>
    </section>
  );
};

export default Hero;