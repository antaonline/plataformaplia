import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Truck, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

const promoMessages = [
  { icon: Zap, text: 'NUEVA COLECCIÓN DROP 001 — DISPONIBLE AHORA' },
  { icon: Truck, text: 'ENVÍO GRATUITO EN PEDIDOS +150€' },
  { icon: Star, text: 'EDICIÓN LIMITADA — SOLO 50 UNIDADES' },
  { icon: Tag, text: 'DESCUENTO 20% CON CÓDIGO: PLIA20' },
  { icon: Zap, text: 'MATERIALES PREMIUM — HECHO A MANO EN BARCELONA' },
  { icon: Star, text: 'COLABORACIÓN EXCLUSIVA × URBAN ARCHIVE' },
  { icon: Truck, text: 'DEVOLUCIONES GRATUITAS 30 DÍAS' },
  { icon: Tag, text: 'MEMBERS ONLY — REGÍSTRATE Y ACCEDE ANTES' },
];

interface TickerItemProps {
  icon: React.ElementType;
  text: string;
}

function TickerItem({ icon: Icon, text }: TickerItemProps) {
  return (
    <span className="inline-flex items-center gap-3 px-8">
      <Icon
        size={12}
        className="text-accent flex-shrink-0"
        aria-hidden="true"
      />
      <span className="font-heading text-sm tracking-widest uppercase text-secondary whitespace-nowrap">
        {text}
      </span>
      <span className="text-accent/40 mx-2 select-none" aria-hidden="true">
        ✦
      </span>
    </span>
  );
}

interface PromoBannerProps {
  className?: string;
  variant?: 'default' | 'accent';
}

export default function PromoBanner({
  className,
  variant = 'default',
}: PromoBannerProps) {
  const repeated = [...promoMessages, ...promoMessages, ...promoMessages];

  const bgClass =
    variant === 'accent'
      ? 'bg-accent'
      : 'bg-primary border-b border-accent/20';

  const textColorClass = variant === 'accent' ? 'text-bg' : 'text-secondary';

  return (
    <div
      className={cn(
        'sticky top-0 z-50 overflow-hidden',
        bgClass,
        className
      )}
      role="marquee"
      aria-label="Mensajes promocionales"
    >
      {/* Gradient fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16"
        style={{
          background:
            variant === 'accent'
              ? 'linear-gradient(to right, #E8571A, transparent)'
              : 'linear-gradient(to right, #0A0A0A, transparent)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16"
        style={{
          background:
            variant === 'accent'
              ? 'linear-gradient(to left, #E8571A, transparent)'
              : 'linear-gradient(to left, #0A0A0A, transparent)',
        }}
        aria-hidden="true"
      />

      {/* Ticker track */}
      <div className="flex py-2.5 overflow-hidden">
        <motion.div
          className="flex flex-shrink-0"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{
            duration: 28,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          style={{ willChange: 'transform' }}
        >
          {repeated.map((msg, i) => (
            <TickerItem
              key={i}
              icon={msg.icon}
              text={msg.text}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom accent line */}
      {variant === 'default' && (
        <div
          className="absolute bottom-0 left-0 w-full h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, #E8571A40, #E8571A, #E8571A40, transparent)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}