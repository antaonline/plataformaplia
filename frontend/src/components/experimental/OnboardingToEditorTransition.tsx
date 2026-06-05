"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Loader2 } from 'lucide-react';

/**
 * Transición cinematográfica entre el OnboardingChat (centrado) y el
 * editor del proyecto (chat-panel izquierdo + canvas derecho).
 *
 * En vez del cut-redirect plano que había antes, esta animación construye
 * el layout del editor PIEZA POR PIEZA dándole al cliente la sensación de
 * que el chat conversacional se "redimensiona" hacia el panel izquierdo
 * mientras el canvas aparece desde la derecha.
 *
 * Secuencia (~2200ms total):
 *  0    – 400ms : Fade-in del fondo dark + headline "Construyendo {nombre}"
 *  400  – 900ms : Slide-in del chat panel (izquierda) desde la izquierda
 *  500  – 1000ms: Slide-in del canvas placeholder (derecha) desde abajo-derecha
 *  900  – 1600ms: Stagger de las fases del agente (analizando / paleta / etc)
 *  1600 – 2200ms: Esperar y luego fade-out + onComplete → redirect.
 */

interface Props {
  open: boolean;
  /** Nombre del negocio para mostrar en el header (más humano que el prompt full). */
  businessName: string;
  /** Prompt original del cliente — se muestra como primer mensaje en el chat skeleton. */
  initialPrompt: string;
  /** Disparado tras ~2200ms para que el caller haga el router.push final. */
  onComplete: () => void;
}

const PHASES = [
  'Analizando el negocio y la audiencia',
  'Definiendo el sistema visual (paleta y tipografía)',
  'Diseñando la arquitectura de componentes',
  'Generando los archivos del proyecto',
];

export const OnboardingToEditorTransition: React.FC<Props> = ({
  open,
  businessName,
  initialPrompt,
  onComplete,
}) => {
  const [doneCount, setDoneCount] = useState(0);

  // Disparar el avance escalonado de las fases mientras la animación corre.
  useEffect(() => {
    if (!open) {
      setDoneCount(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    PHASES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setDoneCount(i + 1), 950 + i * 320),
      );
    });
    // Al final de toda la secuencia, notificar al padre que debe hacer
    // router.push. Le damos un breath extra (250ms) tras la última fase
    // para que el último check tenga tiempo de "respirar".
    timers.push(setTimeout(() => onComplete(), 950 + PHASES.length * 320 + 250));
    return () => timers.forEach((t) => clearTimeout(t));
  }, [open, onComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[150] bg-[#0d1117] overflow-hidden"
        >
          {/* Halo radial sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(191,255,0,0.08),transparent_55%),radial-gradient(ellipse_at_85%_50%,rgba(99,102,241,0.06),transparent_55%)]" />

          {/* Layout que SIMULA el editor: chat panel izquierdo + canvas derecho */}
          <div className="absolute inset-0 flex p-6 gap-6">
            {/* CHAT PANEL — slide-in desde la izquierda */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: 0.4,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[380px] shrink-0 flex flex-col"
            >
              {/* Header del chat skeleton */}
              <div className="flex items-center gap-2 mb-5 pl-2">
                <div className="w-8 h-8 rounded-xl bg-cta/15 border border-cta/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cta" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cta">
                    Plia Assistant
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {businessName || 'Tu proyecto'}
                  </p>
                </div>
              </div>

              {/* Burbuja del mensaje del cliente */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="self-end max-w-[85%] mb-5 px-4 py-3 rounded-2xl rounded-br-md bg-cta text-black text-sm font-medium leading-relaxed"
              >
                {initialPrompt.length > 160
                  ? initialPrompt.slice(0, 160) + '…'
                  : initialPrompt}
              </motion.div>

              {/* Card de "Orquestación en curso" — fases con checks animados */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.4 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="w-3.5 h-3.5 text-cta animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cta">
                    Orquestación en curso
                  </span>
                </div>
                <div className="space-y-3">
                  {PHASES.map((phase, i) => {
                    const isDone = i < doneCount;
                    const isActive = i === doneCount;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + i * 0.1, duration: 0.3 }}
                        className="flex items-start gap-2.5"
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isDone
                              ? 'bg-cta'
                              : isActive
                              ? 'bg-cta/30 border border-cta/50'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          {isDone && <Check className="w-2.5 h-2.5 text-black" />}
                          {isActive && (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                              className="w-1.5 h-1.5 rounded-full bg-cta"
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs leading-relaxed transition-colors ${
                            isDone
                              ? 'text-white/80 line-through decoration-white/30'
                              : isActive
                              ? 'text-white font-medium'
                              : 'text-white/40'
                          }`}
                        >
                          {phase}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Progress bar al pie */}
                <div className="mt-5 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(doneCount / PHASES.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="h-full bg-cta"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* CANVAS PLACEHOLDER — slide-in desde abajo-derecha */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex-1 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden"
            >
              {/* Skeleton lines tipo wireframe del web que se está construyendo */}
              <div className="absolute inset-0 p-10 flex flex-col gap-6">
                {/* Hero skeleton */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-4"
                >
                  <div className="h-10 w-2/3 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer-skeleton" />
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 w-32 rounded-full bg-cta/20 border border-cta/30" />
                    <div className="h-10 w-32 rounded-full bg-white/5 border border-white/10" />
                  </div>
                </motion.div>

                {/* Grid de 3 cards skeleton */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="grid grid-cols-3 gap-4 mt-6"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                      className="h-40 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5"
                    >
                      <div className="p-4 space-y-2">
                        <div className="h-6 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-full rounded bg-white/5" />
                        <div className="h-3 w-2/3 rounded bg-white/5" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Imagen wide skeleton */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.55, duration: 0.5 }}
                  className="h-48 mt-4 rounded-2xl bg-gradient-to-br from-cta/10 via-white/[0.03] to-indigo-500/10 border border-white/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer-skeleton" />
                </motion.div>
              </div>

              {/* Overlay con el headline central */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-[#0d1117]/85 backdrop-blur-xl border border-white/10 rounded-3xl px-8 py-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-cta/10 border border-cta/30 flex items-center justify-center mx-auto mb-3"
                  >
                    <Sparkles className="w-6 h-6 text-cta" />
                  </motion.div>
                  <h2 className="text-xl font-black text-white mb-1">
                    Construyendo {businessName || 'tu proyecto'}
                  </h2>
                  <p className="text-xs text-white/50 max-w-sm">
                    Estoy montando el estudio para vos. Esto toma unos segundos…
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <style jsx global>{`
            @keyframes shimmer-skeleton {
              from { background-position: 200% 0; }
              to { background-position: -200% 0; }
            }
            .animate-shimmer-skeleton {
              animation: shimmer-skeleton 2s linear infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
