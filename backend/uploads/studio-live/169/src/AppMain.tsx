import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tournaments from './components/Tournaments';
import Rankings from './components/Rankings';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className="bg-bg text-text">
      <Navbar />
      <main>
        <Hero />
        <Tournaments />
        <Rankings />
      </main>
      <Footer />
    </div>
  );
}