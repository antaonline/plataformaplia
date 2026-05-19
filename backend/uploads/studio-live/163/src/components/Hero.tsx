import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fadeUp, fadeIn, staggerContainer, slideInLeft, slideInRight } from '../lib/utils';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-bg">
      {/* Background gradient layers */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(192,38,211,0.18) 0%, rgba(124,58,237,0.10) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 20% 80%, rgba(124,58,237,0.12) 0%, transparent 60%)',
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(240,171,252,1) 1px, transparent 1px), linear-gradient(90deg, rgba(240,171,252,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/40 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Decorative ring */}
      <div
        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{
          border: '1px solid rgba(192,38,211,0.12)',
          boxShadow: '0 0 120px 40px rgba(192,38,211,0.06)',
        }}
      />
      <div
        className="absolute right-[-4%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          border: '1px solid rgba(240,171,252,0.08)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 xl:px-24 py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-screen lg:min-h-0 lg:py-32">

          {/* Left: Text content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6 lg:gap-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 w-fit">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-sm">
                <Sparkles size={13} className="text-accent" />
                <span className="text-accent text-xs font-body font-semibold tracking-widest uppercase">
                  Colección Exclusiva · Lima
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1
                className="font-heading font-black text-text leading-[0.92] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
              >
                El Vinilo
                <br />
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(90deg, #C026D3 0%, #F0ABFC 50%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  que Respira
                </span>
                <br />
                Arte
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="font-body text-text/60 text-lg lg:text-xl leading-relaxed max-w-[480px]"
            >
              Sofubi de autor directamente desde Japón hasta Miraflores. Figuras de vinilo blando
              de edición limitada para coleccionistas que entienden que el arte no tiene techo.
            </motion.p>

            {/* Stats strip */}
            <motion.div variants={fadeUp} className="flex items-center gap-8 py-2">
              {[
                { value: '+300', label: 'Piezas únicas' },
                { value: '15+', label: 'Artistas asiáticos' },
                { value: '8', label: 'Años curando' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="font-heading font-black text-2xl text-text tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #F0ABFC, #C026D3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </span>
                  <span className="font-body text-text/40 text-xs uppercase tracking-widest mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-body font-semibold text-bg text-base overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)',
                  boxShadow: '0 0 32px rgba(192,38,211,0.45)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 0 48px rgba(192,38,211,0.70)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 0 32px rgba(192,38,211,0.45)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <span>Explorar Colección</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-body font-semibold text-text/80 text-base border transition-all duration-300 hover:text-text hover:border-primary/50 hover:bg-primary/5"
                style={{ borderColor: 'rgba(240,171,252,0.20)' }}
              >
                <span>Nuestra Historia</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Hero image */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="show"
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Glow behind image */}
            <div
              className="absolute inset-0 m-auto w-[380px] h-[380px] lg:w-[500px] lg:h-[500px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(192,38,211,0.30) 0%, rgba(124,58,237,0.15) 50%, transparent 75%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Image frame */}
            <div
              className="relative w-full max-w-[480px] lg:max-w-[560px] aspect-[3/4] rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(192,38,211,0.20)',
                boxShadow:
                  '0 0 0 1px rgba(240,171,252,0.05), 0 32px 80px rgba(0,0,0,0.60), 0 0 60px rgba(192,38,211,0.15)',
              }}
            >
              <img
                src="https://loremflickr.com/560/747/sofubi,vinyl,toy,japanese,figure"
                alt="Figura sofubi de edición limitada — SOFUBI MFL"
                width={560}
                height={747}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(135deg, #13131C 0%, #1e0a2e 50%, #0A0A0F 100%)';
                  }
                }}
              />

              {/* Overlay gradient bottom */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 100%)',
                }}
              />

              {/* Floating badge on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl backdrop-blur-md"
                  style={{
                    background: 'rgba(19,19,28,0.80)',
                    border: '1px solid rgba(192,38,211,0.25)',
                  }}
                >
                  <div>
                    <p className="font-heading font-black text-text text-sm tracking-tight">
                      Secret Base × Restore
                    </p>
                    <p className="font-body text-text/50 text-xs mt-0.5">Edición Limitada 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-accent text-base">S/ 1,890</p>
                    <p className="font-body text-text/40 text-xs">1 de 50</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative label top-right */}
            <motion.div
              className="absolute top-4 right-0 lg:-right-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="px-3 py-2 rounded-lg backdrop-blur-sm"
                style={{
                  background: 'rgba(192,38,211,0.15)',
                  border: '1px solid rgba(192,38,211,0.30)',
                }}
              >
                <p className="font-heading font-black text-accent text-xs tracking-widest uppercase">
                  ソフビ
                </p>
                <p className="font-body text-text/50 text-[10px] text-center mt-0.5">Sofubi</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="font-body text-text/30 text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}