"use client";

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

/**
 * Inspector lateral de propiedades (estilo Framer/Figma): inputs numéricos
 * para tamaño, padding, margen, tipografía y apariencia del elemento
 * seleccionado en el lienzo. Cada cambio se aplica EN VIVO (el padre reenvía
 * `PLIA_SET_STYLE` al iframe) y se persiste por proyecto + ruta DOM.
 *
 * Recibe los estilos COMPUTADOS actuales (strings como "16px", "rgb(...)") y
 * emite cambios en claves camelCase de CSS (paddingTop, fontSize, …).
 */

type StyleMap = Record<string, string>;

interface SelectedEl {
  isImage?: boolean;
  isContainer?: boolean;
  text?: string;
  styles?: StyleMap;
}

interface Props {
  el: SelectedEl;
  onApply: (style: Record<string, string>) => void;
}

/** "16px" → "16"; valores no numéricos ("normal", "auto") → "". */
const numOf = (v?: string): string => {
  if (!v) return '';
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(Math.round(n)) : '';
};

/** "rgb(r,g,b)" / "rgba(...)" → "#rrggbb" para el input de color. */
const toHex = (v?: string): string => {
  if (!v) return '#000000';
  if (v[0] === '#') return v;
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (!m) return '#000000';
  const parts = m[1].split(',').map((x) => parseInt(x, 10));
  const h = (n: number) => Math.max(0, Math.min(255, n || 0)).toString(16).padStart(2, '0');
  return `#${h(parts[0])}${h(parts[1])}${h(parts[2])}`;
};

const Cap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{children}</span>
);

const NumField: React.FC<{
  label: string;
  prop: string;
  styles: StyleMap;
  onApply: Props['onApply'];
  unit?: string;
}> = ({ label, prop, styles, onApply, unit = 'px' }) => (
  <label className="min-w-0 flex flex-col gap-0.5">
    <Cap>{label}</Cap>
    <input
      type="number"
      value={numOf(styles[prop])}
      onChange={(e) => onApply({ [prop]: e.target.value === '' ? '' : e.target.value + unit })}
      className="w-full bg-slate-50 rounded-md px-2 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
    />
  </label>
);

const ColorField: React.FC<{
  label: string;
  prop: string;
  styles: StyleMap;
  onApply: Props['onApply'];
}> = ({ label, prop, styles, onApply }) => (
  <label className="min-w-0 flex flex-col gap-0.5">
    <Cap>{label}</Cap>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={toHex(styles[prop])}
        onChange={(e) => onApply({ [prop]: e.target.value })}
        className="h-7 w-8 shrink-0 rounded-md border border-slate-200 cursor-pointer bg-transparent p-0.5"
      />
      <span className="text-[10px] text-slate-400 truncate">{toHex(styles[prop])}</span>
    </div>
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <Cap>{title}</Cap>
    {children}
  </div>
);

const ALIGNS: { v: string; Icon: React.ElementType }[] = [
  { v: 'left', Icon: AlignLeft },
  { v: 'center', Icon: AlignCenter },
  { v: 'right', Icon: AlignRight },
  { v: 'justify', Icon: AlignJustify },
];

export const StyleInspector: React.FC<Props> = ({ el, onApply }) => {
  const s = el.styles || {};
  const showPadding = !el.isImage;
  const showType = !!el.text;
  return (
    <div className="space-y-3 pt-1">
      <Section title="Tamaño">
        <div className="grid grid-cols-2 gap-1.5">
          <NumField label="Ancho" prop="width" styles={s} onApply={onApply} />
          <NumField label="Alto" prop="height" styles={s} onApply={onApply} />
        </div>
      </Section>

      {showPadding && (
        <Section title="Padding">
          <div className="grid grid-cols-4 gap-1.5">
            <NumField label="Arr" prop="paddingTop" styles={s} onApply={onApply} />
            <NumField label="Der" prop="paddingRight" styles={s} onApply={onApply} />
            <NumField label="Aba" prop="paddingBottom" styles={s} onApply={onApply} />
            <NumField label="Izq" prop="paddingLeft" styles={s} onApply={onApply} />
          </div>
        </Section>
      )}

      <Section title="Margen">
        <div className="grid grid-cols-4 gap-1.5">
          <NumField label="Arr" prop="marginTop" styles={s} onApply={onApply} />
          <NumField label="Der" prop="marginRight" styles={s} onApply={onApply} />
          <NumField label="Aba" prop="marginBottom" styles={s} onApply={onApply} />
          <NumField label="Izq" prop="marginLeft" styles={s} onApply={onApply} />
        </div>
      </Section>

      {showType && (
        <Section title="Tipografía">
          <div className="grid grid-cols-2 gap-1.5">
            <NumField label="Tamaño" prop="fontSize" styles={s} onApply={onApply} />
            <label className="min-w-0 flex flex-col gap-0.5">
              <Cap>Grosor</Cap>
              <select
                value={String(parseInt(s.fontWeight || '400', 10) || 400)}
                onChange={(e) => onApply({ fontWeight: e.target.value })}
                className="w-full bg-slate-50 rounded-md px-1.5 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
              >
                {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5 items-end">
            <div className="flex flex-col gap-0.5">
              <Cap>Alinear</Cap>
              <div className="flex gap-0.5">
                {ALIGNS.map(({ v, Icon }) => (
                  <button
                    key={v}
                    onClick={() => onApply({ textAlign: v })}
                    className={`flex-1 grid place-items-center h-7 rounded-md border ${
                      (s.textAlign || 'left') === v
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <ColorField label="Color" prop="color" styles={s} onApply={onApply} />
          </div>
        </Section>
      )}

      <Section title="Apariencia">
        <div className="grid grid-cols-2 gap-1.5">
          <ColorField label="Fondo" prop="backgroundColor" styles={s} onApply={onApply} />
          <NumField label="Redondez" prop="borderRadius" styles={s} onApply={onApply} />
        </div>
      </Section>
    </div>
  );
};
