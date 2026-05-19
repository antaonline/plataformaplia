import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { label: 'Inicio', href: 'inicio' },
  { label: 'Catálogo', href: 'catalogo' },
  { label: 'Marcas', href: 'marcas' },
  { label: 'Nosotros', href: 'nosotros' },
  { label: 'Contacto', href: 'contacto' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setActiveLink(href);
    setMobileOpen(false);
    const el = document.getElementById(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-bg/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(196,30,58,0.12)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <button
              onClick={() => handleNavClick('inicio')}
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="APEX Motors - Inicio"
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary rounded-sm rotate-45 group-hover:bg-accent transition-colors duration-300" />
                <Zap
                  size={18}
                  className="relative z-10 text-text fill-text"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-2xl tracking-[0.15em] text-text uppercase">
                  APEX
                </span>
                <span className="font-body text-[9px] tracking-[0.35em] text-secondary uppercase font-medium -mt-0.5">
                  Motors
                </span>
              </div>
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    'relative px-4 py-2 font-body text-sm font-medium tracking-wider uppercase transition-colors duration-200 focus:outline-none group',
                    activeLink === link.href
                      ? 'text-accent'
                      : 'text-text/70 hover:text-text'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-0 left-4 right-4 h-px bg-accent transition-all duration-300 origin-left',
                      activeLink === link.href
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60'
                    )}
                  />
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="w-px h-6 bg-white/10" />
              <button
                onClick={() => handleNavClick('contacto')}
                className="group relative flex items-center gap-2 px-6 py-2.5 font-body text-sm font-semibold tracking-widest uppercase overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-sm"
                aria-label="Agendar Test Drive"
              >
                {/* Background layers */}
                <span className="absolute inset-0 bg-primary transition-all duration-300 group-hover:bg-accent" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-accent to-primary" />
                {/* Shine sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                <span className="relative z-10 text-text">Agendar Test Drive</span>
                <ChevronRight
                  size={14}
                  className="relative z-10 text-text transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-sm"
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
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Accent line bottom */}
        <div
          className={cn(
            'absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent w-full transition-opacity duration-500',
            isScrolled ? 'opacity-100' : 'opacity-0'
          )}
        />
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(320px,90vw)] bg-surface border-l border-white/[0.06] flex flex-col lg:hidden shadow-[-24px_0_80px_rgba(0,0,0,0.6)]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary rounded-sm rotate-45" />
                    <Zap size={13} className="relative z-10 text-text fill-text" strokeWidth={2.5} />
                  </div>
                  <span className="font-heading text-xl tracking-[0.15em] text-text uppercase">APEX</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center text-text/60 hover:text-text transition-colors focus:outline-none"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col px-4 py-8 gap-1 flex-1" aria-label="Menú móvil">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.07, duration: 0.35 }}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      'flex items-center justify-between px-4 py-4 rounded-sm font-body text-base font-medium tracking-widest uppercase transition-all duration-200 focus:outline-none group',
                      activeLink === link.href
                        ? 'bg-primary/15 text-accent border border-primary/30'
                        : 'text-text/60 hover:text-text hover:bg-white/[0.04] border border-transparent'
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronRight
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        activeLink === link.href
                          ? 'text-accent translate-x-0'
                          : 'text-text/30 group-hover:translate-x-1 group-hover:text-text/60'
                      )}
                    />
                  </motion.button>
                ))}
              </nav>

              {/* Drawer CTA */}
              <div className="px-6 pb-10 pt-4 border-t border-white/[0.06]">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  onClick={() => handleNavClick('contacto')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-accent transition-colors duration-300 font-body text-sm font-semibold tracking-widest uppercase text-text rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  Agendar Test Drive
                  <ChevronRight size={14} />
                </motion.button>
                <p className="text-center text-text/30 font-body text-xs tracking-wider mt-4 uppercase">
                  Experiencia exclusiva garantizada
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}