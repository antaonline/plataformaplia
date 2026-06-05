"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Store,
  Briefcase,
  UtensilsCrossed,
  Building2,
  Image as ImageIcon,
  Layout,
  Zap,
  Palette,
  Box,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Loader2,
} from 'lucide-react';

/**
 * Capacidades del plan del usuario (viene del backend GET /studio-plans/me).
 * Lo usamos para decidir qué opciones premium mostrar bloqueadas/abiertas.
 */
export interface StudioCapabilities {
  planSlug: string;
  planName: string;
  isPaid: boolean;
  tools: Record<string, boolean>;
  editor: {
    canEditCode: boolean;
    canUseAdvancedCanvas: boolean;
    canUseInlineEditing: boolean;
    canUse3DTemplates: boolean;
  };
  publishing: {
    hasWatermark: boolean;
  };
}

export type VisualComplexity = 'simple' | 'modern' | 'clean' | 'premium';

export interface OnboardingAnswers {
  projectType: string;
  businessName: string;
  description: string;
  complexity: VisualComplexity;
  hasOwnAssets: boolean;
}

interface Props {
  open: boolean;
  capabilities: StudioCapabilities | null;
  onComplete: (answers: OnboardingAnswers) => Promise<void> | void;
  onClose?: () => void;
  /**
   * Texto inicial que pre-rellena el campo "descripción". Sirve cuando el
   * onboarding se abre desde la landing y el cliente ya escribió algo en el
   * textarea inicial — no le hacemos repetirlo, lo refinamos.
   */
  initialDescription?: string;
}

const PROJECT_TYPES = [
  { id: 'landing', label: 'Landing de servicio', icon: Layout },
  { id: 'tienda', label: 'Tienda online', icon: Store },
  { id: 'restaurante', label: 'Restaurante / Cafetería', icon: UtensilsCrossed },
  { id: 'portfolio', label: 'Portfolio personal', icon: Briefcase },
  { id: 'corporativa', label: 'Web corporativa', icon: Building2 },
  { id: 'otro', label: 'Otro tipo', icon: Sparkles },
];

const COMPLEXITY_OPTIONS: {
  id: VisualComplexity;
  label: string;
  description: string;
  icon: React.ElementType;
  requiresPaid: boolean;
  requiresPro: boolean;
}[] = [
  {
    id: 'simple',
    label: 'Simple y directo',
    description: 'Web limpia, rápida, enfocada en convertir. Ideal para empezar.',
    icon: Zap,
    requiresPaid: false,
    requiresPro: false,
  },
  {
    id: 'modern',
    label: 'Moderno con animaciones',
    description: 'Microinteracciones, scroll suave, vibe profesional sin exagerar.',
    icon: Palette,
    requiresPaid: false,
    requiresPro: false,
  },
  {
    id: 'clean',
    label: 'Estilo Apple / Stripe',
    description: 'Tipografía cuidada, espacios amplios, animaciones sutiles muy pulidas.',
    icon: Sparkles,
    requiresPaid: true,
    requiresPro: false,
  },
  {
    id: 'premium',
    label: 'Premium 3D / Cinematográfico',
    description: 'Modelos 3D, video hero, scroll-triggered, nivel agencia top.',
    icon: Box,
    requiresPaid: true,
    requiresPro: true,
  },
];

type Step =
  | 'welcome'
  | 'project-type'
  | 'business'
  | 'complexity'
  | 'assets'
  | 'confirm';

