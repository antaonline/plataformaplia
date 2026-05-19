import React from 'react';
import { cn } from './lib/utils';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className={cn('bg-bg text-text font-montserrat')}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      <Navbar />
      <main>
        <Hero />
        <Collection />
      </main>
      <Footer />
    </div>
  );
}