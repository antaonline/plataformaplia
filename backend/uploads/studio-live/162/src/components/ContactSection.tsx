import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Instagram, Clock, Send, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const contactInfo = [
  {
    icon: MapPin,
    label: 'Dirección',
    value: 'Av. José Larco 1150, Miraflores',
    sub: 'Lima 15074, Perú',
    href: 'https://maps.google.com/?q=Av.+José+Larco+1150+Miraflores+Lima',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+51 987 654 321',
    sub: 'Respuesta en menos de 1 hora',
    href: 'https://wa.me/51987654321?text=Hola,%20me%20interesa%20una%20figura%20sofubi',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@sofubimiraflores',
    sub: 'Drops exclusivos y novedades',
    href: 'https://instagram.com/sofubimiraflores',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
  {
    icon: Clock,
    label: 'Horario de atención',
    value: 'Mar – Sáb: 11:00 – 20:00',
    sub: 'Dom: 12:00 – 18:00 · Lun: cerrado',
    href: null,
    color: 'text-text',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
];

const pieceTypes = [
  'Sofubi vinilo japonés',
  'Kaiju vintage (Bullmark / Marusan)',
  'Medicom Toy VCD',
  'Blobpus / Marmit',
  'Figura de edición limitada',
  'Colaboración artista independiente',
  'Otro / No sé exactamente',
];

export default function ContactSection() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    tipo: '',
    presupuesto: '',
    mensaje: '',
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <section
      id="contacto"
      className="relative bg-bg py-28 overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(196,30,58,0.08),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(240,237,232,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(240,237,232,0.4) 40px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="font-body text-secondary text-sm tracking-[0.25em] uppercase mb-4"
          >
            Miraflores · Lima · Perú
          </motion.p>
          <motion.h2
            id="contact-heading"
            variants={fadeUp}
            className="font-heading text-6xl md:text-8xl text-text tracking-wide uppercase leading-none mb-6"
          >
            Encuentra Tu
            <br />
            <span className="text-primary">Pieza Única</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body text-text/60 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Cada figura sofubi que llega a nuestra galería pasa por una verificación rigurosa de
            autenticidad. Consúltanos sobre disponibilidad, reservas y piezas a pedido.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start">
          {/* Left column: info + map */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Contact cards */}
            {contactInfo.map((item) => {
              const Icon = item.icon;
              const inner = (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className={cn(
                    'group flex items-start gap-5 p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300',
                    item.bg,
                    item.border,
                    item.href
                      ? 'hover:scale-[1.02] hover:border-opacity-60 cursor-pointer'
                      : 'cursor-default'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                      item.bg,
                      'border',
                      item.border
                    )}
                  >
                    <Icon className={cn('w-5 h-5', item.color)} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-text/40 text-xs tracking-widest uppercase mb-1">
                      {item.label}
                    </p>
                    <p className={cn('font-body font-semibold text-base', item.color)}>
                      {item.value}
                    </p>
                    <p className="font-body text-text/50 text-sm mt-0.5">{item.sub}</p>
                  </div>
                  {item.href && (
                    <ChevronRight
                      className="ml-auto flex-shrink-0 w-4 h-4 text-text/20 group-hover:text-text/50 transition-colors mt-1"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.label}: ${item.value}`}
                >
                  {inner}
                </a>
              ) : (
                <div key={item.label}>{inner}</div>
              );
            })}

            {/* Stylized map */}
            <motion.div
              variants={scaleIn}
              className="relative rounded-2xl overflow-hidden border border-white/10 h-64"
              aria-label="Mapa de ubicación Sofubi Miraflores"
            >
              {/* Map image */}
              <img
                src="https://loremflickr.com/800/400/miraflores,lima,map,city,night"
                alt="Zona Miraflores Lima"
                width={800}
                height={400}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent" />
              <div className="absolute inset-0 bg-primary/10" />

              {/* Pin */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(196,30,58,0.7)]"
                >
                  <MapPin className="w-6 h-6 text-text" aria-hidden="true" />
                </motion.div>
                <div className="text-center">
                  <p className="font-heading text-text text-xl tracking-wider uppercase">
                    Sofubi Miraflores
                  </p>
                  <p className="font-body text-text/60 text-sm">Av. José Larco 1150</p>
                </div>
              </div>

              {/* Grid lines decoration */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(196,30,58,0.6) 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(196,30,58,0.6) 32px)',
                }}
              />

              {/* CTA overlay button */}
              <a
                href="https://maps.google.com/?q=Av.+José+Larco+1150+Miraflores+Lima"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 font-body text-xs text-text/60 hover:text-text bg-bg/70 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full transition-colors"
                aria-label="Abrir en Google Maps"
              >
                Abrir en Maps ↗
              </a>
            </motion.div>
          </motion.div>

          {/* Right column: form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scaleIn}
          >
            <div className="bg-surface/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

              {!sent ? (
                <>
                  <div className="mb-8">
                    <p className="font-body text-secondary text-xs tracking-[0.2em] uppercase mb-2">
                      Formulario de consulta
                    </p>
                    <h3 className="font-heading text-4xl text-text tracking-wide uppercase">
                      Consulta una Pieza
                    </h3>
                    <p className="font-body text-text/50 text-sm mt-2 leading-relaxed">
                      Dinos qué buscas y te contactamos con disponibilidad, precio y opciones de
                      reserva.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Nombre + WhatsApp */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="nombre"
                          className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                        >
                          Nombre
                        </label>
                        <input
                          id="nombre"
                          name="nombre"
                          type="text"
                          required
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                          className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm placeholder-text/20 outline-none transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="whatsapp"
                          className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                        >
                          WhatsApp
                        </label>
                        <input
                          id="whatsapp"
                          name="whatsapp"
                          type="tel"
                          value={form.whatsapp}
                          onChange={handleChange}
                          placeholder="+51 9XX XXX XXX"
                          className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm placeholder-text/20 outline-none transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                      >
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tu@correo.com"
                        className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm placeholder-text/20 outline-none transition-colors duration-200"
                      />
                    </div>

                    {/* Tipo de pieza */}
                    <div>
                      <label
                        htmlFor="tipo"
                        className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                      >
                        Tipo de pieza que buscas
                      </label>
                      <select
                        id="tipo"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm outline-none transition-colors duration-200 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-surface text-text/40">
                          Selecciona una categoría
                        </option>
                        {pieceTypes.map((t) => (
                          <option key={t} value={t} className="bg-surface text-text">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Presupuesto */}
                    <div>
                      <label
                        htmlFor="presupuesto"
                        className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                      >
                        Presupuesto aproximado (S/)
                      </label>
                      <select
                        id="presupuesto"
                        name="presupuesto"
                        value={form.presupuesto}
                        onChange={handleChange}
                        className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm outline-none transition-colors duration-200 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-surface text-text/40">
                          Rango de inversión
                        </option>
                        <option value="hasta-500" className="bg-surface text-text">
                          Hasta S/ 500
                        </option>
                        <option value="500-1500" className="bg-surface text-text">
                          S/ 500 – S/ 1,500
                        </option>
                        <option value="1500-4000" className="bg-surface text-text">
                          S/ 1,500 – S/ 4,000
                        </option>
                        <option value="4000-10000" className="bg-surface text-text">
                          S/ 4,000 – S/ 10,000
                        </option>
                        <option value="10000+" className="bg-surface text-text">
                          S/ 10,000+ (coleccionismo premium)
                        </option>
                      </select>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label
                        htmlFor="mensaje"
                        className="block font-body text-text/50 text-xs tracking-widest uppercase mb-2"
                      >
                        Cuéntanos más
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        rows={4}
                        value={form.mensaje}
                        onChange={handleChange}
                        placeholder="Describe la figura que buscas: artista, colorway, tamaño, edición especial... Mientras más detalles, mejor podemos ayudarte."
                        className="w-full bg-bg/60 border border-white/10 focus:border-primary/60 rounded-xl px-4 py-3 font-body text-text text-sm placeholder-text/20 outline-none transition-colors duration-200 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-body font-semibold text-text text-base tracking-wide transition-all duration-300',
                        loading
                          ? 'bg-primary/40 cursor-wait'
                          : 'bg-primary hover:bg-accent shadow-[0_0_32px_rgba(196,30,58,0.4)] hover:shadow-[0_0_48px_rgba(255,58,92,0.5)]'
                      )}
                      aria-label="Enviar consulta"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-text/30 border-t-text rounded-full"
                          />
                          Enviando consulta...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" aria-hidden="true" />
                          Enviar Consulta
                        </>
                      )}
                    </motion.button>

                    <p className="font-body text-text/30 text-xs text-center leading-relaxed">
                      También puedes escribirnos directamente por{' '}
                      <a
                        href="https://wa.me/51987654321"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                      >
                        WhatsApp
                      </a>{' '}
                      para respuesta inmediata.
                    </p>
                  </form>
                </>
              ) : (
                /* Success state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_48px_rgba(196,30,58,0.4)]"
                  >
                    <Send className="w-8 h-8 text-primary" aria-hidden="true" />
                  </motion.div>
                  <div>
                    <h3 className="font-heading text-4xl text-text tracking-wide uppercase mb-3">
                      Consulta Enviada
                    </h3>
                    <p className="font-body text-text/60 text-base leading-relaxed max-w-sm">
                      Nuestro equipo revisará tu solicitud y te contactará en menos de 24 horas con
                      opciones personalizadas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-5 py-3 rounded-full">
                    <MessageCircle className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <span className="font-body text-secondary text-sm font-medium">
                      Revisa tu WhatsApp pronto
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        nombre: '',
                        email: '',
                        whatsapp: '',
                        tipo: '',
                        presupuesto: '',
                        mensaje: '',
                      });
                    }}
                    className="font-body text-text/30 hover:text-text/60 text-sm underline underline-offset-4 transition-colors"
                  >
                    Enviar otra consulta
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}