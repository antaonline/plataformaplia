import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const dishes = [
  {
    name: 'Sushi de Salmón',
    description: 'Delicado sushi de salmón fresco con un toque de wasabi y salsa de soja.',
    image: 'https://images.pexels.com/photos/31302045/pexels-photo-31302045.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Ramen de Miso',
    description: 'Sabroso ramen de miso con fideos artesanales, cerdo asado y huevo.',
    image: 'https://images.pexels.com/photos/33493350/pexels-photo-33493350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Tempura de Gambas',
    description: 'Crujiente tempura de gambas acompañada de salsa tentsuyu.',
    image: 'https://images.pexels.com/photos/32967533/pexels-photo-32967533.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    name: 'Tarta de Té Verde',
    description: 'Dulce y suave tarta de té verde con crema de matcha.',
    image: 'https://images.pexels.com/photos/31251558/pexels-photo-31251558.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export default function Menu() {
  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-heading font-black text-primary tracking-tight">
            Menú Destacado
          </h2>
          <p className="mt-4 text-lg text-text">
            Descubre nuestros platos destacados, cuidadosamente preparados para ofrecerte una experiencia culinaria inolvidable.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-48 object-cover"
                width="600"
                height="400"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="p-6">
                <h3 className="text-xl font-heading font-black text-primary">{dish.name}</h3>
                <p className="mt-2 text-text">{dish.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}