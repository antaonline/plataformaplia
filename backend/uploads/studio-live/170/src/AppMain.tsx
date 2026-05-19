import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import Citas from './components/Citas';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className="bg-bg text-text">
      <Navbar />
      <Hero />
      <Servicios />
      <Citas />
      <Footer />
    </div>
  );
}