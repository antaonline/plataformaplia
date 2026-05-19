import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { label: 'Inicio', page: 'home' },
  { label: 'Colección', page: 'coleccion' },
  { label: 'Artistas', page: 'artistas' },
  { label: 'Cómo Comprar', page: 'como-comprar' },
  { label: 'Contacto', page: 'contacto' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBadgePulse(p => !p), 2200);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (page: string) => {
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
            ? 'bg-bg/80 backdrop-blur-xl border-b border-secondary/10 shadow-[0_4px_32px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex flex-col items-start leading-none group focus:outline-none"
              aria-label="Sofubi Miraflores — Ir al inicio"
            >
              <span className="font-heading text-2xl tracking-[0.18em] text-text group-hover:text-secondary transition-colors duration-300">
                SOFUBI
              </span>
              <span className="font-heading text-xs tracking-[0.45em] text-primary group-hover:text-accent transition-colors duration-300 -mt-0.5">
                MIRAFLORES
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={cn(
                    'relative font-body text-sm tracking-widest uppercase transition-colors duration-300 focus:outline-none group',
                    currentPage === link.page
                      ? 'text-secondary'
                      : 'text-text/70 hover:text-text'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px bg-secondary transition-all duration-300',
                      currentPage === link.page ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </button>
              ))}
            </nav>

            {/* Right cluster */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Badge Nuevas Llegadas */}
              <motion.div
                animate={badgePulse ? { scale: 1.05, opacity: 1 } : { scale: 1, opacity: 0.8 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 cursor-default"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                />
                <span className="font-body text-xs tracking-widest uppercase text-accent font-semibold whitespace-nowrap">
                  Nuevas Llegadas
                </span>
                <Sparkles size={11} className="text-secondary" />
              </motion.div>

              {/* CTA Button */}
              <button
                onClick={() => handleNav('coleccion')}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-accent transition-colors duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/60"
                aria-label="Ver colección completa"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <ShoppingBag size={14} className="text-text relative z-10" />
                <span className="font-body text-xs tracking-widest uppercase text-text font-semibold relative z-10">
                  Ver Colección
                </span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-text hover:border-primary/50 transition-colors duration-200 focus:outline-none"
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
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-surface border-l border-secondary/10 flex flex-col lg:hidden shadow-[−8px_0_48px_rgba(0,0,0,0.7)]"
              aria-label="Menú móvil"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
                <div className="flex flex-col leading-none">
                  <span className="font-heading text-xl tracking-[0.18em] text-text">SOFUBI</span>
                  <span className="font-heading text-[10px] tracking-[0.45em] text-primary -mt-0.5">MIRAFLORES</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-text/60 hover:text-text hover:border-primary/40 transition-colors focus:outline-none"
                  aria-label="Cerrar menú"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Badge */}
              <div className="px-6 pt-6">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                  />
                  <span className="font-body text-xs tracking-widest uppercase text-accent font-semibold">
                    Nuevas Llegadas
                  </span>
                  <Sparkles size={11} className="text-secondary" />
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-1 px-4 pt-6 flex-1">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.page}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleNav(link.page)}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200 focus:outline-none group',
                      currentPage === link.page
                        ? 'bg-primary/15 border border-primary/30 text-secondary'
                        : 'text-text/70 hover:bg-white/5 hover:text-text border border-transparent'
                    )}
                  >
                    <span className="font-body text-sm tracking-widest uppercase font-medium">
                      {link.label}
                    </span>
                    {currentPage === link.page && (
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* CTA bottom */}
              <div className="px-6 pb-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleNav('coleccion')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary hover:bg-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/60"
                >
                  <ShoppingBag size={15} className="text-text" />
                  <span className="font-body text-sm tracking-widest uppercase text-text font-semibold">
                    Ver Colección
                  </span>
                </button>
                <p className="text-center font-body text-xs text-text/30 tracking-wider mt-4">
                  Miraflores · Lima · Perú
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}