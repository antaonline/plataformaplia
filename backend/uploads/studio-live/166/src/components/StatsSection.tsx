import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Car, Users, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const stats: Stat[] = [
  {
    id: 'years',
    value: 18,
    suffix: '+',
    label: 'Años de Experiencia',
    description: 'Liderando el mercado automotriz de lujo en Latinoamérica',
    icon: Award,
    color: 'text-secondary',
  },
  {
    id: 'cars',
    value: 1240,
    suffix: '+',
    label: 'Vehículos Vendidos',
    description: 'Cada entrega, una experiencia única e irrepetible',
    icon: Car,
    color: 'text-accent',
  },
  {
    id: 'clients',
    value: 980,
    suffix: '+',
    label: 'Clientes Satisfechos',
    description: 'Una comunidad exclusiva de apasionados del automovilismo',
    icon: Users,
    color: 'text-primary',
  },
  {
    id: 'brands',
    value: 24,
    suffix: '',
    label: 'Marcas Premium',
    description: 'Las firmas más codiciadas del mundo automotriz, en un solo lugar',
    icon: Star,
    color: 'text-secondary',
  },
];

function useCounter(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return count;
}

interface StatCardProps {
  stat: Stat;
  index: number;
  active: boolean;
}

function StatCard({ stat, index, active }: StatCardProps) {
  const count = useCounter(stat.value, 1800, active);
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative flex flex-col items-center text-center px-6 py-10 rounded-2xl bg-surface border border-white/[0.06] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(196,30,58,0.12)]"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Top accent line */}
      <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 transition-all duration-500 rounded-full', {
        'bg-secondary': stat.color === 'text-secondary',
        'bg-accent': stat.color === 'text-accent',
        'bg-primary': stat.color === 'text-primary',
      })} />

      {/* Icon */}
      <div className={cn(
        'relative z-10 mb-5 w-14 h-14 rounded-xl flex items-center justify-center',
        'bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.14] transition-colors duration-300'
      )}>
        <Icon
          className={cn('w-6 h-6 transition-transform duration-300 group-hover:scale-110', stat.color)}
          strokeWidth={1.5}
        />
      </div>

      {/* Counter */}
      <div className="relative z-10 mb-2 flex items-end justify-center gap-0.5">
        <span className={cn('font-heading text-7xl leading-none tracking-tight', stat.color)}>
          {count.toLocaleString('es-ES')}
        </span>
        <span className={cn('font-heading text-5xl leading-none mb-1', stat.color)}>
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <h3 className="relative z-10 font-heading text-xl uppercase tracking-widest text-text mb-3">
        {stat.label}
      </h3>

      {/* Divider */}
      <div className="relative z-10 w-8 h-[1px] bg-white/10 mb-3" />

      {/* Description */}
      <p className="relative z-10 font-body text-sm text-text/50 leading-relaxed max-w-[200px]">
        {stat.description}
      </p>
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative py-28 bg-bg overflow-hidden"
      aria-label="Estadísticas APEX Motors"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(196,30,58,0.04)_0%,transparent_70%)]" />
        {/* Horizontal rule top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {/* Horizontal rule bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(240,237,232,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-[1px] w-10 bg-primary" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              Nuestra Trayectoria
            </span>
            <div className="h-[1px] w-10 bg-primary" />
          </div>

          <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl uppercase tracking-tight text-text leading-none mb-5">
            Números que{' '}
            <span className="text-primary">Hablan</span>
          </h2>

          <p className="font-body text-base sm:text-lg text-text/50 max-w-xl mx-auto leading-relaxed">
            Casi dos décadas construyendo relaciones de confianza con los más exigentes
            entusiastas del automovilismo de alto rendimiento.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              active={isInView}
            />
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-sm text-text/30 uppercase tracking-[0.25em]">
            Certificados por{' '}
            <span className="text-secondary/70">FIA</span>
            {' '}·{' '}
            <span className="text-secondary/70">AMDA</span>
            {' '}·{' '}
            <span className="text-secondary/70">Luxury Auto Guild</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}