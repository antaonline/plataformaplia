import React from 'react';
import { Hero } from './components/Hero';
import { DanceStyle } from './components/DanceStyle';

export const AppMain = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <DanceStyle name="Hip Hop" description="Explora los movimientos y la cultura del Hip Hop." />
        <DanceStyle name="Breakdance" description="La energía y el ritmo del Breakdance." />
        <DanceStyle name="Popping" description="El arte del popping con su estilo único." />
      </div>
    </div>
  );
};