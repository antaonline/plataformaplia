import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Reservations() {
  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl font-heading text-primary mb-4">Reserva tu mesa</h2>
          <p className="text-lg font-body text-text mb-8">
            Disfruta de una experiencia culinaria única en nuestro restaurante.
          </p>
        </motion.div>
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto bg-bg p-8 rounded-lg shadow-lg"
        >
          <div className="mb-6">
            <label htmlFor="name" className="block text-text font-body mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-4 text-text bg-surface border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-text font-body mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-4 text-text bg-surface border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="date" className="block text-text font-body mb-2">
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              id="date"
              className="w-full p-4 text-text bg-surface border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="guests" className="block text-text font-body mb-2">
              Número de Personas
            </label>
            <input
              type="number"
              id="guests"
              className="w-full p-4 text-text bg-surface border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="20"
              placeholder="Número de personas"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 font-body text-surface bg-accent rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Reservar Ahora
          </button>
        </motion.form>
      </div>
    </section>
  );
}