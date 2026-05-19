import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductSection from './components/ProductSection';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className="bg-bg text-text font-sans">
      <Navbar />
      <main>
        <Hero />
        <ProductSection />
      </main>
      <Footer />
    </div>
  );
}