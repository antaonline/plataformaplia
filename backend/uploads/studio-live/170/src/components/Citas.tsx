import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Citas = () => {
  return (
    <section className="py-16 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6"
      >
        <h2 className="text-4xl font-heading font-black text-primary mb-8 tracking-tight">
          Agenda tu Cita Online
        </h2>
        <p className="text-lg font-body text-text mb-12">
          Completa el formulario a continuación para programar una consulta con nuestros expertos veterinarios.
        </p>
        <form className="bg-bg p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-body text-text mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full p-3 border rounded-md shadow-sm focus:border-primary focus:outline-none focus:ring focus:ring-primary/20"
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-body text-text mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-3 border rounded-md shadow-sm focus:border-primary focus:outline-none focus:ring focus:ring-primary/20"
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-body text-text mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full p-3 border rounded-md shadow-sm focus:border-primary focus:outline-none focus:ring focus:ring-primary/20"
              placeholder="Ingresa tu número de teléfono"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-body text-text mb-2">
              Fecha de Cita
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="w-full p-3 border rounded-md shadow-sm focus:border-primary focus:outline-none focus:ring focus:ring-primary/20"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-surface p-3 rounded-md font-body font-bold hover:bg-accent/90 transition-colors"
          >
            Agendar Cita
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default Citas;