import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, BookMarked, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Consulta',
    subtitle: 'Cuéntanos qué buscas',
    description:
      'Contáctanos por WhatsApp o Instagram con el nombre de la pieza, artista o estilo que deseas. Nuestro equipo te responde en menos de 2 horas con disponibilidad, edición y detalles de autenticidad.',
    detail: 'Asesoría personalizada sin costo',
    color: 'from-primary/20 to-primary/5',
    borderColor: 'border-primary/40',
    glowColor: 'shadow-primary/20',
    numberColor: 'text-primary',
  },
  {
    number: '02',
    icon: BookMarked,
    title: 'Reserva',
    subtitle: 'Asegura tu figura',
    description:
      'Una vez confirmada la disponibilidad, reservamos la pieza a tu nombre con un adelanto del 30%. Las figuras de edición limitada se van rápido — la reserva garantiza que sea tuya.',
    detail: 'Reserva válida por 72 horas',
    color: 'from-secondary/20 to-secondary/5',
    borderColor: 'border-secondary/40',
    glowColor: 'shadow-secondary/20',
    numberColor: 'text-secondary',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Pago',
    subtitle: 'Métodos flexibles',
    description:
      'Aceptamos transferencia bancaria, Yape, Plin, tarjeta de crédito/débito y efectivo en tienda. Para piezas de alto valor ofrecemos planes de pago en cuotas sin interés con tarjetas seleccionadas.',
    detail: 'Soles, dólares y tarjeta',
    color: 'from-accent/20 to-accent/5',
    borderColor: 'border-accent/40',
    glowColor: 'shadow-accent/20',
    numberColor: 'text-accent',
  },
  {
    number: '04',
    icon: MapPin,
    title: 'Entrega',
    subtitle: 'En Miraflores o delivery',
    description:
      'Recoge tu pieza en nuestra galería de Miraflores, Lima, con embalaje de coleccionista incluido. También hacemos envíos seguros a todo el Perú y coordinamos exportación internacional para coleccionistas.',
    detail: 'Miraflores · Envíos a todo el Perú',
    color: 'from-primary/15 to-secondary/10',
    borderColor: 'border-white/20',
    glowColor: 'shadow-white/10',
    numberColor: 'text-text',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const connectorVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.5, delay: 0.4, ease: 'easeOut' },
  },
};

export default function HowToBuy() {
  return (
    <section
      id="como-comprar"
      className="relative py-28 bg-bg overflow-hidden"
      aria-labelledby="howtobuy-heading"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, #C41E3A 40px, #C41E3A 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #C41E3A 40px, #C41E3A 41px)',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-block font-body text-xs font-semibold tracking-[0.3em] text-secondary uppercase mb-4 px-4 py-1.5 border border-secondary/30 rounded-full bg-secondary/5"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Proceso de Adquisición
          </motion.span>

          <h2
            id="howtobuy-heading"
            className="font-heading text-6xl md:text-7xl lg:text-8xl text-text tracking-wider uppercase leading-none mb-6"
          >
            Cómo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Adquirir
            </span>
            <br />
            Tu Pieza
          </h2>

          <p className="font-body text-text/60 text-lg max-w-xl mx-auto leading-relaxed">
            Un proceso diseñado para coleccionistas exigentes. Simple, transparente y con la
            atención que una pieza de lujo merece.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Connector line — desktop only */}
          <motion.div
            className="hidden lg:block absolute top-[3.75rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/30 via-secondary/50 to-primary/30 z-0"
            variants={connectorVariants}
            style={{ transformOrigin: 'left center' }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="relative z-10 group"
              >
                <motion.div
                  className={cn(
                    'relative h-full rounded-2xl border bg-white/5 backdrop-blur-sm p-8 flex flex-col gap-5 cursor-default',
                    'transition-all duration-500',
                    step.borderColor,
                    'hover:bg-white/8 hover:shadow-2xl',
                    `hover:${step.glowColor}`
                  )}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                      step.color
                    )}
                  />

                  {/* Step number + icon row */}
                  <div className="relative flex items-center justify-between">
                    <span
                      className={cn(
                        'font-heading text-5xl leading-none tracking-wider opacity-90',
                        step.numberColor
                      )}
                    >
                      {step.number}
                    </span>

                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300',
                        'bg-white/5 group-hover:bg-white/10',
                        step.borderColor
                      )}
                    >
                      <Icon
                        className={cn('w-5 h-5 transition-transform duration-300 group-hover:scale-110', step.numberColor)}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-col gap-2 flex-1">
                    <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-text/40">
                      {step.subtitle}
                    </p>
                    <h3 className="font-heading text-3xl tracking-wider text-text uppercase leading-none">
                      {step.title}
                    </h3>
                    <p className="font-body text-sm text-text/55 leading-relaxed mt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Detail badge */}
                  <div className="relative">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 font-body text-xs font-medium px-3 py-1.5 rounded-full border',
                        'bg-white/5',
                        step.borderColor,
                        step.numberColor
                      )}
                    >
                      <span
                        className={cn('w-1.5 h-1.5 rounded-full animate-pulse', {
                          'bg-primary': step.numberColor === 'text-primary',
                          'bg-secondary': step.numberColor === 'text-secondary',
                          'bg-accent': step.numberColor === 'text-accent',
                          'bg-text': step.numberColor === 'text-text',
                        })}
                      />
                      {step.detail}
                    </span>
                  </div>

                  {/* Arrow connector for mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-text/40 rotate-90" aria-hidden="true" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-left">
              <p className="font-heading text-xl tracking-wider text-text uppercase">
                ¿Listo para empezar?
              </p>
              <p className="font-body text-sm text-text/50 mt-0.5">
                Nuestro equipo está disponible de Lunes a Sábado, 11am – 8pm
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <motion.a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-accent text-text font-body font-semibold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-accent/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Contactar por WhatsApp"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                WhatsApp
              </motion.a>
              <motion.a
                href="#coleccion"
                className="inline-flex items-center gap-2 px-5 py-3 border border-secondary/40 text-secondary hover:bg-secondary/10 font-body font-semibold text-sm rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Ver colección disponible"
              >
                Ver Colección
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}