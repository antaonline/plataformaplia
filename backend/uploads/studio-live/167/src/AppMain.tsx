import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Reservations from './components/Reservations';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Menu />
        <Reservations />
      </main>
      <Footer />
    </div>
  );
}