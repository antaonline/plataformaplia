import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Package, Users } from 'lucide-react';
import { fadeUp, fadeIn, staggerContainer, slideInLeft, slideInRight } from '../lib/utils';

const stats = [
  {
    icon: Calendar,
    value: '8+',
    label: 'Años curados',
    description: 'coleccionando lo mejor de Asia',
  },
  {
    icon: Package,
    value: '500+',
    label: 'Piezas únicas',
    description: 'en catálogo activo',
  },
  {
    icon: Users,
    value: '1,200+',
    label: 'Coleccionistas',
    description: 'en toda Latinoamérica',
  },
  {
    icon: MapPin,
    value: 'MFL',
    label: 'Miraflores',
    description: 'Lima, Perú — hub cultural',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-bg py-28 lg:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="block w-8 h-px bg-primary" />
          <span className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold">
            Nuestra Historia
          </span>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — editorial text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={slideInLeft}
              className="font-heading font-black text-5xl lg:text-6xl text-text leading-[0.95] tracking-[-0.03em] mb-8"
            >
              Nació de una{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                obsesión
              </span>{' '}
              que Lima nunca había visto.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-body text-text/70 text-lg leading-relaxed mb-6"
            >
              Todo comenzó en 2016 con una figura de Secret Base traída en maleta desde Tokio. 
              Lo que empezó como colección personal se convirtió en la primera tienda especializada 
              en sofubi de lujo del Perú: <span className="text-accent font-semibold">SOFUBI MFL</span>, 
              instalada en el corazón cultural de Miraflores.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-body text-text/60 text-base leading-relaxed mb-6"
            >
              El sofubi —vinilo japonés soplado a mano— no es un juguete. Es escultura de edición 
              limitada, es cultura underground, es el cruce entre el arte urbano tokiota y la 
              tradición artesanal asiática. Cada pieza que entra a nuestra tienda pasa por un 
              proceso de curación riguroso: autenticidad verificada, procedencia documentada, 
              artista reconocido.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-body text-text/60 text-base leading-relaxed mb-10"
            >
              Hoy somos el referente latinoamericano para coleccionistas serios. Trabajamos 
              directamente con casas como <span className="text-accent/80">Medicom Toy</span>, 
              <span className="text-accent/80"> Restore</span> y{' '}
              <span className="text-accent/80">Secret Base</span> para traer piezas que no 
              encuentras en ningún otro punto de venta en la región.
            </motion.p>

            {/* CTA inline */}
            <motion.div variants={fadeUp}>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 font-body font-semibold text-sm text-primary border border-primary/40 rounded-full px-6 py-3 hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                <MapPin className="w-4 h-4" />
                Visítanos en Miraflores
              </a>
            </motion.div>
          </motion.div>

          {/* Right — image + floating badge */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            {/* Glow blob */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-secondary/20 rounded-full blur-[60px] pointer-events-none" />

            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_60px_rgba(192,38,211,0.15)]">
              <img
                src="https://loremflickr.com/800/960/japan,toys,store,neon"
                alt="Tienda SOFUBI MFL en Miraflores, Lima"
                width={800}
                height={960}
                className="w-full h-[480px] lg:h-[560px] object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      'linear-gradient(135deg, #13131C 0%, #1e0a2e 50%, #0A0A0F 100%)';
                  }
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />

              {/* Address badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-surface/80 backdrop-blur-md border border-primary/20 rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text text-sm tracking-tight">
                      SOFUBI MFL — Tienda Física
                    </p>
                    <p className="font-body text-text/50 text-xs mt-0.5">
                      Miraflores, Lima, Perú · Lun–Sáb 11am–8pm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="absolute -top-6 -right-4 lg:-right-8 bg-surface border border-accent/20 rounded-xl px-5 py-4 shadow-[0_8px_32px_rgba(192,38,211,0.2)] backdrop-blur-sm"
            >
              <p className="font-heading font-black text-2xl text-accent tracking-tight">
                #1
              </p>
              <p className="font-body text-text/60 text-xs mt-0.5 max-w-[100px] leading-tight">
                Tienda sofubi en Latinoamérica
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="group bg-surface border border-primary/10 rounded-2xl p-6 hover:border-primary/30 hover:bg-surface/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(192,38,211,0.1)]"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading font-black text-4xl text-text tracking-tight leading-none mb-1">
                  {stat.value}
                </p>
                <p className="font-body font-semibold text-accent text-sm mb-1">
                  {stat.label}
                </p>
                <p className="font-body text-text/40 text-xs leading-snug">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom editorial quote */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20 border-t border-primary/10 pt-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <blockquote className="font-heading font-black text-2xl lg:text-3xl text-text/30 tracking-tight max-w-xl leading-tight">
            "Cada pieza es un fragmento de cultura viva. No vendemos juguetes —{' '}
            <span className="text-text/60">vendemos historia."</span>
          </blockquote>
          <div className="flex-shrink-0 text-right">
            <p className="font-heading font-bold text-text/50 text-sm tracking-widest uppercase">
              Fundador
            </p>
            <p className="font-body text-text/30 text-xs mt-1">
              SOFUBI MFL · Miraflores, 2016
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}