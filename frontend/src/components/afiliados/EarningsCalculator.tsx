'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

// Comisiones — DEBEN coincidir con el backend (affiliates.service / config).
const LANDING = 20;
const WEB = 40;
const HOSTING_OPTIONS = [
  { id: 'prof-1', label: 'Hosting Profesional · 1 año', commission: 12 },
  { id: 'prof-2', label: 'Hosting Profesional · 2 años', commission: 22 },
  { id: 'prof-4', label: 'Hosting Profesional · 4 años', commission: 38 },
  { id: 'prem-1', label: 'Hosting Premium · 1 año', commission: 24 },
  { id: 'prem-2', label: 'Hosting Premium · 2 años', commission: 43 },
  { id: 'prem-4', label: 'Hosting Premium · 4 años', commission: 77 },
  { id: 'agen-1', label: 'Hosting Agencia · 1 año', commission: 48 },
  { id: 'agen-2', label: 'Hosting Agencia · 2 años', commission: 86 },
  { id: 'agen-4', label: 'Hosting Agencia · 4 años', commission: 154 },
];

const money = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

function Stepper({
  title,
  subtitle,
  value,
  setValue,
}: {
  title: string;
  subtitle: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Restar"
          onClick={() => setValue(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-lg font-bold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label="Sumar"
          onClick={() => setValue(Math.min(99, value + 1))}
          className="w-9 h-9 rounded-full bg-cta text-cta-foreground flex items-center justify-center hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function EarningsCalculator() {
  const [landing, setLanding] = useState(3);
  const [web, setWeb] = useState(1);
  const [hostingOpt, setHostingOpt] = useState('prem-1');
  const [hostingQty, setHostingQty] = useState(2);

  const hosting = HOSTING_OPTIONS.find((o) => o.id === hostingOpt) ?? HOSTING_OPTIONS[3];
  const perMonth = landing * LANDING + web * WEB + hostingQty * hosting.commission;
  const perYear = perMonth * 12;

  return (
    <div className="rounded-3xl border border-border bg-muted/30 p-5 sm:p-8 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Controles */}
        <div className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Imagina que cada mes logras vender…
          </p>
          <Stepper title="Planes Landing" subtitle={`S/ ${LANDING} de comisión c/u`} value={landing} setValue={setLanding} />
          <Stepper title="Webs institucionales" subtitle={`S/ ${WEB} de comisión c/u`} value={web} setValue={setWeb} />
          <div className="rounded-2xl border border-border bg-white px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Planes de Hosting</p>
                <p className="text-xs text-muted-foreground">Elige plan y plazo</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" aria-label="Restar" onClick={() => setHostingQty(Math.max(0, hostingQty - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-lg font-bold tabular-nums">{hostingQty}</span>
                <button type="button" aria-label="Sumar" onClick={() => setHostingQty(Math.min(99, hostingQty + 1))} className="w-9 h-9 rounded-full bg-cta text-cta-foreground flex items-center justify-center hover:opacity-90 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <select
              value={hostingOpt}
              onChange={(e) => setHostingOpt(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {HOSTING_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — S/ {o.commission} c/u
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex flex-col justify-center rounded-3xl bg-foreground text-white p-6 sm:p-8">
          <p className="text-sm font-medium text-white/70 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cta" /> Ganarías aproximadamente
          </p>
          <p className="mt-2 text-5xl font-black text-cta leading-none tabular-nums">{money(perMonth)}</p>
          <p className="text-white/70 mt-1">al mes</p>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm text-white/70">Si mantienes ese ritmo todo el año:</p>
            <p className="text-2xl font-bold text-white tabular-nums">{money(perYear)} <span className="text-sm font-normal text-white/60">al año</span></p>
          </div>

          <Link
            href="/registro"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cta text-cta-foreground font-bold px-6 py-3 hover:opacity-90 transition"
          >
            Quiero ganar esto — Crear mi cuenta <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-white/50 mt-3 text-center">
            Gratis. Sin invertir. Cobras por Yape o banco.
          </p>
        </div>
      </div>
    </div>
  );
}
