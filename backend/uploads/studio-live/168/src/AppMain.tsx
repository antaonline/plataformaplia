import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PropertyList from './components/PropertyList';
import SearchAdvanced from './components/SearchAdvanced';
import Footer from './components/Footer';

export default function AppMain() {
  return (
    <div className="bg-bg text-text">
      <Navbar />
      <Hero />
      <PropertyList />
      <SearchAdvanced />
      <Footer />
    </div>
  );
}