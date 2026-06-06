"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, ChevronDown, FlaskConical } from 'lucide-react';

/**
 * Selector de plan SOLO para cuentas admin/dev. Permite cambiar el tier
 * Studio activo (Free / Starter / Pro / Studio Agency) para probar cómo se
 * comporta el editor y las herramientas con cada plan. El backend valida
 * que sea admin (POST /experimental/studio-plans/dev-set-plan).
 */

const PLANS = [
  { slug: 'studio-free', label: 'Free', desc: 'Freemium actual', color: 'text-zinc-300' },
  { slug: 'studio-starter', label: 'Starter', desc: 'S/59 · Flux + dominio', color: 'text-emerald-400' },
  { slug: 'studio-pro', label: 'Pro', desc: 'S/189 · 3D + video + canvas', color: 'text-violet-400' },
  { slug: 'studio-agency', label: 'Studio', desc: 'S/625 · todo ilimitado', color: 'text-amber-400' },
];

interface Props {
  apiBase: string;
  authToken: string;
  /** Slug del plan actual (de studioCaps.planSlug). */
  currentSlug?: string;
  /** Disparado tras cambiar de plan para que el padre recargue capabilities. */
  onChanged?: (slug: string) => void;
}

export const AdminPlanSwitcher: React.FC<Props> = ({
  apiBase,
  authToken,
  currentSlug,
  onChanged,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [active, setActive] = useState(currentSlug || 'studio-free');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentSlug) setActive(currentSlug);
  }, [currentSlug]);

  const select = async (slug: string) => {
    if (loading) return;
    setLoading(slug);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/experimental/studio-plans/dev-set-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setActive(slug);
        setOpen(false);
        onChanged?.(slug);
      } else {
        // Mostrar el motivo real (403 no-admin, 500 plan inexistente, etc).
        setError(
          data?.message ||
            data?.error ||
            `Error ${res.status}: no se pudo cambiar de plan`,
        );
      }
    } catch (e: any) {
      setError(e?.message || 'Error de red al cambiar de plan');
    } finally {
      setLoading(null);
    }
  };

  const current = PLANS.find((p) => p.slug === active) || PLANS[0];

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <FlaskConical className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
          Modo prueba · Plan
        </span>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
      >
        <span className={`text-sm font-bold ${current.color}`}>{current.label}</span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {PLANS.map((p) => (
            <button
              key={p.slug}
              onClick={() => select(p.slug)}
              disabled={!!loading}
              className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors text-left ${
                p.slug === active ? 'bg-white/[0.03]' : ''
              }`}
            >
              <div>
                <p className={`text-sm font-bold ${p.color}`}>{p.label}</p>
                <p className="text-[10px] text-white/40">{p.desc}</p>
              </div>
              {loading === p.slug ? (
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
              ) : p.slug === active ? (
                <Check className="w-4 h-4 text-cta" />
              ) : null}
            </button>
          ))}
        </motion.div>
      )}

      {error && (
        <p className="mt-2 text-[11px] text-red-400 leading-snug px-1">{error}</p>
      )}
    </div>
  );
};
