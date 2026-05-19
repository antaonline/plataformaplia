import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Menu, X, Gem } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { label: 'Colección', page: 'coleccion' },
  { label: 'Filosofía', page: 'filosofia' },
  { label: 'Nosotros', page: 'nosotros' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-bg/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_32px_rgba(201,168,76,0.08)]'
            : 'bg-transparent'
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm"
              aria-label="Zofubi Luxury — Ir al inicio"
            >
              <div className="relative flex items-center justify-center w-9 h-9">
                <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300" />
                <Crown
                  size={18}
                  className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-300"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-xl tracking-[0.12em] text-text uppercase">
                  Zofubi
                </span>
                <span className="font-heading italic text-xs tracking-[0.28em] text-primary uppercase">
                  Luxury
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Navegación principal"
            >
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavigate(link.page)}
                  className={cn(
                    'relative font-body text-sm tracking-[0.14em] uppercase transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm px-1 py-0.5',
                    currentPage === link.page
                      ? 'text-primary'
                      : 'text-text/70 hover:text-text'
                  )}
                  aria-current={currentPage === link.page ? 'page' : undefined}
                >
                  {link.label}
                  {currentPage === link.page && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              {/* VIP Badge */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5"
                aria-label="Programa VIP exclusivo"
              >
                <Gem size={11} className="text-primary" aria-hidden="true" />
                <span className="font-body text-[10px] tracking-[0.22em] uppercase text-primary font-medium">
                  VIP
                </span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleNavigate('membresia')}
                className="group relative overflow-hidden px-5 py-2.5 rounded-sm bg-primary text-bg font-body text-xs tracking-[0.18em] uppercase font-semibold transition-all duration-300 hover:bg-accent hover:shadow-[0_0_20px_rgba(201,168,76,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="Unirse al programa de membresía exclusiva"
              >
                <span className="relative z-10">Membresía Exclusiva</span>
                <span className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 text-text/80 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl flex flex-col pt-24 pb-12 px-8"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            {/* Decorative line */}
            <div className="absolute top-20 left-8 right-8 h-px bg-primary/20" aria-hidden="true" />

            <nav className="flex flex-col gap-2 mt-4" aria-label="Navegación móvil">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.page}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleNavigate(link.page)}
                  className={cn(
                    'text-left font-heading font-black text-4xl tracking-[0.08em] uppercase py-3 border-b border-primary/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm',
                    currentPage === link.page ? 'text-primary' : 'text-text/60 hover:text-text'
                  )}
                  aria-current={currentPage === link.page ? 'page' : undefined}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              className="mt-auto flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gem size={13} className="text-primary" aria-hidden="true" />
                <span className="font-body text-xs tracking-[0.22em] uppercase text-primary">
                  Programa VIP Exclusivo
                </span>
              </div>
              <button
                onClick={() => handleNavigate('membresia')}
                className="w-full py-4 bg-primary text-bg font-body text-sm tracking-[0.18em] uppercase font-semibold rounded-sm hover:bg-accent transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="Unirse al programa de membresía exclusiva"
              >
                Únete a la Membresía
              </button>
              <p className="font-body text-xs text-text/30 tracking-wide text-center">
                Miraflores, Lima — Perú
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}