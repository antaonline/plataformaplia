import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const products = [
  {
    id: 1,
    name: 'Dragón Imperial Sofubi',
    description: 'Este dragón sofubi de edición limitada captura la esencia de la elegancia asiática. Hecho a mano con detalles intrincados, es una pieza imprescindible para coleccionistas.',
    image: 'https://loremflickr.com/400/400/dragon,figure',
    price: '$1,200',
  },
  {
    id: 2,
    name: 'Guerrero Samurai Sofubi',
    description: 'Un guerrero samurai sofubi que combina tradición y modernidad. Perfecto para quienes aprecian la cultura japonesa y la artesanía sofisticada.',
    image: 'https://loremflickr.com/400/400/samurai,figure',
    price: '$950',
  },
  {
    id: 3,
    name: 'Kitsune Mágico Sofubi',
    description: 'El zorro mágico, Kitsune, en forma de sofubi, es un símbolo de misterio y poder. Con acabados brillantes, es un regalo ideal para los amantes de lo exótico.',
    image: 'https://loremflickr.com/400/400/kitsune,figure',
    price: '$1,100',
  },
];

export default function ProductSection() {
  return (
    <section className="bg-surface py-12">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-primary font-serif text-4xl font-black mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Juguetes Sofubi Destacados
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.backgroundColor = '#F46036';
                }}
              />
              <div className="p-6">
                <h3 className="text-accent font-serif text-2xl font-bold mb-2">
                  {product.name}
                </h3>
                <p className="text-text mb-4">{product.description}</p>
                <span className="text-primary font-semibold">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}