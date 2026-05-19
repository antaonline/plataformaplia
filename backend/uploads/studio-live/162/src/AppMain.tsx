import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollection from './components/FeaturedCollection';
import CultureSection from './components/CultureSection';
import ArtistsSection from './components/ArtistsSection';
import HowToBuy from './components/HowToBuy';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

type Page = 'home' | 'coleccion' | 'artistas' | 'como-comprar' | 'contacto';

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

function Testimonials() {
  const testimonials = [
    {
      name: 'Rodrigo Alvarado',
      role: 'Coleccionista — Lima',
      avatar: 'https://picsum.photos/seed/rodrigo/80/80',
      text: 'Encontré en Sofubi Miraflores piezas que llevaba años buscando. La asesoría es de otro nivel: saben exactamente qué artistas están sacando ediciones y te avisan antes que nadie. Mi Blobpus ya vale el doble.',
      stars: 5,
      piece: 'Skullbrain Chaos Edition',
    },
    {
      name: 'Valeria Quispe',
      role: 'Artista Visual — Barranco',
      avatar: 'https://picsum.photos/seed/valeria/80/80',
      text: 'Como artista, aprecio la autenticidad de cada pieza. No venden copias ni recastings — todo viene con certificado y documentación del artista original. Es la única tienda en Lima donde confío plenamente.',
      stars: 5,
      piece: 'Secret Base Neo Kaiju',
    },
    {
      name: 'Tomás Herrera',
      role: 'Diseñador — Miraflores',
      avatar: 'https://picsum.photos/seed/tomas/80/80',
      text: 'Compré mi primera figura sofubi aquí sin saber nada del tema. Me explicaron todo: historia, artistas, cómo cuidar las piezas. Ahora tengo 12 figuras y ninguna la compré en otro lugar.',
      stars: 5,
      piece: 'Marmit Tokusatsu Vintage',
    },
    {
      name: 'Camila Fujimoto',
      role: 'Coleccionista — San Isidro',
      avatar: 'https://picsum.photos/seed/camila/80/80',
      text: 'El packaging con el que llegan las piezas es increíble. Cada figura viene protegida y presentada como si fuera una obra de arte. El servicio postventa también es excelente — siempre disponibles.',
      stars: 5,
      piece: 'Medicom Chaos Godzilla',
    },
    {
      name: 'Felipe Salas',
      role: 'Arquitecto — Surco',
      avatar: 'https://picsum.photos/seed/felipe/80/80',
      text: 'Reservé una pieza desde Instagram antes de que llegara al stock. El proceso fue transparente y puntual. La figura llegó exactamente como la describieron: impecable, con todos los certificados y en edición de 30 unidades.',
      stars: 5,
      piece: 'RealxHead Mutant Vinyl',
    },
    {
      name: 'Andrea Nakamura',
      role: 'Curadora de Arte — Lima',
      avatar: 'https://picsum.photos/seed/andrea/80/80',
      text: 'Recomiendo Sofubi Miraflores a todos mis clientes que buscan objetos de arte con potencial de revalorización. Tienen criterio curatorial real — no cualquier figura, solo lo mejor del mercado japonés independiente.',
      stars: 5,
      piece: 'Gargamel Chaos Neon',
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section id="testimonios" className="relative bg-surface py-32 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #D4A017 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-secondary font-body text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Testimonios
          </span>
          <h2 className="font-heading text-5xl lg:text-7xl text-text tracking-wide uppercase leading-none mb-6">
            Lo Que Dicen
            <br />
            <span className="text-primary">Nuestros Coleccionistas</span>
          </h2>
          <p className="font-body text-text/60 text-lg max-w-xl mx-auto">
            Cada pieza tiene una historia. Estas son las de quienes ya forman parte de la comunidad Sofubi Miraflores.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <div className="mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="relative rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-secondary/30 transition-all duration-500 p-10 lg:p-14">
                <div className="absolute -top-4 left-10 flex gap-1">
                  {Array.from({ length: testimonials[active].stars }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-secondary fill-secondary" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="font-body text-text/85 text-xl lg:text-2xl leading-relaxed mb-8 mt-4">
                  &ldquo;{testimonials[active].text}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-secondary/40 flex-shrink-0">
                    <img
                      src={testimonials[active].avatar}
                      alt={testimonials[active].name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-body font-bold text-text text-base">{testimonials[active].name}</p>
                    <p className="font-body text-text/50 text-sm">{testimonials[active].role}</p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <span className="inline-block bg-primary/10 border border-primary/20 text-primary font-body text-xs font-semibold px-3 py-1.5 rounded-full">
                      {testimonials[active].piece}
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-8 opacity-10">
                  <svg className="w-20 h-20 text-secondary fill-secondary" viewBox="0 0 40 40">
                    <path d="M10 10 Q6 10 6 14 L6 22 Q6 26 10 26 L14 26 Q14 30 10 34 L14 34 Q20 30 20 22 L20 14 Q20 10 16 10 Z M26 10 Q22 10 22 14 L22 22 Q22 26 26 26 L30 26 Q30 30 26 34 L30 34 Q36 30 36 22 L36 14 Q36 10 32 10 Z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-3 mb-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver testimonio ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Mini cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActive(i)}
              className={`relative rounded-xl p-3 text-left transition-all duration-300 border ${
                i === active
                  ? 'bg-primary/15 border-primary/40'
                  : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-surface">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <p className="font-body text-xs font-semibold text-text truncate">{t.name.split(' ')[0]}</p>
              </div>
              <p className="font-body text-text/40 text-xs line-clamp-2 leading-snug">{t.text.slice(0, 60)}…</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AppMain() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    const validPages: Page[] = ['home', 'coleccion', 'artistas', 'como-comprar', 'contacto'];
    const sectionMap: Record<string, string> = {
      home: 'hero',
      coleccion: 'coleccion',
      artistas: 'artistas',
      'como-comprar': 'proceso',
      contacto: 'contacto',
      cultura: 'cultura',
      proceso: 'proceso',
    };

    if (validPages.includes(page as Page)) {
      setCurrentPage(page as Page);
    }

    const sectionId = sectionMap[page] || page;
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (page === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 80);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.section) {
        handleNavigate(detail.section);
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text font-body antialiased">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <AnimatePresence mode="wait">
        <motion.main
          key="main-content"
          {...pageTransition}
          className="relative"
        >
          {/* Hero */}
          <div id="hero">
            <Hero onNavigate={handleNavigate} />
          </div>

          {/* Featured Collection */}
          <div id="coleccion">
            <FeaturedCollection />
          </div>

          {/* Culture Section */}
          <div id="cultura">
            <CultureSection />
          </div>

          {/* Artists Section */}
          <div id="artistas">
            <ArtistsSection />
          </div>

          {/* How to Buy */}
          <div id="proceso">
            <HowToBuy />
          </div>

          {/* Testimonials */}
          <div id="testimonios">
            <Testimonials />
          </div>

          {/* Contact Section */}
          <div id="contacto">
            <ContactSection />
          </div>

          {/* Footer */}
          <Footer />
        </motion.main>
      </AnimatePresence>

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver al inicio"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary hover:bg-accent transition-colors duration-300 flex items-center justify-center shadow-[0_0_24px_rgba(196,30,58,0.5)] hover:shadow-[0_0_32px_rgba(255,58,92,0.6)]"
        >
          <svg
            className="w-5 h-5 text-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}