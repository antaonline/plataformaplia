import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface Toy {
  id: number;
  name: string;
  description: string;
  image: string;
}

const toys: Toy[] = [
  {
    id: 1,
    name: 'Dragón Imperial',
    description: 'Un majestuoso dragón de sofubi que combina tradición y lujo.',
    image: 'https://loremflickr.com/400/400/dragon,sofubi',
  },
  {
    id: 2,
    name: 'Tigre Dorado',
    description: 'Figura de tigre con detalles dorados que simbolizan poder y elegancia.',
    image: 'https://loremflickr.com/400/400/tiger,sofubi',
  },
  {
    id: 3,
    name: 'León de Jade',
    description: 'Inspirado en leyendas asiáticas, este león es una pieza de colección única.',
    image: 'https://loremflickr.com/400/400/lion,sofubi',
  },
];

export default function Collection() {
  return (
    <section className={cn('bg-surface py-16')}>
      <div className={cn('max-w-5xl mx-auto px-4')}>
        <h2 className={cn('text-4xl font-black text-center mb-12', 'text-primary')}>Nuestra Colección Exclusiva</h2>
        <motion.div
          className={cn('grid grid-cols-1 md:grid-cols-3 gap-8')}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {toys.map((toy) => (
            <motion.div
              key={toy.id}
              className={cn('bg-white rounded-lg shadow-lg p-6')}
              whileHover={{ scale: 1.05 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img
                src={toy.image}
                alt={toy.name}
                width={400}
                height={400}
                className={cn('w-full h-64 object-cover mb-4 rounded-md')}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <h3 className={cn('text-2xl font-bold mb-2', 'text-accent')}>{toy.name}</h3>
              <p className={cn('text-base', 'text-text')}>{toy.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}