export function OnboardingChat({
  open,
  capabilities,
  onComplete,
  onClose,
  initialDescription,
}: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    projectType: '',
    businessName: '',
    description: initialDescription || '',
    complexity: 'modern',
    hasOwnAssets: false,
  });

  // Si el dialog se abre con initialDescription, sincronizar el state.
  // Es util cuando abrimos el onboarding desde un nuevo prompt en la landing.
  useEffect(() => {
    if (open && initialDescription) {
      setAnswers((prev) => ({ ...prev, description: initialDescription }));
    }
  }, [open, initialDescription]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus en inputs cuando aparece el step.
  useEffect(() => {
    if (step === 'business' && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => {
    const order: Step[] = [
      'welcome',
      'project-type',
      'business',
      'complexity',
      'assets',
      'confirm',
    ];
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
  };

  const goBack = () => {
    const order: Step[] = [
      'welcome',
      'project-type',
      'business',
      'complexity',
      'assets',
      'confirm',
    ];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onComplete(answers);
    } catch {
      setIsSubmitting(false);
    }
  };

  // Verifica si una opción de complejidad está bloqueada por el plan actual.
  const isComplexityLocked = (
    opt: (typeof COMPLEXITY_OPTIONS)[number],
  ): boolean => {
    if (!capabilities) return false;
    if (opt.requiresPro) {
      // Premium requiere plan Pro o superior (tripo3d habilitado)
      return !capabilities.tools.tripo3d;
    }
    if (opt.requiresPaid) {
      return !capabilities.isPaid;
    }
    return false;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header con logo + plan */}
      <div className="px-7 pt-5 pb-3 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-cta" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">PLIA Studio</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">
              Crear nuevo proyecto
            </div>
          </div>
        </div>
        {capabilities && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-xs text-slate-500">Tu plan:</span>
            <span className="text-xs font-black text-slate-900">
              {capabilities.planName.replace('Plia Studio ', '')}
            </span>
          </div>
        )}
      </div>

      {/* Contenido — flexbox con max-width centrado */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1 — Welcome */}
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 14,
                    delay: 0.1,
                  }}
                  className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-cta mb-6 shadow-[0_0_40px_rgba(191,255,0,0.35)]"
                >
                  <Sparkles className="h-10 w-10 text-foreground" strokeWidth={2.2} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                  Hagamos tu web juntos
                </h1>
                <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
                  Te haré algunas preguntas rápidas para entender qué necesitas
                  y crear algo que de verdad funcione para tu negocio.
                </p>
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-7 h-12 rounded-2xl bg-cta hover:bg-cta-hover text-foreground font-black text-base transition-all hover:scale-105 active:scale-95"
                >
                  Empezar
                  <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Tipo de proyecto */}
            {step === 'project-type' && (
              <motion.div
                key="project-type"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  ¿Qué tipo de web quieres crear?
                </h2>
                <p className="text-slate-500 mb-7">
                  Elige la opción que más se acerca. Después podrás ajustar.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = answers.projectType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, projectType: t.id }))
                        }
                        className={`group flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-cta bg-cta/10 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-cta text-foreground'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <NavButtons
                  onBack={goBack}
                  onNext={goNext}
                  nextDisabled={!answers.projectType}
                />
              </motion.div>
            )}

            {/* STEP 3 — Nombre del negocio */}
            {step === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  Cuéntame de tu negocio
                </h2>
                <p className="text-slate-500 mb-7">
                  Estos datos me ayudan a generar textos relevantes y un diseño
                  que represente tu marca.
                </p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Nombre del negocio
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={answers.businessName}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          businessName: e.target.value,
                        }))
                      }
                      placeholder="Ej: Pastelería Dulce María"
                      maxLength={80}
                      className="w-full px-4 h-12 rounded-xl border-2 border-slate-200 bg-white focus:border-cta focus:ring-2 focus:ring-cta/20 outline-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Descríbelo en 1-2 oraciones
                    </label>
                    <textarea
                      value={answers.description}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Ej: Pastelería artesanal en San Isidro especializada en tortas personalizadas para eventos."
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-cta focus:ring-2 focus:ring-cta/20 outline-none text-sm resize-none"
                    />
                    <div className="text-right text-xs text-slate-400 mt-1">
                      {answers.description.length}/300
                    </div>
                  </div>
                </div>

                <NavButtons
                  onBack={goBack}
                  onNext={goNext}
                  nextDisabled={
                    !answers.businessName.trim() ||
                    answers.description.trim().length < 10
                  }
                />
              </motion.div>
            )}

            {/* STEP 4 — Complejidad visual */}
            {step === 'complexity' && (
              <motion.div
                key="complexity"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  ¿Cómo quieres que se vea?
                </h2>
                <p className="text-slate-500 mb-7">
                  Elige el nivel de detalle visual. A mayor complejidad, más
                  impacto pero también más tiempo de generación.
                </p>
                <div className="space-y-3">
                  {COMPLEXITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = answers.complexity === opt.id;
                    const locked = isComplexityLocked(opt);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (locked) return;
                          setAnswers((a) => ({ ...a, complexity: opt.id }));
                        }}
                        disabled={locked}
                        className={`relative w-full text-left flex items-start gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${
                          locked
                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'border-cta bg-cta/10 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected && !locked
                              ? 'bg-cta text-foreground'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-black text-slate-900">
                              {opt.label}
                            </span>
                            {locked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                                <Lock className="h-3 w-3" />
                                {opt.requiresPro ? 'Plan Pro' : 'Plan pagado'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {opt.description}
                          </p>
                        </div>
                        {isSelected && !locked && (
                          <Check className="h-5 w-5 text-foreground shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <NavButtons onBack={goBack} onNext={goNext} />
              </motion.div>
            )}

            {/* STEP 5 — Assets */}
            {step === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  ¿Tienes fotos o logo del negocio?
                </h2>
                <p className="text-slate-500 mb-7">
                  Si tienes assets propios los usaremos en la web. Si no, los
                  generamos con IA. Podrás cambiarlos después.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      setAnswers((a) => ({ ...a, hasOwnAssets: true }))
                    }
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${
                      answers.hasOwnAssets
                        ? 'border-cta bg-cta/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        answers.hasOwnAssets
                          ? 'bg-cta text-foreground'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900">
                        Sí, tengo fotos y/o logo
                      </div>
                      <p className="text-sm text-slate-500">
                        Subiré mis imágenes una vez creemos el proyecto
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setAnswers((a) => ({ ...a, hasOwnAssets: false }))
                    }
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${
                      !answers.hasOwnAssets
                        ? 'border-cta bg-cta/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        !answers.hasOwnAssets
                          ? 'bg-cta text-foreground'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900">
                        Generar todo con IA
                      </div>
                      <p className="text-sm text-slate-500">
                        Crearé imágenes profesionales que encajen con tu rubro
                      </p>
                    </div>
                  </button>
                </div>

                <NavButtons onBack={goBack} onNext={goNext} />
              </motion.div>
            )}

            {/* STEP 6 — Confirmación */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  ¿Empezamos?
                </h2>
                <p className="text-slate-500 mb-7">
                  Voy a crear la primera versión con lo que me contaste. Tomará
                  cerca de 90 segundos. Después podrás iterar todo lo que quieras.
                </p>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3 mb-7">
                  <Summary label="Tipo" value={
                    PROJECT_TYPES.find((t) => t.id === answers.projectType)?.label || '—'
                  } />
                  <Summary label="Negocio" value={answers.businessName} />
                  <Summary label="Estilo" value={
                    COMPLEXITY_OPTIONS.find((c) => c.id === answers.complexity)?.label || '—'
                  } />
                  <Summary
                    label="Imágenes"
                    value={
                      answers.hasOwnAssets
                        ? 'Tú subes tus fotos'
                        : 'IA las genera'
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="px-6 h-12 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-7 h-12 rounded-2xl bg-cta hover:bg-cta-hover text-foreground font-black text-base disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generando tu web...
                      </>
                    ) : (
                      <>
                        Generar mi web
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer con progress dots */}
      <div className="px-7 py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['welcome', 'project-type', 'business', 'complexity', 'assets', 'confirm'] as Step[]).map(
            (s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-cta'
                    : i < (['welcome', 'project-type', 'business', 'complexity', 'assets', 'confirm'] as Step[]).indexOf(step)
                      ? 'w-1.5 bg-cta'
                      : 'w-1.5 bg-slate-200'
                }`}
              />
            ),
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────────────

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 mt-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Atrás
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-1.5 px-6 h-11 rounded-xl bg-cta hover:bg-cta-hover text-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs uppercase tracking-widest font-bold text-slate-400 min-w-[80px] pt-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900 flex-1">
        {value}
      </span>
    </div>
  );
}
