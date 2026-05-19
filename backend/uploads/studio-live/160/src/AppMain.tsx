import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <link 
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Roboto:wght@400;700&display=swap" 
        rel="stylesheet"
      />
      <style>
        {`
          .font-playfair-display { font-family: 'Playfair Display', serif; }
          .font-roboto { font-family: 'Roboto', sans-serif; }
        `}
      </style>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Collection />
      </main>
      <Footer />
    </div>
  );
}