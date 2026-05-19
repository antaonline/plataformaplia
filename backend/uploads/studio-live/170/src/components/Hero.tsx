import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className="bg-primary text-surface py-20">
      <div className="container mx-auto flex flex-col items-center md:flex-row md:justify-between">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading font-black text-5xl md:text-6xl tracking-tight mb-6">
            Bienvenido a Nuestra Clínica Veterinaria
          </h1>
          <p className="font-body text-lg md:text-xl mb-8">
            Cuidamos a tus mascotas con amor y profesionalismo. Agenda tus citas online de manera rápida y sencilla.
          </p>
          <a
            href="#citas"
            className={cn(
              'bg-accent text-surface font-body text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-accent/90 transition'
            )}
          >
            Reserva tu Cita
          </a>
        </motion.div>
        <motion.div
          className="mt-10 md:mt-0 md:w-1/2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.pexels.com/photos/6235225/pexels-photo-6235225.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
            alt="Veterinario amigable con mascota"
            width="800"
            height="600"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            className="rounded-lg shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  );
}