"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Rocket, Building2 } from 'lucide-react';

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
  currentPlan?: string;
}

const PLANS = [
  {
    code: 'PRESENCIA',
    name: 'Presencia',
    price: 'S/ 45',
    icon: Zap,
    highlight: true,
    perks: ['40 créditos/día · 250/mes', 'Dominio .com propio', 'Sin sello PLIA'],
  },
  {
    code: 'EMPRENDEDOR',
    name: 'Emprendedor',
    price: 'S/ 99',
    icon: Rocket,
    highlight: false,
    perks: ['100 créditos/día · 600/mes', 'IA Avanzada (Claude)', '3 webs profesionales'],
  },
  {
    code: 'AGENCIA',
    name: 'Agencia',
    price: 'S/ 169',
    icon: Building2,
    highlight: false,
    perks: ['250 créditos/día · 1500/mes', 'IA de máxima calidad', '15 webs · soporte 24/7'],
  },
];

export function UpsellModal({ open, onClose, reason, currentPlan }: UpsellModalProps) {
  const goToPlans = () => {
    window.location.href = '/tu-web-con-ia#planes';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative w-full max-w-3xl bg-[#0d1117] border border-white/10 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-cta/10 border border-cta/30 mb-4">
                <Crown className="h-7 w-7 text-cta" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Sube de plan para seguir creando
              </h2>
              <p className="text-sm text-white/60 max-w-md mx-auto">
                {reason ||
                  'Alcanzaste el límite de créditos de tu plan actual.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.code}
                    className={`rounded-2xl p-5 border flex flex-col ${
                      p.highlight
                        ? 'border-cta/40 bg-cta/5'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-cta" />
                      <span className="font-black text-white">{p.name}</span>
                    </div>
                    <div className="text-2xl font-black text-white mb-4">
                      {p.price}
                      <span className="text-xs text-white/40 font-medium">
                        {' '}
                        /mes
                      </span>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {p.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2 text-xs text-white/70"
                        >
                          <Check className="h-3.5 w-3.5 text-cta shrink-0 mt-0.5" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={goToPlans}
                className="bg-cta hover:bg-cta-hover text-black font-black rounded-full px-8 h-12 transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)]"
              >
                Ver planes y mejorar
              </button>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white text-sm font-bold px-6 h-12 transition-colors"
              >
                Quizás luego
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
