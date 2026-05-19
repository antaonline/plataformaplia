import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, ArrowUpRight, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Marcas', href: '#marcas' },
  { label: 'Test Drive', href: '#test-drive' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

const legalLinks = [
  { label: 'Política de Privacidad', href: '#privacidad' },
  { label: 'Términos y Condiciones', href: '#terminos' },
  { label: 'Cookies', href: '#cookies' },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#instagram' },
  { icon: Twitter, label: 'Twitter / X', href: '#twitter' },
  { icon: Youtube, label: 'YouTube', href: '#youtube' },
  { icon: Facebook, label: 'Facebook', href: '#facebook' },
];

const brands = ['Ferrari', 'Lamborghini', 'Porsche', 'McLaren', 'Bugatti', 'Aston Martin'];

export default function Footer() {
  return (
    <footer className="bg-bg border-t border-white/[0.06] relative overflow-hidden">
      {/* Decorative radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top CTA Strip */}
      <div className="relative border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading text-4xl lg:text-5xl uppercase tracking-wider text-text">
              ¿Listo para tu próximo{' '}
              <span className="text-primary">supercar</span>?
            </p>
            <p className="font-body text-text/50 mt-2 text-sm">
              Agenda tu test drive hoy. Experiencia sin compromiso.
            </p>
          </div>
          <a
            href="#contacto"
            className="group flex items-center gap-3 bg-primary hover:bg-accent transition-colors duration-300 text-text font-body font-semibold text-sm uppercase tracking-widest px-8 py-4 rounded-sm whitespace-nowrap"
          >
            Agendar Test Drive
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
              <span className="font-heading text-text text-lg leading-none">A</span>
            </div>
            <span className="font-heading text-2xl tracking-[0.15em] uppercase text-text">
              APEX <span className="text-secondary">Motors</span>
            </span>
          </div>

          <p className="font-body text-text/50 text-sm leading-relaxed mb-8 max-w-xs">
            La selección más exclusiva de superautos y vehículos de alta performance en América Latina. Pasión, velocidad y lujo en cada kilómetro.
          </p>

          {/* Contact Info */}
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-text/50 text-xs font-body">
              <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span>Av. Presidente Masaryk 111, Polanco, CDMX</span>
            </li>
            <li className="flex items-center gap-3 text-text/50 text-xs font-body">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>+52 55 9876 5432</span>
            </li>
            <li className="flex items-center gap-3 text-text/50 text-xs font-body">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>contacto@apexmotors.mx</span>
            </li>
          </ul>
        </motion.div>

        {/* Navigation Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-secondary mb-6">
            Navegación
          </h4>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-body text-text/60 hover:text-text text-sm transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-3 h-px bg-primary/40 group-hover:w-5 group-hover:bg-primary transition-all duration-300" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Brands Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-secondary mb-6">
            Marcas
          </h4>
          <ul className="space-y-3">
            {brands.map((brand) => (
              <li key={brand}>
                <a
                  href="#catalogo"
                  className="font-body text-text/60 hover:text-text text-sm transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-3 h-px bg-primary/40 group-hover:w-5 group-hover:bg-primary transition-all duration-300" />
                  {brand}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Social & Newsletter Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-secondary mb-6">
            Síguenos
          </h4>

          <div className="flex gap-3 mb-10">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 border border-white/[0.08] hover:border-primary/60 bg-surface hover:bg-primary/10 flex items-center justify-center rounded-sm transition-all duration-300 group"
              >
                <Icon className="w-4 h-4 text-text/50 group-hover:text-primary transition-colors duration-200" />
              </a>
            ))}
          </div>

          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-secondary mb-4">
            Newsletter
          </h4>
          <p className="font-body text-text/40 text-xs mb-4 leading-relaxed">
            Primeras noticias de nuevos modelos y eventos exclusivos.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder="tu@email.com"
              className="bg-surface border border-white/[0.08] focus:border-primary/60 text-text placeholder:text-text/30 font-body text-sm px-4 py-2.5 rounded-sm outline-none transition-colors duration-200"
            />
            <button
              type="submit"
              className="bg-surface border border-primary/40 hover:bg-primary/20 hover:border-primary text-text font-body text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm transition-all duration-300"
            >
              Suscribirse
            </button>
          </form>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* Bottom Bar */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-text/30 text-xs">
          © {new Date().getFullYear()} APEX Motors. Todos los derechos reservados.
        </p>

        <div className="flex items-center gap-6">
          {legalLinks.map((link, i) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                className="font-body text-text/30 hover:text-text/60 text-xs transition-colors duration-200"
              >
                {link.label}
              </a>
              {i < legalLinks.length - 1 && (
                <span className="text-text/10 text-xs">|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-body text-text/30 text-xs">Diseñado por PLIA Studio</span>
        </div>
      </div>
    </footer>
  );
}