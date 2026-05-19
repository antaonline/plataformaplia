import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Culture from './components/Culture';
import Lookbook from './components/Lookbook';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import PromoBanner from './components/PromoBanner';
import PromoHero from './components/PromoHero';

export default function AppMain() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const sectionIds = ['hero', 'collection', 'culture', 'lookbook', 'newsletter'];

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <div className="relative bg-bg text-text font-body antialiased overflow-x-hidden">
      <PromoBanner />
      <Navbar />

      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="collection">
          <Collection />
        </section>

        <PromoHero />

        <section id="culture">
          <Culture />
        </section>

        <section id="lookbook">
          <Lookbook />
        </section>

        <section id="newsletter">
          <Newsletter />
        </section>
      </main>

      <Footer />
    </div>
  );
}