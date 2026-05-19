import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { label: 'Colección', href: '#collection' },
  { label: 'Cultura', href: '#culture' },
  { label: 'Lookbook', href: '#lookbook' },
  { label: 'Contacto', href: '#newsletter' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(2);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              aria-label="URBN DISTRICT — Inicio"
            >
              <span className="font-heading text-2xl lg:text-3xl tracking-widest text-text uppercase leading-none">
                URBN
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent mt-0.5 group-hover:scale-150 transition-transform duration-300"
                aria-hidden="true"
              />
              <span className="font-heading text-2xl lg:text-3xl tracking-widest text-accent uppercase leading-none">
                DISTRICT
              </span>
            </motion.a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-10" aria-label="Navegación principal">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="relative font-body text-sm font-medium tracking-widest uppercase text-secondary/70 hover:text-text transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-text hover:text-accent transition-colors duration-300"
                aria-label={`Carrito de compras, ${cartCount} artículos`}
              >
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-bg text-[10px] font-body font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              {/* CTA Desktop */}
              <motion.a
                href="#collection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="hidden lg:inline-flex items-center gap-2 bg-accent text-bg font-body text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-accent/90 transition-colors duration-300"
              >
                Nueva Colección
              </motion.a>

              {/* Mobile Menu Toggle */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-text hover:text-accent transition-colors duration-300"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: '100%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 bg-bg/98 backdrop-blur-2xl flex flex-col lg:hidden"
        aria-hidden={!menuOpen}
      >
        {/* Top spacer matching header height */}
        <div className="h-16" />

        <nav className="flex flex-col justify-center flex-1 px-10 gap-2" aria-label="Menú móvil">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, x: 40 }}
              animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ delay: menuOpen ? 0.1 + i * 0.07 : 0, duration: 0.4 }}
              className="font-heading text-6xl uppercase tracking-widest text-text hover:text-accent transition-colors duration-300 py-2 border-b border-secondary/10"
            >
              {link.label}
            </motion.a>
          ))}

          <motion.a
            href="#collection"
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: menuOpen ? 0.42 : 0, duration: 0.4 }}
            className="mt-10 inline-flex items-center justify-center bg-accent text-bg font-body text-sm font-bold tracking-widest uppercase px-8 py-4 hover:bg-accent/90 transition-colors duration-300 self-start"
          >
            Nueva Colección
          </motion.a>
        </nav>

        {/* Footer inside mobile menu */}
        <div className="px-10 pb-10 flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-secondary/40">
            © 2025 URBN DISTRICT
          </span>
          <div className="flex gap-4">
            {['IG', 'TK', 'TW'].map((social) => (
              <button
                key={social}
                className="font-body text-xs tracking-widest uppercase text-secondary/40 hover:text-accent transition-colors duration-300"
                aria-label={social}
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}