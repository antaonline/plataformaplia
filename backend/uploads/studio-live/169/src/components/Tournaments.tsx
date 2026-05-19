import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type Tournament = {
  id: number;
  name: string;
  date: string;
  prize: string;
  image: string;
};

const tournaments: Tournament[] = [
  {
    id: 1,
    name: 'Campeonato Mundial de League of Legends',
    date: '15 Nov 2023',
    prize: '$500,000',
    image: 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 2,
    name: 'Torneo Internacional de Dota 2',
    date: '20 Nov 2023',
    prize: '$1,000,000',
    image: 'https://images.pexels.com/photos/5749298/pexels-photo-5749298.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 3,
    name: 'Campeonato Global de CS:GO',
    date: '25 Nov 2023',
    prize: '$750,000',
    image: 'https://images.pexels.com/photos/30696550/pexels-photo-30696550.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];

export default function Tournaments() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-heading text-text mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          Próximos Torneos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              className="bg-surface p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={tournament.image}
                alt={tournament.name}
                width="800"
                height="600"
                className="w-full h-48 object-cover rounded mb-4"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <h3 className="text-2xl font-heading text-text mb-2">{tournament.name}</h3>
              <p className="text-lg font-body text-secondary mb-1">Fecha: {tournament.date}</p>
              <p className="text-lg font-body text-accent">Premio: {tournament.prize}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}