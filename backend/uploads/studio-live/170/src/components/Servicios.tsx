import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const services = [
  {
    title: 'Consulta General',
    description: 'Atención completa para evaluar la salud de tu mascota.',
    image: 'https://images.pexels.com/photos/6235124/pexels-photo-6235124.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    title: 'Vacunación',
    description: 'Vacunas esenciales para proteger a tu mascota de enfermedades.',
    image: 'https://images.pexels.com/photos/6816857/pexels-photo-6816857.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    title: 'Cirugías',
    description: 'Procedimientos quirúrgicos con equipo especializado.',
    image: 'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    title: 'Cuidado Dental',
    description: 'Limpieza dental para prevenir problemas bucales.',
    image: 'https://images.pexels.com/photos/6816865/pexels-photo-6816865.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export default function Servicios() {
  return (
    <section className="py-16 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6"
      >
        <h2 className="text-4xl font-heading font-black text-primary mb-12">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <img
                src={service.image}
                alt={service.title}
                width="400"
                height="300"
                className="w-full h-auto rounded-md mb-4"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <h3 className="text-2xl font-heading font-semibold text-text mb-2">
                {service.title}
              </h3>
              <p className="text-text font-body">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}