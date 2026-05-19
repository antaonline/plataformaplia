import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '../lib/utils';

const navColumns = [
  {
    title: 'Colección',
    links: [
      { label: 'Nueva Temporada', href: '#collection' },
      { label: 'Hoodies & Sudaderas', href: '#collection' },
      { label: 'Camisetas', href: '#collection' },
      { label: 'Pantalones', href: '#collection' },
      { label: 'Accesorios', href: '#collection' },
      { label: 'Ediciones Limitadas', href: '#collection' },
    ],
  },
  {
    title: 'Marca',
    links: [
      { label: 'Nuestra Historia', href: '#culture' },
      { label: 'Manifiesto', href: '#culture' },
      { label: 'Lookbook', href: '#lookbook' },
      { label: 'Colaboraciones', href: '#culture' },
      { label: 'Sostenibilidad', href: '#culture' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Guía de Tallas', href: '#' },
      { label: 'Envíos y Devoluciones', href: '#' },
      { label: 'Preguntas Frecuentes', href: '#' },
      { label: 'Contacto', href: '#' },
      { label: 'Política de Privacidad', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#', handle: '@urbndistrict' },
  { icon: Twitter, label: 'Twitter / X', href: '#', handle: '@urbndistrict' },
  { icon: Youtube, label: 'YouTube', href: '#', handle: 'URBN DISTRICT' },
  { icon: Facebook, label: 'Facebook', href: '#', handle: 'URBN DISTRICT' },
];

const contactInfo = [
  { icon: Mail, text: 'hola@urbndistrict.com' },
  { icon: MapPin, text: 'Madrid, España' },
  { icon: Phone, text: '+34 900 000 000' },
];

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-secondary/10">
      {/* Top strip */}
      <div className="border-b border-secondary/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-secondary/50 text-sm uppercase tracking-widest">
            Envío gratuito en pedidos superiores a 80€
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <p className="font-body text-secondary/50 text-sm uppercase tracking-widest">
              Nueva colección disponible ahora
            </p>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Brand column */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <a href="#" className="inline-block mb-8 group">
              <span className="font-heading text-4xl text-text tracking-tight leading-none">
                URBN
                <span className="text-accent">_</span>
                DISTRICT
              </span>
            </a>

            <p className="font-body text-secondary/60 text-base leading-relaxed mb-8 max-w-xs">
              Ropa urbana para quienes definen su propio camino. Calidad sin concesiones, estética sin límites.
            </p>

            {/* Contact info */}
            <ul className="space-y-3 mb-10">
              {contactInfo.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon size={15} className="text-accent flex-shrink-0" />
                  <span className="font-body text-secondary/50 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center',
                    'border border-secondary/15 text-secondary/50',
                    'hover:border-accent hover:text-accent hover:bg-accent/5',
                    'transition-all duration-300'
                  )}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Nav columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {navColumns.map((col, colIdx) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.1 + colIdx * 0.08 }}
              >
                <h4 className="font-heading text-lg text-text tracking-widest uppercase mb-6">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className={cn(
                          'font-body text-sm text-secondary/50',
                          'hover:text-accent transition-colors duration-200',
                          'flex items-center gap-1 group'
                        )}
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-0.5"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Social proof strip */}
      <motion.div
        className="border-t border-secondary/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '+48K', label: 'Seguidores' },
              { value: '12K+', label: 'Clientes Activos' },
              { value: '4.9★', label: 'Valoración Media' },
              { value: '100%', label: 'Algodón Orgánico' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl text-accent tracking-tight">{stat.value}</p>
                <p className="font-body text-xs text-secondary/40 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="border-t border-secondary/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-secondary/30 text-xs">
            © {new Date().getFullYear()} URBN DISTRICT. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {['Términos', 'Privacidad', 'Cookies'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-body text-xs text-secondary/30 hover:text-accent transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
          <p className="font-body text-secondary/20 text-xs">
            Diseñado por{' '}
            <span className="text-accent/60">PLIA Studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}