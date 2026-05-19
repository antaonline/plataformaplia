import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Instagram, Facebook, Youtube, Twitter, Mail, Phone, ChevronRight } from 'lucide-react';
import { fadeUp, staggerContainer } from '../lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Colección', href: '#coleccion' },
    { label: 'Artistas', href: '#artistas' },
    { label: 'Filosofía Sofubi', href: '#filosofia' },
    { label: 'Membresía VIP', href: '#membresia' },
    { label: 'Nosotros', href: '#nosotros' },
  ];

  const categories = [
    'Kaiju Clásico',
    'Vinilo Japonés',
    'Ediciones Limitadas',
    'Colaboraciones',
    'Piezas de Autor',
    'Colecciones Vintage',
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
    { icon: Twitter, label: 'Twitter / X', href: '#' },
  ];

  return (
    <footer className="bg-bg border-t border-primary/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Golden decorative separator */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="flex justify-center -mt-3">
          <div className="bg-bg px-6 flex items-center gap-3">
            <div className="w-8 h-px bg-primary/60" />
            <div className="w-2 h-2 bg-primary rotate-45" />
            <span className="font-heading text-primary text-sm tracking-[0.3em] uppercase">
              Zofubi Luxury
            </span>
            <div className="w-2 h-2 bg-primary rotate-45" />
            <div className="w-8 h-px bg-primary/60" />
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="font-heading font-black text-3xl text-primary tracking-widest uppercase leading-none">
                Zofubi
              </h2>
              <p className="font-heading italic text-accent/70 text-sm tracking-[0.4em] uppercase mt-1">
                Luxury
              </p>
            </div>
            <p className="font-body text-text/60 text-sm leading-relaxed mb-6">
              La galería de coleccionismo sofubi más exclusiva de Latinoamérica. 
              Piezas únicas de vinilo japonés para coleccionistas de alto nivel.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-sm border border-primary/30 bg-surface flex items-center justify-center text-primary/60 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation column */}
          <motion.div variants={fadeUp}>
            <h3 className="font-heading font-bold text-text text-base tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" />
              Navegación
            </h3>
            <ul className="space-y-3">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="font-body text-text/55 text-sm hover:text-accent transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ChevronRight
                      size={12}
                      className="text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories column */}
          <motion.div variants={fadeUp}>
            <h3 className="font-heading font-bold text-text text-base tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" />
              Categorías
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href="#coleccion"
                    className="font-body text-text/55 text-sm hover:text-accent transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ChevronRight
                      size={12}
                      className="text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                    />
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Hours column */}
          <motion.div variants={fadeUp}>
            <h3 className="font-heading font-bold text-text text-base tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" />
              Galería & Contacto
            </h3>

            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-text/80 text-sm font-medium">Miraflores, Lima</p>
                  <p className="font-body text-text/50 text-xs mt-0.5 leading-relaxed">
                    Av. Larco 1150, Piso 3<br />
                    Miraflores, Lima 15074, Perú
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-text/80 text-sm font-medium">Horario de Galería</p>
                  <p className="font-body text-text/50 text-xs mt-0.5 leading-relaxed">
                    Lun – Vie: 11:00 – 20:00<br />
                    Sáb – Dom: 10:00 – 21:00
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-text/80 text-sm font-medium">Email VIP</p>
                  <a
                    href="mailto:vip@zofubiluxury.pe"
                    className="font-body text-text/50 text-xs mt-0.5 hover:text-accent transition-colors duration-200 block"
                  >
                    vip@zofubiluxury.pe
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-text/80 text-sm font-medium">WhatsApp Exclusivo</p>
                  <a
                    href="tel:+51987654321"
                    className="font-body text-text/50 text-xs mt-0.5 hover:text-accent transition-colors duration-200 block"
                  >
                    +51 987 654 321
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom decorative separator */}
        <div className="mt-14 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* Copyright row */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-text/35 text-xs tracking-wide text-center md:text-left">
            © {currentYear} Zofubi Luxury. Todos los derechos reservados.
            <span className="mx-2 text-primary/30">|</span>
            Galería de Arte Sofubi · Miraflores, Lima, Perú
          </p>

          <div className="flex items-center gap-1">
            <span className="font-body text-text/25 text-xs">Crafted by</span>
            <span className="font-heading text-primary/50 text-xs tracking-widest uppercase ml-1">
              PLIA Studio
            </span>
            <div className="w-1 h-1 bg-primary/40 rounded-full mx-2" />
            <span className="font-body text-text/25 text-xs">Lima, Perú</span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}