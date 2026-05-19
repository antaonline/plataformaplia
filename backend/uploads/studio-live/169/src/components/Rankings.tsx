import React from 'react';
import { motion } from 'framer-motion';
import { cn, staggerContainer } from '../lib/utils';

type PlayerRanking = {
  position: number;
  name: string;
  team: string;
  points: number;
};

const playerRankings: PlayerRanking[] = [
  { position: 1, name: 'Juan Pérez', team: 'Dragones Negros', points: 1500 },
  { position: 2, name: 'María López', team: 'Fénix Dorado', points: 1450 },
  { position: 3, name: 'Carlos Fernández', team: 'Serpientes de Plata', points: 1400 },
  // More players...
];

export default function Rankings() {
  return (
    <section className="py-16 bg-bg">
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-4xl font-heading text-accent mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          Rankings de Jugadores
        </motion.h2>
        <motion.ul className="space-y-4">
          {playerRankings.map((player) => (
            <motion.li
              key={player.position}
              className="flex justify-between bg-surface p-4 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-text font-body">{player.position}.</span>
              <span className="text-text font-body">{player.name}</span>
              <span className="text-secondary font-body">{player.team}</span>
              <span className="text-accent font-body">{player.points} pts</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}