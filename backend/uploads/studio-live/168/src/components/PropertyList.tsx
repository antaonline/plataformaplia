import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type Property = {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
};

const properties: Property[] = [
  {
    id: 1,
    title: 'Residencia de Lujo en el Centro',
    location: 'Ciudad de México, México',
    price: '$3,500,000 USD',
    image: 'https://images.pexels.com/photos/4031013/pexels-photo-4031013.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 2,
    title: 'Villa Exclusiva con Vista al Mar',
    location: 'Cancún, México',
    price: '$5,200,000 USD',
    image: 'https://images.pexels.com/photos/20210501/pexels-photo-20210501.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 3,
    title: 'Penthouse Moderno en Zona Prime',
    location: 'Monterrey, México',
    price: '$2,800,000 USD',
    image: 'https://images.pexels.com/photos/18983477/pexels-photo-18983477.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export default function PropertyList() {
  return (
    <section className="py-16 bg-bg">
      <div className="container mx-auto px-8">
        <motion.h2
          className="text-4xl font-heading font-black text-primary mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          Propiedades Destacadas
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-surface shadow-lg rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-56 object-cover"
                width={400}
                height={300}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="p-6">
                <h3 className="text-2xl font-heading font-black text-primary mb-2">
                  {property.title}
                </h3>
                <p className="text-text text-sm mb-4">{property.location}</p>
                <p className="text-accent text-lg font-bold">{property.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}