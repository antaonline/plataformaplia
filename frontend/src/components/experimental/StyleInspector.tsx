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

/** Grosor de borde: además del ancho, prende/apaga el estilo (solid/none) para
 *  que el borde se vea sin tener que tocar otro control. */
const BorderWidthField: React.FC<{ styles: StyleMap; onApply: Props['onApply'] }> = ({ styles, onApply }) => (
  <label className="min-w-0 flex flex-col gap-0.5">
    <Cap>Grosor borde</Cap>
    <input
      type="number"
      min={0}
      value={numOf(styles.borderWidth)}
      onChange={(e) => {
        const n = parseInt(e.target.value || '0', 10) || 0;
        onApply(n > 0 ? { borderWidth: n + 'px', borderStyle: 'solid' } : { borderWidth: '0px', borderStyle: 'none' });
      }}
      className="w-full bg-slate-50 rounded-md px-2 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
    />
  </label>
);

/** Opacidad como 0–100 (CSS la usa 0–1). */
const OpacityField: React.FC<{ styles: StyleMap; onApply: Props['onApply'] }> = ({ styles, onApply }) => {
  const raw = parseFloat(styles.opacity ?? '1');
  const cur = Number.isFinite(raw) ? Math.round(raw * 100) : 100;
  return (
    <label className="min-w-0 flex flex-col gap-0.5">
      <Cap>Opacidad %</Cap>
      <input
        type="number"
        min={0}
        max={100}
        value={cur}
        onChange={(e) => {
          const n = Math.max(0, Math.min(100, parseInt(e.target.value || '100', 10)));
          onApply({ opacity: String(n / 100) });
        }}
        className="w-full bg-slate-50 rounded-md px-2 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
      />
    </label>
  );
};

const SHADOWS: { label: string; v: string }[] = [
  { label: 'Ninguna', v: 'none' },
  { label: 'Sutil', v: '0 1px 3px rgba(0,0,0,0.12)' },
  { label: 'Media', v: '0 4px 12px rgba(0,0,0,0.15)' },
  { label: 'Fuerte', v: '0 12px 32px rgba(0,0,0,0.22)' },
];
/** Sombra por presets (el computado no matchea exacto → aplica al elegir). */
const ShadowField: React.FC<{ styles: StyleMap; onApply: Props['onApply'] }> = ({ styles, onApply }) => {
  const matched = SHADOWS.find((sh) => sh.v === (styles.boxShadow || 'none'));
  return (
    <label className="min-w-0 flex flex-col gap-0.5">
      <Cap>Sombra</Cap>
      <select
        value={matched ? matched.v : '__c'}
        onChange={(e) => e.target.value !== '__c' && onApply({ boxShadow: e.target.value })}
        className="w-full bg-slate-50 rounded-md px-1.5 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
      >
        {!matched && <option value="__c">—</option>}
        {SHADOWS.map((sh) => (
          <option key={sh.label} value={sh.v}>{sh.label}</option>
        ))}
      </select>
    </label>
  );
};

const SEG_ALIGN = [
  { v: 'flex-start', label: 'Ini' },
  { v: 'center', label: 'Cen' },
  { v: 'flex-end', label: 'Fin' },
  { v: 'stretch', label: 'Est' },
];
const SEG_JUSTIFY = [
  { v: 'flex-start', label: 'Ini' },
  { v: 'center', label: 'Cen' },
  { v: 'flex-end', label: 'Fin' },
  { v: 'space-between', label: '↔' },
];
const SegRow: React.FC<{
  label: string;
  value?: string;
  options: { v: string; label: string }[];
  onPick: (v: string) => void;
}> = ({ label, value, options, onPick }) => (
  <div className="flex flex-col gap-0.5">
    <Cap>{label}</Cap>
    <div className="flex gap-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onPick(o.v)}
          className={`flex-1 h-7 rounded-md border text-[10px] font-bold ${
            value === o.v
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export const StyleInspector: React.FC<Props> = ({ el, onApply }) => {
  const s = el.styles || {};
  const showPadding = !el.isImage;
  const showType = !!el.text;
  const isFlex = (s.display || '').indexOf('flex') >= 0;
  const layoutMode = isFlex ? (s.flexDirection === 'column' ? 'col' : 'row') : 'block';
  return (
    <div className="space-y-3 pt-1">
      <Section title="Tamaño">
        <div className="grid grid-cols-2 gap-1.5">
          <NumField label="Ancho" prop="width" styles={s} onApply={onApply} />
          <NumField label="Alto" prop="height" styles={s} onApply={onApply} />
        </div>
      </Section>

      {el.isContainer && (
        <Section title="Disposición (auto-layout)">
          <label className="flex flex-col gap-0.5">
            <Cap>Modo</Cap>
            <select
              value={layoutMode}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'block') onApply({ display: 'block', flexDirection: '' });
                else onApply({ display: 'flex', flexDirection: v === 'col' ? 'column' : 'row' });
              }}
              className="w-full bg-slate-50 rounded-md px-1.5 py-1 text-xs text-slate-700 border border-slate-200 focus:border-violet-400 outline-none"
            >
              <option value="block">Bloque (normal)</option>
              <option value="row">Flex — fila →</option>
              <option value="col">Flex — columna ↓</option>
            </select>
          </label>
          {isFlex && (
            <>
              <NumField label="Separación (gap)" prop="gap" styles={s} onApply={onApply} />
              <SegRow label="Alinear" value={s.alignItems} options={SEG_ALIGN} onPick={(v) => onApply({ alignItems: v })} />
              <SegRow label="Justificar" value={s.justifyContent} options={SEG_JUSTIFY} onPick={(v) => onApply({ justifyContent: v })} />
            </>
          )}
        </Section>
      )}

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
          <div className="grid grid-cols-2 gap-1.5">
            <NumField label="Interlineado" prop="lineHeight" styles={s} onApply={onApply} />
            <NumField label="Espaciado" prop="letterSpacing" styles={s} onApply={onApply} />
          </div>
        </Section>
      )}

      <Section title="Borde">
        <div className="grid grid-cols-2 gap-1.5">
          <BorderWidthField styles={s} onApply={onApply} />
          <ColorField label="Color borde" prop="borderColor" styles={s} onApply={onApply} />
        </div>
      </Section>

      <Section title="Apariencia">
        <div className="grid grid-cols-2 gap-1.5">
          <ColorField label="Fondo" prop="backgroundColor" styles={s} onApply={onApply} />
          <NumField label="Redondez" prop="borderRadius" styles={s} onApply={onApply} />
        </div>
        <div className="grid grid-cols-2 gap-1.5 items-end">
          <OpacityField styles={s} onApply={onApply} />
          <ShadowField styles={s} onApply={onApply} />
        </div>
      </Section>
    </div>
  );
};
