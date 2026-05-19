import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollection from './components/FeaturedCollection';
import SofubiPhilosophy from './components/SofubiPhilosophy';
import MembershipForm from './components/MembershipForm';
import Footer from './components/Footer';

type Page = 'home' | 'coleccion' | 'nosotros' | 'filosofia';

export default function AppMain() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    const validPages: Page[] = ['home', 'coleccion', 'nosotros', 'filosofia'];
    if (validPages.includes(page as Page)) {
      setCurrentPage(page as Page);
    }

    // Smooth scroll to section anchors when navigating
    const sectionMap: Record<string, string> = {
      coleccion: 'coleccion',
      filosofia: 'filosofia',
      nosotros: 'membresia',
      home: 'hero',
    };

    const targetId = sectionMap[page];
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text font-body overflow-x-hidden">
      {/* Skip to main content for accessibility */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-bg focus:font-heading focus:font-bold focus:rounded-sm"
      >
        Saltar al contenido principal
      </a>

      {/* Navigation */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="hero">
          <Hero onNavigate={handleNavigate} />
        </section>

        {/* Featured Collection */}
        <section id="coleccion">
          <FeaturedCollection />
        </section>

        {/* Sofubi Philosophy */}
        <section id="filosofia">
          <SofubiPhilosophy />
        </section>

        {/* Membership Form */}
        <section id="membresia">
          <MembershipForm />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global decorative ambient elements */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left ambient glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />
        {/* Bottom-right ambient glow */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/4 rounded-full blur-[120px]" />
        {/* Center ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/1 rounded-full blur-[200px]" />
      </div>
    </div>
  );
}