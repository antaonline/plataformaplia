import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const sofubiCollection = [
  {
    id: 1,
    name: 'Dragón Dorado',
    description: 'Un dragón sofubi de edición limitada, pintado a mano con detalles dorados.',
    price: 'S/ 1,250',
    imageUrl: 'https://images.unsplash.com/photo-1585238342027-779824d29309',
  },
  {
    id: 2,
    name: 'Serpiente Mística',
    description: 'Figura sofubi que captura la esencia de la mitología asiática.',
    price: 'S/ 980',
    imageUrl: 'https://images.unsplash.com/photo-1612810801087-0a6b6c96d0c8',
  },
  {
    id: 3,
    name: 'Guerrero Estelar',
    description: 'Sofubi del guerrero del espacio, con armadura iridiscente.',
    price: 'S/ 1,450',
    imageUrl: 'https://images.unsplash.com/photo-1565370718143-e41c94e106fa',
  },
];

export default function Collection() {
  return (
    <section
      className={cn(
        'bg-bg py-16',
        'text-text px-4 sm:px-8 lg:px-16',
        'flex flex-col items-center'
      )}
    >
      <motion.h2
        className={cn('text-4xl font-black tracking-tight', 'mb-10', 'font-playfair')}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Colección Exclusiva Sofubi
      </motion.h2>
      <motion.div
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-screen-lg"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {
            opacity: 0,
            y: 20,
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {sofubiCollection.map((item) => (
          <motion.div
            key={item.id}
            className={cn(
              'bg-surface p-6 rounded-lg shadow-lg',
              'flex flex-col items-center text-center'
            )}
            whileHover={{ scale: 1.05 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className={cn('text-2xl font-semibold', 'mb-2', 'font-playfair')}>
              {item.name}
            </h3>
            <p className={cn('text-base mb-4', 'font-montserrat')}>{item.description}</p>
            <span className={cn('text-xl font-bold text-accent', 'font-montserrat')}>
              {item.price}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}