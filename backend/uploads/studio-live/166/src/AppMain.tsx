import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CarCatalog from './components/CarCatalog';
import BrandsSection from './components/BrandsSection';
import StatsSection from './components/StatsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function AppMain() {
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sectionIds = ['inicio', 'catalogo', 'marcas', 'nosotros', 'contacto'];
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
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const handleVerDetalle = (id: string) => {
    setSelectedCarId(id);
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseDetalle = () => {
    setSelectedCarId(null);
  };

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative min-h-screen bg-bg text-text font-body overflow-x-hidden"
        >
          {/* Global subtle noise texture overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px 128px',
            }}
          />

          {/* Navbar */}
          <Navbar />

          {/* Main content */}
          <main className="relative z-10">
            {/* Hero Section */}
            <section id="inicio">
              <Hero />
            </section>

            {/* Stats Section — "nosotros" anchor */}
            <section id="nosotros">
              <StatsSection />
            </section>

            {/* Car Catalog */}
            <CarCatalog onVerDetalle={handleVerDetalle} />

            {/* Brands Section */}
            <section id="marcas">
              <BrandsSection />
            </section>

            {/* Contact Section */}
            <section id="contacto">
              <ContactSection />
            </section>
          </main>

          {/* Footer */}
          <Footer />

          {/* Car Detail Modal */}
          <AnimatePresence>
            {selectedCarId && (
              <CarDetailModal
                carId={selectedCarId}
                onClose={handleCloseDetalle}
              />
            )}
          </AnimatePresence>

          {/* Scroll to top button */}
          <ScrollToTopButton />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Scroll To Top ─── */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="Volver al inicio"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary hover:bg-accent border border-primary/40 shadow-[0_4px_24px_rgba(196,30,58,0.5)] flex items-center justify-center text-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 15V5M10 5L5 10M10 5L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── Car Detail Modal ─── */
interface CarDetailModalProps {
  carId: string;
  onClose: () => void;
}

function CarDetailModal({ carId, onClose }: CarDetailModalProps) {
  import('./data/cars');

  const [car, setCar] = React.useState<import('./data/cars').Car | null>(null);

  React.useEffect(() => {
    import('./data/cars').then(({ cars }) => {
      const found = cars.find((c) => c.id === carId) ?? null;
      setCar(found);
    });
  }, [carId]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  if (!car) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);

  const categoriaGradient: Record<string, string> = {
    Supercar: 'from-primary/20 to-transparent',
    GT: 'from-secondary/20 to-transparent',
    Roadster: 'from-accent/20 to-transparent',
  };

  const gradient = categoriaGradient[car.categoria] ?? 'from-primary/20 to-transparent';

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/90 backdrop-blur-2xl" />

      {/* Modal card */}
      <motion.div
        key="modal-card"
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-4xl bg-surface rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-bg/60 backdrop-blur border border-white/10 flex items-center justify-center text-text/60 hover:text-text hover:bg-primary/20 transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
          <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
            <img
              src={car.imagen}
              alt={`${car.marca} ${car.modelo} ${car.año}`}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                t.style.display = 'none';
                if (t.parentElement) {
                  t.parentElement.style.background = '#111111';
                }
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/60 hidden md:block" />

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-body font-semibold tracking-widest uppercase bg-primary/90 text-text">
                {car.categoria}
              </span>
            </div>
          </div>

          {/* Content side */}
          <div className="p-8 md:p-10 flex flex-col justify-between gap-6">
            <div>
              <p className="font-body text-sm font-semibold tracking-[0.2em] uppercase text-secondary mb-2">
                {car.marca} · {car.año}
              </p>
              <h2 className="font-heading text-5xl md:text-6xl uppercase tracking-tight text-text leading-none mb-4">
                {car.modelo}
              </h2>
              <p className="font-body text-text/70 text-sm leading-relaxed">
                {car.descripcion}
              </p>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Potencia', value: `${car.potencia}`, unit: 'CV' },
                { label: '0–100', value: `${car.aceleracion}s`, unit: '' },
                { label: 'Vel. Máx', value: `${car.velocidad}`, unit: 'km/h' },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="bg-bg/60 rounded-xl p-3 border border-white/[0.06] text-center"
                >
                  <p className="font-heading text-2xl text-text tracking-tight leading-none">
                    {spec.value}
                    {spec.unit && (
                      <span className="text-sm text-text/50 ml-0.5">{spec.unit}</span>
                    )}
                  </p>
                  <p className="font-body text-[10px] uppercase tracking-widest text-text/40 mt-1">
                    {spec.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-text/40 mb-1">
                    Precio desde
                  </p>
                  <p className="font-heading text-4xl text-text tracking-tight">
                    {formatPrice(car.precio)}
                  </p>
                </div>
                {car.destacado && (
                  <span className="px-3 py-1 rounded-full text-xs font-body font-semibold tracking-widest uppercase bg-secondary/20 text-secondary border border-secondary/30">
                    Destacado
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const el = document.getElementById('contacto');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="flex-1 bg-primary hover:bg-accent text-text font-body font-semibold text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl transition-colors duration-200 shadow-[0_4px_20px_rgba(196,30,58,0.4)] hover:shadow-[0_4px_24px_rgba(255,45,78,0.5)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                >
                  Agendar Test Drive
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none bg-transparent hover:bg-white/5 text-text/60 hover:text-text font-body font-semibold text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}