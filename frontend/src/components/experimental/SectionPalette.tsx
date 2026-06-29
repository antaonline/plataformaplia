"use client";

import React from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * Paleta para insertar secciones nuevas en la página. Cada preset es un snippet
 * JSX autocontenido que usa las clases del TEMA del sitio (bg-primary,
 * bg-background, text-foreground, bg-card…), así hereda colores/tipografía. El
 * backend lo inserta antes del <Footer/> de la página. Determinístico, sin IA.
 */

const PRESETS: { label: string; emoji: string; html: string }[] = [
  {
    label: 'Llamado a acción',
    emoji: '📣',
    html: `<section className="bg-primary text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4">¿Listo para empezar?</h2>
          <p className="text-lg opacity-90 mb-8">Súmate hoy y vive la experiencia completa.</p>
          <a href="#contacto" className="inline-block bg-white text-slate-900 font-bold px-8 py-4 rounded-full hover:opacity-90 transition">Contactar ahora</a>
        </div>
      </section>`,
  },
  {
    label: 'Características (3 columnas)',
    emoji: '🧩',
    html: `<section className="bg-background text-foreground py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Por qué elegirnos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-2">Calidad</h3>
              <p className="text-foreground/70">Materiales y procesos de primer nivel.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-2">Rapidez</h3>
              <p className="text-foreground/70">Entregas a tiempo, siempre.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-2">Soporte</h3>
              <p className="text-foreground/70">Te acompañamos cuando lo necesites.</p>
            </div>
          </div>
        </div>
      </section>`,
  },
  {
    label: 'Testimonio',
    emoji: '💬',
    html: `<section className="bg-secondary text-foreground py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-semibold italic leading-relaxed">"La mejor experiencia que tuvimos. Volveríamos sin dudarlo."</p>
          <p className="mt-6 font-bold">— Cliente feliz</p>
        </div>
      </section>`,
  },
  {
    label: 'Galería',
    emoji: '🖼️',
    html: `<section className="bg-background py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-foreground">Galería</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square bg-muted rounded-xl"></div>
            <div className="aspect-square bg-muted rounded-xl"></div>
            <div className="aspect-square bg-muted rounded-xl"></div>
            <div className="aspect-square bg-muted rounded-xl"></div>
            <div className="aspect-square bg-muted rounded-xl"></div>
            <div className="aspect-square bg-muted rounded-xl"></div>
          </div>
        </div>
      </section>`,
  },
  {
    label: 'Espaciador',
    emoji: '↕️',
    html: `<section className="py-16"></section>`,
  },
];

interface Props {
  onInsert: (html: string) => void;
  onClose: () => void;
  busy?: boolean;
}

export const SectionPalette: React.FC<Props> = ({ onInsert, onClose, busy }) => (
  <div className="absolute left-4 top-16 z-40 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
    <div className="px-3 py-2.5 bg-gradient-to-r from-violet-50 to-white border-b border-slate-100 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Agregar sección</span>
      <button onClick={onClose} title="Cerrar" className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <div className="p-2 flex flex-col gap-1">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          disabled={busy}
          onClick={() => onInsert(p.html)}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 hover:bg-violet-50 disabled:opacity-50"
        >
          <span className="text-base leading-none">{p.emoji}</span>
          <span>{p.label}</span>
          {busy && <Loader2 className="h-3 w-3 animate-spin ml-auto text-violet-500" />}
        </button>
      ))}
    </div>
    <p className="text-[10px] text-slate-400 px-3 pb-2 leading-snug">
      Se agrega al final, antes del footer. Después puedes moverla o editarla como cualquier sección.
    </p>
  </div>
);
