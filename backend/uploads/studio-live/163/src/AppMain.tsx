import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollection from './components/FeaturedCollection';
import BrandsSection from './components/BrandsSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import { fadeUp, staggerContainer } from './lib/utils';

type Section = 'home' | 'catalog' | 'about' | 'contact';

const ContactSection = () => {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '', interes: 'compra' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="bg-bg py-28 lg:py-36 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(124,58,237,0.10) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(192,38,211,0.08) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(240,171,252,1) 1px, transparent 1px), linear-gradient(90deg, rgba(240,171,252,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-body text-primary text-xs tracking-[0.25em] uppercase mb-4 flex items-center gap-3"
          >
            <span className="inline-block w-8 h-px bg-primary" />
            Contacto Directo
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading font-extrabold text-text text-5xl lg:text-6xl leading-none tracking-[-0.03em] max-w-2xl mb-6"
          >
            Hablemos de tu{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)' }}
            >
              próxima pieza
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body text-text/60 text-lg max-w-xl leading-relaxed"
          >
            ¿Buscas una edición especial? ¿Quieres reservar antes del drop? Escríbenos y nuestro equipo de curadores te asesora personalmente.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-primary/30 bg-surface p-12 text-center"
                style={{ boxShadow: '0 0 40px rgba(192,38,211,0.12)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, rgba(192,38,211,0.2), rgba(124,58,237,0.2))' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F0ABFC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-heading font-extrabold text-text text-2xl mb-3 tracking-[-0.02em]">
                  ¡Mensaje recibido!
                </h3>
                <p className="font-body text-text/60 leading-relaxed">
                  Nuestro equipo te contactará en menos de 24 horas. Mientras tanto, síguenos en Instagram para ver los últimos drops.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-primary/20 bg-surface p-8 lg:p-10"
                style={{ boxShadow: '0 4px 40px rgba(192,38,211,0.08)' }}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-body text-xs tracking-[0.12em] uppercase text-text/50 mb-2 block">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full bg-bg border border-primary/20 rounded-xl px-4 py-3 font-body text-text placeholder-text/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-[0.12em] uppercase text-text/50 mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full bg-bg border border-primary/20 rounded-xl px-4 py-3 font-body text-text placeholder-text/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs tracking-[0.12em] uppercase text-text/50 mb-2 block">
                    Me interesa
                  </label>
                  <select
                    value={form.interes}
                    onChange={(e) => setForm({ ...form, interes: e.target.value })}
                    className="w-full bg-bg border border-primary/20 rounded-xl px-4 py-3 font-body text-text focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="compra">Comprar una pieza específica</option>
                    <option value="reserva">Reservar un drop próximo</option>
                    <option value="consignment">Vender / Consignación</option>
                    <option value="info">Información general</option>
                    <option value="visita">Visitar la tienda en Miraflores</option>
                  </select>
                </div>

                <div>
                  <label className="font-body text-xs tracking-[0.12em] uppercase text-text/50 mb-2 block">
                    Mensaje
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Cuéntanos qué buscas, qué artistas te interesan o cualquier consulta..."
                    className="w-full bg-bg border border-primary/20 rounded-xl px-4 py-3 font-body text-text placeholder-text/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-heading font-bold text-bg text-sm tracking-[0.08em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)',
                    boxShadow: '0 4px 24px rgba(192,38,211,0.35)',
                  }}
                >
                  Enviar mensaje
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            {/* Store info card */}
            <div
              className="rounded-2xl border border-primary/20 bg-surface p-8 relative overflow-hidden"
              style={{ boxShadow: '0 4px 40px rgba(192,38,211,0.06)' }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'rgba(192,38,211,0.08)', transform: 'translate(30%, -30%)' }}
              />
              <h3 className="font-heading font-extrabold text-text text-xl tracking-[-0.02em] mb-6">
                Visítanos en Miraflores
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-text text-sm mb-1">Dirección</p>
                    <p className="font-body text-text/60 text-sm leading-relaxed">
                      Av. Larco 1150, Miraflores<br />Lima 15074, Perú
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-text text-sm mb-1">Horario</p>
                    <p className="font-body text-text/60 text-sm leading-relaxed">
                      Lunes a Sábado: 11:00 — 20:00<br />Domingo: 12:00 — 18:00
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-text text-sm mb-1">WhatsApp</p>
                    <a
                      href="https://wa.me/51999888777"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-accent text-sm hover:text-primary transition-colors duration-200"
                    >
                      +51 999 888 777
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map image */}
            <div className="rounded-2xl overflow-hidden border border-primary/20 relative" style={{ height: '220px' }}>
              <img
                src="https://loremflickr.com/800/400/miraflores,lima,peru,street"
                alt="Tienda SOFUBI MFL en Miraflores, Lima"
                width={800}
                height={400}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, rgba(192,38,211,0.15) 0%, rgba(124,58,237,0.15) 100%)';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-body text-xs text-text/80 tracking-wide">Miraflores, Lima</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CatalogSection = ({ onNavigate }: { onNavigate: (s: Section) => void }) => {
  const categories = ['Todos', 'Kaiju', 'Designer', 'Urban', 'Colaboración', 'Vintage'];
  const [activeCategory, setActiveCategory] = useState('Todos');

  const allPieces = [
    { id: 1, nombre: 'Oni Phantom Ver. Black', artista: 'Mori Katsura', precio: 1890, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/oni1/500/600', categoria: 'Kaiju', unidades: 30 },
    { id: 2, nombre: 'Ghost Rabbit Neon', artista: 'Secret Base', precio: 2450, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/ghost2/500/600', categoria: 'Designer', unidades: 15 },
    { id: 3, nombre: 'Yokai Drifter Crimson', artista: 'Restore', precio: 3200, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/yokai3/500/600', categoria: 'Kaiju', unidades: 8 },
    { id: 4, nombre: 'Micro Kaiju 001', artista: 'Medicom Toy', precio: 980, edicionLimitada: false, imagen: 'https://loremflickr.com/seed/micro4/500/600', categoria: 'Kaiju' },
    { id: 5, nombre: 'Tengu Spirit Gold', artista: 'Bounty Hunter', precio: 4100, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/tengu5/500/600', categoria: 'Designer', unidades: 5 },
    { id: 6, nombre: 'Neo Kappa Ultraviolet', artista: 'Dream Rocket', precio: 2890, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/kappa6/500/600', categoria: 'Vintage', unidades: 12 },
    { id: 7, nombre: 'Chaos Kaiju Black Sun', artista: 'Bemon', precio: 3650, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/chaos7/500/600', categoria: 'Kaiju', unidades: 4 },
    { id: 8, nombre: 'Skull Bee Dorado', artista: 'Itokin Park', precio: 2750, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/skull8/500/600', categoria: 'Designer', unidades: 7 },
    { id: 9, nombre: 'Urban Ronin Series 2', artista: 'Toy Art Gallery', precio: 1650, edicionLimitada: false, imagen: 'https://loremflickr.com/seed/ronin9/500/600', categoria: 'Urban' },
    { id: 10, nombre: 'Negora Celestial Black', artista: 'Konatsu', precio: 1890, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/negora10/500/600', categoria: 'Designer', unidades: 3 },
    { id: 11, nombre: 'Vintage Zag Showa', artista: 'M1Go', precio: 5200, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/zag11/500/600', categoria: 'Vintage', unidades: 2 },
    { id: 12, nombre: 'Collab Kaiju × BAPE', artista: 'Secret Base × BAPE', precio: 6800, edicionLimitada: true, imagen: 'https://loremflickr.com/seed/bape12/500/600', categoria: 'Colaboración', unidades: 1 },
  ];

  const filtered = activeCategory === 'Todos'
    ? allPieces
    : allPieces.filter((p) => p.categoria === activeCategory);

  return (
    <section id="catalog" className="bg-bg py-28 lg:py-36 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(192,38,211,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="font-body text-primary text-xs tracking-[0.25em] uppercase mb-4 flex items-center gap-3"
          >
            <span className="inline-block w-8 h-px bg-primary" />
            Catálogo Completo
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading font-extrabold text-text text-5xl lg:text-6xl leading-none tracking-[-0.03em] mb-6"
          >
            Cada pieza,{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)' }}
            >
              una obra
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body text-text/60 text-lg max-w-xl leading-relaxed"
          >
            Sofubi auténtico traído directamente desde Japón y el sudeste asiático. Cada figura certificada, con documentación de origen y embalaje original del artista.
          </motion.p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-body text-sm px-5 py-2.5 rounded-full border transition-all duration-250 ${
                activeCategory === cat
                  ? 'bg-primary border-primary text-bg font-semibold'
                  : 'border-primary/25 text-text/60 hover:border-primary/50 hover:text-text/90 bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          key={activeCategory}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6"
        >
          {filtered.map((piece) => (
            <motion.div
              key={piece.id}
              variants={fadeUp}
              className="group relative bg-surface rounded-2xl border border-primary/15 overflow-hidden cursor-pointer"
              style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
              whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(192,38,211,0.20)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative overflow-hidden aspect-[4/5]">
                <img
                  src={piece.imagen}
                  alt={piece.nombre}
                  width={500}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  style={{ transform: 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement;
                    if (p) p.style.background = 'linear-gradient(135deg, rgba(192,38,211,0.15) 0%, rgba(124,58,237,0.20) 100%)';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                {piece.edicionLimitada && (
                  <div className="absolute top-3 left-3">
                    <span
                      className="font-body text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full text-bg"
                      style={{ background: 'linear-gradient(135deg, #C026D3, #7C3AED)' }}
                    >
                      {piece.unidades ? `${piece.unidades} uds` : 'Limitada'}
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(192,38,211,0.08)' }}
                >
                  <span
                    className="font-body text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2 rounded-full border border-accent/60 text-accent backdrop-blur-sm"
                    style={{ background: 'rgba(10,10,15,0.6)' }}
                  >
                    Ver detalle
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/80 mb-1">{piece.artista}</p>
                <h3 className="font-heading font-bold text-text text-sm leading-snug tracking-[-0.01em] mb-3 line-clamp-2">
                  {piece.nombre}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-accent text-base">
                    S/ {piece.precio.toLocaleString('es-PE')}
                  </span>
                  <span className="font-body text-[10px] text-text/40 uppercase tracking-widest">{piece.categoria}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-text/50 text-sm mb-6">
            ¿No encuentras lo que buscas? Tenemos acceso a drops exclusivos y piezas en consignación.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('contact')}
            className="font-heading font-bold text-sm tracking-[0.08em] uppercase px-8 py-4 rounded-full border border-primary/40 text-text hover:border-primary hover:text-accent transition-all duration-300"
          >
            Consultar pieza específica
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default function AppMain() {
  const [currentSection, setCurrentSection] = useState<Section>('home');

  const handleNavigate = (section: string) => {
    setCurrentSection(section as Section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentSection]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background-color: #0A0A0F;
          color: #F5F0FF;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .font-heading { font-family: 'Syne', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(192,38,211,0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(192,38,211,0.7); }
        ::selection { background: rgba(192,38,211,0.35); color: #F5