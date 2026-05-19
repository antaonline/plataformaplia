import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Wind, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CarCardProps {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  potencia: number;
  velocidad: number;
  aceleracion: number;
  imagen: string;
  categoria: string;
  destacado?: boolean;
  onVerDetalle?: (id: string) => void;
}

export default function CarCard({
  id,
  marca,
  modelo,
  año,
  precio,
  potencia,
  velocidad,
  aceleracion,
  imagen,
  categoria,
  destacado = false,
  onVerDetalle,
}: CarCardProps) {
  const categoriaColor: Record<string, string> = {
    Supercar: 'bg-primary/90 text-text',
    GT: 'bg-secondary/90 text-bg',
    Roadster: 'bg-accent/90 text-text',
  };

  const badgeClass = categoriaColor[categoria] ?? 'bg-primary/90 text-text';

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col bg-surface rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg hover:shadow-primary/20 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={() => onVerDetalle?.(id)}
    >
      {/* Imagen con overlay */}
      <div className="relative h-56 sm:h-60 overflow-hidden">
        <motion.img
          src={imagen}
          alt={`${marca} ${modelo} ${año}`}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) parent.style.background = '#111111';
          }}
        />

        {/* Overlay gradiente en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Overlay CTA en hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-2 bg-primary text-text font-heading text-lg tracking-widest uppercase px-6 py-3 rounded-full shadow-lg shadow-primary/40 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            Ver Detalles <ArrowRight size={18} />
          </span>
        </div>

        {/* Badge categoría */}
        <span
          className={cn(
            'absolute top-3 left-3 text-xs font-body font-semibold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm',
            badgeClass
          )}
        >
          {categoria}
        </span>

        {/* Badge destacado */}
        {destacado && (
          <span className="absolute top-3 right-3 bg-secondary text-bg text-xs font-body font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-secondary/30">
            Destacado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Marca / Modelo / Año */}
        <div>
          <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary mb-1">
            {marca} · {año}
          </p>
          <h3 className="font-heading text-3xl uppercase tracking-wide text-text leading-none">
            {modelo}
          </h3>
        </div>

        {/* Línea decorativa */}
        <div className="h-px w-12 bg-primary/60 rounded-full" />

        {/* Specs rápidos */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center bg-bg/60 rounded-xl py-3 px-2 border border-white/[0.05]">
            <Zap size={15} className="text-primary mb-1" />
            <span className="font-heading text-xl text-text leading-none">{potencia}</span>
            <span className="font-body text-[10px] text-text/50 uppercase tracking-wider mt-0.5">CV</span>
          </div>
          <div className="flex flex-col items-center bg-bg/60 rounded-xl py-3 px-2 border border-white/[0.05]">
            <Gauge size={15} className="text-secondary mb-1" />
            <span className="font-heading text-xl text-text leading-none">{aceleracion}s</span>
            <span className="font-body text-[10px] text-text/50 uppercase tracking-wider mt-0.5">0–100</span>
          </div>
          <div className="flex flex-col items-center bg-bg/60 rounded-xl py-3 px-2 border border-white/[0.05]">
            <Wind size={15} className="text-accent mb-1" />
            <span className="font-heading text-xl text-text leading-none">{velocidad}</span>
            <span className="font-body text-[10px] text-text/50 uppercase tracking-wider mt-0.5">km/h</span>
          </div>
        </div>

        {/* Precio + CTA */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-text/40 mb-0.5">Precio desde</p>
            <p className="font-heading text-2xl text-text leading-none">
              {precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalle?.(id);
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-accent text-text font-body text-sm font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-md shadow-primary/30 hover:shadow-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/60"
            aria-label={`Ver detalles de ${marca} ${modelo}`}
          >
            Detalle
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}