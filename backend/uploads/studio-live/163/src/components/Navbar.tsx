import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Inicio' },
  { id: 'catalog', label: 'Colección' },
  { id: 'about', label: 'Nosotros' },
  { id: 'contact', label: 'Contacto' },
];

export default function Navbar({ currentSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
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

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-bg/90 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_32px_rgba(192,38,211,0.08)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex flex-col items-start group focus:outline-none"
              aria-label="Ir al inicio"
            >
              <span className="font-heading font-black text-2xl tracking-[-0.04em] text-text leading-none group-hover:text-accent transition-colors duration-300">
                SOFUBI
                <span className="text-primary ml-1">MFL</span>
              </span>
              <span className="flex items-center gap-1 mt-0.5">
                <MapPin size={9} className="text-accent" aria-hidden="true" />
                <span className="font-body text-[10px] tracking-[0.18em] uppercase text-text/50 group-hover:text-accent/70 transition-colors duration-300">
                  Miraflores · Lima
                </span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              {navLinks.map((link) => {
                const isActive = currentSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    className={cn(
                      'relative px-4 py-2 font-body text-sm tracking-[0.06em] uppercase transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm',
                      isActive ? 'text-text' : 'text-text/50 hover:text-text/90'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-primary shadow-[0_0_8px_rgba(192,38,211,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Badge desktop */}
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-accent text-[11px] font-body tracking-[0.12em] uppercase select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                Edición Limitada
              </span>

              <button
                onClick={() => handleNav('catalog')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-accent text-sm font-body tracking-wide hover:bg-primary/25 hover:border-primary/60 hover:shadow-[0_0_16px_rgba(192,38,211,0.3)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Ver colección"
              >
                <ShoppingBag size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Colección</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-primary/20 text-text/70 hover:text-accent hover:border-primary/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={18} aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={18} aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              key="drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-surface border-l border-primary/20 shadow-[-8px_0_48px_rgba(192,38,211,0.12)] flex flex-col md:hidden"
              aria-label="Menú móvil"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-primary/15">
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xl tracking-[-0.04em] text-text leading-none">
                    SOFUBI<span className="text-primary ml-1">MFL</span>
                  </span>
                  <span className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-accent" aria-hidden="true" />
                    <span className="font-body text-[10px] tracking-[0.18em] uppercase text-text/40">
                      Miraflores · Lima
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-bg border border-primary/20 text-text/60 hover:text-accent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label="Cerrar menú"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col px-4 py-8 gap-1 flex-1">
                {navLinks.map((link, i) => {
                  const isActive = currentSection === link.id;
                  return (
                    <motion.button
                      key={link.id}
                      initial={{ x: 32, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.06 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => handleNav(link.id)}
                      className={cn(
                        'relative flex items-center gap-3 px-4 py-4 rounded-xl text-left font-body text-base tracking-[0.05em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                        isActive
                          ? 'bg-primary/15 text-accent border border-primary/30 shadow-[inset_0_0_16px_rgba(192,38,211,0.08)]'
                          : 'text-text/60 hover:text-text hover:bg-primary/8 border border-transparent'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && (
                        <span className="w-1 h-5 rounded-full bg-primary shadow-[0_0_8px_rgba(192,38,211,0.9)]" aria-hidden="true" />
                      )}
                      {link.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-6 border-t border-primary/15">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-accent text-[11px] font-body tracking-[0.12em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                  Edición Limitada · 2025
                </span>
                <p className="mt-3 font-body text-xs text-text/30 tracking-wide">
                  Av. Larco, Miraflores, Lima — Perú
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}