"use client";

import React from 'react';
import { X, Loader2, Check } from 'lucide-react';

/**
 * Panel de TEMA GLOBAL: edita los colores del sitio completo (tokens :root de
 * globals.css). Cambiar el "Primario" recolorea botones, secciones, etc. de
 * forma coherente porque todo el sitio usa esos tokens. Las paletas aplican
 * varios colores de un golpe. Presentacional: la página maneja red + estado.
 */

const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: 'primary', label: 'Primario', hint: 'marca · botones' },
  { key: 'secondary', label: 'Secundario' },
  { key: 'accent', label: 'Acento' },
  { key: 'background', label: 'Fondo' },
  { key: 'foreground', label: 'Texto' },
  { key: 'card', label: 'Tarjetas' },
];

export interface ThemePreset {
  name: string;
  colors: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'Cálido', colors: { primary: '#c0552e', secondary: '#2a211c', accent: '#d7a53a', background: '#faf8f3', foreground: '#2a211c', card: '#ffffff' } },
  { name: 'Océano', colors: { primary: '#0e7c86', secondary: '#073b4c', accent: '#06d6a0', background: '#f7fbfc', foreground: '#0b2027', card: '#ffffff' } },
  { name: 'Bosque', colors: { primary: '#2f7d4f', secondary: '#1e3a2b', accent: '#a7c957', background: '#f6faf6', foreground: '#16271c', card: '#ffffff' } },
  { name: 'Elegante', colors: { primary: '#111111', secondary: '#444444', accent: '#c9a227', background: '#ffffff', foreground: '#111111', card: '#f7f7f7' } },
  { name: 'Violeta', colors: { primary: '#6d28d9', secondary: '#1e1b4b', accent: '#06b6d4', background: '#fafaff', foreground: '#14121f', card: '#ffffff' } },
  { name: 'Rosa', colors: { primary: '#db2777', secondary: '#3b0764', accent: '#f59e0b', background: '#fff7fb', foreground: '#1f1020', card: '#ffffff' } },
];

interface Props {
  tokens: Record<string, string>;
  loading?: boolean;
  busy?: boolean;
  onChange: (key: string, hex: string) => void;
  onPreset: (colors: Record<string, string>) => void;
  onClose: () => void;
}

const norm = (hex?: string) => (hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000');

export const ThemePanel: React.FC<Props> = ({ tokens, loading, busy, onChange, onPreset, onClose }) => (
  <div className="absolute left-4 top-16 z-40 w-72 max-h-[78vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
    <div className="px-3 py-2.5 bg-gradient-to-r from-violet-50 to-white border-b border-slate-100 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
        Tema global · colores
      </span>
      <div className="flex items-center gap-1.5">
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />}
        <button onClick={onClose} title="Cerrar" className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-3">
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          {/* Paletas rápidas */}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Paletas</p>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.name}
                disabled={busy}
                onClick={() => onPreset(p.colors)}
                title={`Aplicar paleta "${p.name}"`}
                className="group flex flex-col items-center gap-1 p-1.5 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
              >
                <span className="flex h-5 w-full overflow-hidden rounded-md ring-1 ring-black/5">
                  <span className="flex-1" style={{ background: p.colors.primary }} />
                  <span className="flex-1" style={{ background: p.colors.secondary }} />
                  <span className="flex-1" style={{ background: p.colors.accent }} />
                </span>
                <span className="text-[10px] font-semibold text-slate-600">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Colores individuales */}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Colores</p>
          <div className="flex flex-col gap-1.5">
            {FIELDS.map((f) => {
              const val = norm(tokens[f.key]);
              return (
                <label key={f.key} className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <span className="relative h-7 w-7 shrink-0 rounded-lg ring-1 ring-black/10 overflow-hidden" style={{ background: val }}>
                    <input
                      type="color"
                      value={val}
                      disabled={busy}
                      onChange={(e) => onChange(f.key, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-slate-700 leading-tight">{f.label}</span>
                    {f.hint && <span className="block text-[10px] text-slate-400 leading-tight">{f.hint}</span>}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{val}</span>
                </label>
              );
            })}
          </div>

          <p className="flex items-start gap-1.5 text-[10px] text-slate-400 mt-3 leading-snug">
            <Check className="h-3 w-3 mt-px shrink-0 text-emerald-500" />
            El texto sobre los colores de marca se ajusta solo para que se siga leyendo.
          </p>
        </>
      )}
    </div>
  </div>
);
