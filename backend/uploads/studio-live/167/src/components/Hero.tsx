import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative bg-bg overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="https://images.pexels.com/photos/15849845/pexels-photo-15849845.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
          alt="Interior del restaurante japonés"
          width="1920"
          height="1080"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="relative z-10 flex flex-col items-center justify-center h-screen p-8 text-center bg-gradient-to-b from-bg/60 to-bg/90">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary font-black tracking-tight"
        >
          Bienvenido a KAISEKI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mt-4 max-w-2xl text-lg sm:text-xl lg:text-2xl text-text font-body"
        >
          Experimente la auténtica gastronomía japonesa en un ambiente de serenidad y elegancia.
        </motion.p>
      </div>
    </section>
  );
}