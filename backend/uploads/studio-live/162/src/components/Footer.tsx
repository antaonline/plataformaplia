import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, MessageCircle, MapPin, Mail, ExternalLink, Shield, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const navLinks = [
  { label: 'Inicio', section: 'home' },
  { label: 'Colección', section: 'coleccion' },
  { label: 'Cultura Sofubi', section: 'cultura' },
  { label: 'Artistas', section: 'artistas' },
  { label: 'Cómo Comprar', section: 'proceso' },
  { label: 'Contacto', section: 'contacto' },
];

const socialLinks = [
  {
    label: 'Instagram',
    handle: '@sofubimiraflores',
    href: 'https://instagram.com/sofubimiraflores',
    icon: Instagram,
    color: 'hover:text-accent',
  },
  {
    label: 'WhatsApp',
    handle: '+51 999 888 777',
    href: 'https://wa.me/51999888777',
    icon: MessageCircle,
    color: 'hover:text-secondary',
  },
  {
    label: 'Email',
    handle: 'contacto@sofubimiraflores.pe',
    href: 'mailto:contacto@sofubimiraflores.pe',
    icon: Mail,
    color: 'hover:text-primary',
  },
];

const badges = [
  { icon: Shield, text: 'Autenticidad Garantizada' },
  { icon: Star, text: 'Ediciones Limitadas Verificadas' },
  { icon: MapPin, text: 'Miraflores, Lima — Perú' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (section: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { section } }));
  };

  return (
    <footer className="relative bg-bg border-t border-secondary/10 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(196,30,58,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(212,160,23,0.3) 40px,
              rgba(212,160,23,0.3) 41px
            ), repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(212,160,23,0.3) 40px,
              rgba(212,160,23,0.3) 41px
            )`,
          }}
        />
      </div>

      {/* Disclaimer banner */}
      <div className="relative border-b border-secondary/10 bg-surface/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {badges.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-center gap-2 text-secondary/70 text-sm font-body"
              >
                <Icon size={14} className="text-secondary/50 flex-shrink-0" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-1"
          >
            {/* Logo */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                    <span className="font-heading text-text text-xl tracking-widest">S</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full" />
                </div>
                <div>
                  <div className="font-heading text-text text-2xl tracking-[0.15em] leading-none">
                    SOFUBI
                  </div>
                  <div className="font-heading text-secondary text-sm tracking-[0.3em] leading-none mt-1">
                    MIRAFLORES
                  </div>
                </div>
              </div>

              <p className="font-body text-text/50 text-sm leading-relaxed max-w-xs">
                La única galería especializada en sofubi de lujo en Lima. Figuras de vinilo japonés auténticas, artistas independientes y ediciones limitadas para el coleccionista exigente.
              </p>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-text/40 text-xs font-body">
              <MapPin size={12} className="mt-0.5 text-primary/60 flex-shrink-0" />
              <span>Av. Larco 1301, Miraflores<br />Lima 15074, Perú</span>
            </div>
          </motion.div>

          {/* Navigation column */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h4 className="font-heading text-text text-lg tracking-[0.2em] mb-6 uppercase">
              Navegación
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link, i) => (
                <li key={link.section}>
                  <button
                    onClick={() => handleNavClick(link.section)}
                    className={cn(
                      'font-body text-text/50 text-sm hover:text-accent transition-colors duration-200',
                      'flex items-center gap-2 group'
                    )}
                  >
                    <span className="w-4 h-px bg-text/20 group-hover:bg-accent group-hover:w-6 transition-all duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social / Contact column */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h4 className="font-heading text-text text-lg tracking-[0.2em] mb-6 uppercase">
              Contacto
            </h4>
            <ul className="space-y-4">
              {socialLinks.map(({ label, handle, href, icon: Icon, color }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-start gap-3 group transition-colors duration-200',
                      color
                    )}
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-current/30 transition-colors duration-200">
                      <Icon size={13} className="text-text/40 group-hover:text-current transition-colors duration-200" />
                    </div>
                    <div>
                      <div className="font-body text-xs text-text/30 uppercase tracking-widest mb-0.5">
                        {label}
                      </div>
                      <div className="font-body text-sm text-text/60 group-hover:text-current transition-colors duration-200 flex items-center gap-1">
                        {handle}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hours + Authenticity column */}
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h4 className="font-heading text-text text-lg tracking-[0.2em] mb-6 uppercase">
              Horarios
            </h4>
            <div className="space-y-2 mb-8">
              {[
                { day: 'Lunes — Viernes', hours: '11:00 — 20:00' },
                { day: 'Sábado', hours: '10:00 — 21:00' },
                { day: 'Domingo', hours: '12:00 — 18:00' },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between items-baseline gap-4">
                  <span className="font-body text-xs text-text/40">{day}</span>
                  <span className="font-body text-xs text-secondary/70 font-medium tabular-nums">{hours}</span>
                </div>
              ))}
            </div>

            {/* Authenticity badge */}
            <div className="p-4 rounded-sm bg-white/[0.03] border border-secondary/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={13} className="text-secondary" />
                <span className="font-heading text-secondary text-xs tracking-[0.2em] uppercase">
                  Certificado de Autenticidad
                </span>
              </div>
              <p className="font-body text-text/35 text-xs leading-relaxed">
                Cada pieza incluye certificado de origen y verificación de autenticidad. Importación directa desde Japón.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-body text-text/25 text-xs text-center sm:text-left"
            >
              © {currentYear} Sofubi Miraflores Lima Perú. Todos los derechos reservados.
              <span className="hidden sm:inline"> · </span>
              <br className="sm:hidden" />
              Figuras sofubi auténticas de vinilo japonés.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center gap-1 text-text/20 text-xs font-body"
            >
              <span>Diseñado con</span>
              <span className="text-primary/60 mx-1">♥</span>
              <span>por</span>
              <span className="text-secondary/50 ml-1 font-medium">PLIA Studio</span>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-body text-text/15 text-[10px] text-center mt-4 max-w-3xl mx-auto leading-relaxed"
          >
            Sofubi Miraflores es un distribuidor independiente autorizado. Todas las marcas, nombres de artistas y diseños de figuras son propiedad de sus respectivos creadores y estudios japoneses. Las ediciones limitadas están sujetas a disponibilidad. Precios en soles peruanos (PEN) sujetos a variación sin previo aviso.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}