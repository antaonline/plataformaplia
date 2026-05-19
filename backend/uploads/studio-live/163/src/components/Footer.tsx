import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, MessageCircle, MapPin, Mail, ArrowRight, Send } from 'lucide-react';
import { fadeUp, staggerContainer } from '../lib/utils';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navLinks = [
    { label: 'Colección', href: 'catalog' },
    { label: 'Marcas', href: 'brands' },
    { label: 'Nosotros', href: 'about' },
    { label: 'Contacto', href: 'contact' },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      handle: '@sofubimfl',
      url: 'https://instagram.com/sofubimfl',
      color: 'hover:text-accent',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      handle: '+51 999 888 777',
      url: 'https://wa.me/51999888777',
      color: 'hover:text-green-400',
    },
    {
      icon: Mail,
      label: 'Email',
      handle: 'hola@sofubimfl.pe',
      url: 'mailto:hola@sofubimfl.pe',
      color: 'hover:text-accent',
    },
  ];

  return (
    <footer className="bg-bg border-t border-primary/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(192,38,211,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(192,38,211,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Newsletter band */}
      <div className="relative border-b border-primary/15">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-10"
          >
            <motion.div variants={fadeUp} className="text-center lg:text-left max-w-lg">
              <p className="text-primary font-body text-sm font-semibold tracking-widest uppercase mb-3">
                Comunidad Coleccionista
              </p>
              <h3 className="font-heading font-extrabold text-3xl md:text-4xl text-text tracking-tight leading-tight mb-3">
                Sé el primero en saber
                <span className="block text-accent">cuándo llega lo raro.</span>
              </h3>
              <p className="text-text/50 font-body text-sm leading-relaxed">
                Drops exclusivos, preventa de ediciones limitadas y acceso anticipado a piezas únicas
                directamente en tu bandeja de entrada.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="w-full lg:w-auto lg:min-w-[420px]">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-2xl px-6 py-5"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Send size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text font-heading font-bold text-sm">¡Bienvenido al círculo!</p>
                    <p className="text-text/50 font-body text-xs mt-0.5">
                      Recibirás los próximos drops antes que nadie.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full bg-surface border border-primary/20 text-text font-body text-sm placeholder:text-text/30 rounded-xl px-5 py-4 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-primary hover:bg-primary/90 text-white font-heading font-bold text-sm px-6 py-4 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-primary/25 whitespace-nowrap"
                  >
                    Suscribirme
                    <ArrowRight size={16} />
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
        >
          {/* Brand column */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            {/* Logo */}
            <div className="mb-6">
              <div className="inline-flex items-baseline gap-1 mb-1">
                <span className="font-heading font-extrabold text-3xl text-text tracking-tighter">
                  SOFUBI
                </span>
                <span
                  className="font-heading font-extrabold text-3xl tracking-tighter"
                  style={{
                    background: 'linear-gradient(135deg, #C026D3, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  MFL
                </span>
              </div>
              {/* Tagline japonés */}
              <p className="text-text/30 font-body text-xs tracking-[0.2em] mb-1">
                ソフビ・ミラフローレス
              </p>
              <p className="text-text/20 font-body text-xs tracking-widest">
                芸術は生きている — El arte vive
              </p>
            </div>

            <p className="text-text/50 font-body text-sm leading-relaxed max-w-sm mb-8">
              La única galería-tienda de sofubi de lujo en Lima. Curamos piezas de vinilo de edición
              limitada de los artistas más raros de Japón, Hong Kong y Corea del Sur. Cada figura,
              una obra de arte.
            </p>

            {/* Address */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-text/80 font-body text-sm font-medium">Miraflores, Lima</p>
                <p className="text-text/40 font-body text-xs leading-relaxed mt-0.5">
                  Av. Larco 1150, Of. 302
                  <br />
                  Miraflores, Lima 15074, Perú
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 text-text/40 ${social.color} transition-all duration-200 group`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface border border-white/5 group-hover:border-primary/30 flex items-center justify-center transition-all duration-200">
                      <Icon size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs font-medium">{social.label}</span>
                      <span className="text-text/20 text-xs">·</span>
                      <span className="font-body text-xs">{social.handle}</span>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeUp}>
            <h4 className="font-heading font-bold text-text text-sm tracking-widest uppercase mb-6">
              Explorar
            </h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={`#${link.href}`}
                    className="text-text/40 hover:text-accent font-body text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-accent transition-all duration-200 overflow-hidden" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="font-heading font-bold text-text text-sm tracking-widest uppercase mt-10 mb-6">
              Marcas
            </h4>
            <ul className="space-y-4">
              {['Secret Base', 'Medicom Toy', 'Restore', 'Instinctoy', 'Wonderwall'].map(
                (brand) => (
                  <li key={brand}>
                    <span className="text-text/30 font-body text-sm cursor-default hover:text-text/50 transition-colors duration-200 block">
                      {brand}
                    </span>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Info + Hours */}
          <motion.div variants={fadeUp}>
            <h4 className="font-heading font-bold text-text text-sm tracking-widest uppercase mb-6">
              Horarios
            </h4>
            <ul className="space-y-3 mb-10">
              {[
                { day: 'Lun – Vie', hours: '11:00 – 20:00' },
                { day: 'Sábado', hours: '11:00 – 21:00' },
                { day: 'Domingo', hours: '12:00 – 18:00' },
              ].map((item) => (
                <li key={item.day} className="flex justify-between items-center gap-4">
                  <span className="text-text/40 font-body text-xs">{item.day}</span>
                  <span className="text-text/70 font-body text-xs font-medium">{item.hours}</span>
                </li>
              ))}
            </ul>

            <h4 className="font-heading font-bold text-text text-sm tracking-widest uppercase mb-6">
              Legal
            </h4>
            <ul className="space-y-4">
              {['Política de privacidad', 'Términos de uso', 'Política de devoluciones'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-text/30 hover:text-text/60 font-body text-xs transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>

            {/* Authenticity badge */}
            <div className="mt-10 p-4 bg-surface border border-primary/15 rounded-xl">
              <p className="text-primary font-heading font-bold text-xs tracking-widest uppercase mb-1">
                100% Auténtico
              </p>
              <p className="text-text/40 font-body text-xs leading-relaxed">
                Todas las piezas son originales con certificado de autenticidad y procedencia directa
                del fabricante.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text/25 font-body text-xs text-center sm:text-left">
              © {new Date().getFullYear()} Sofubi MFL. Todos los derechos reservados. Lima, Perú.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-text/15 font-body text-xs tracking-[0.25em]">
                芸術は生きている
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-text/25 font-body text-xs">
                Hecho con obsesión en Miraflores
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}