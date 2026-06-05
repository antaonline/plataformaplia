"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  ChevronRight,
} from 'lucide-react';
import type { StudioCapabilities, OnboardingAnswers, VisualComplexity } from './OnboardingChat';

/**
 * Onboarding conversacional: NO es un wizard de steps. Es un chat real
 * donde la IA hace preguntas, el cliente responde, las preguntas y
 * respuestas son mensajes que se acumulan visualmente como en un chat
 * normal (Claudable / Lovable style).
 *
 * Flujo:
 *  1. La IA saluda y pregunta "¿Qué tipo de web querés?" con sugerencias clickeables
 *  2. El user clickea una sugerencia O escribe libremente
 *  3. La IA pregunta el nombre + descripción
 *  4. La IA pregunta el estilo (con opciones premium bloqueadas para Free)
 *  5. La IA pregunta si tiene fotos propias
 *  6. La IA confirma y dispara la generación con un prompt rico
 *
 * Después de disparar la generación, el MISMO chat sigue activo: ahora la
 * IA va publicando "Analizando negocio…", "Definiendo paleta…", "Generando
 * archivos…" como mensajes del assistant. El cliente no cambia de pantalla
 * hasta que la web está renderizada en el canvas a la derecha.
 */

type ChatMsg = {
  id: string;
  role: 'assistant' | 'user' | 'system';
  text: string;
  /** Sugerencias clickeables que acompañan a este mensaje del assistant. */
  suggestions?: { label: string; value: string; locked?: boolean; lockedReason?: string }[];
  /** Si el mensaje es de "progress" durante la generación. */
  isProgress?: boolean;
  /** Si el mensaje es la confirmación final (CTA grande). */
  isConfirm?: boolean;
};

type Phase =
  | 'greet'
  | 'project-type'
  | 'business-name'
  | 'description'
  | 'complexity'
  | 'assets'
  | 'confirm'
  | 'generating'
  | 'done';

interface Props {
  /** Capacidades del plan — para bloquear opciones premium. */
  capabilities: StudioCapabilities | null;
  /**
   * Prompt inicial del cliente (del cuadro central de la landing). Lo
   * usamos como descripción base — el flujo lo refina con preguntas.
   */
  initialPrompt: string;
  /**
   * Disparado cuando el cliente confirma. El caller crea el chat en el
   * backend y comienza a publicar progreso via `appendProgress`.
   */
  onConfirm: (answers: OnboardingAnswers) => Promise<void>;
  /** Disparado cuando el cliente cierra/cancela (ej. botón "atrás"). */
  onClose?: () => void;
}

interface ConversationalOnboardingHandle {
  appendProgress: (text: string, opts?: { done?: boolean }) => void;
  appendAssistant: (text: string) => void;
}

const PROJECT_SUGGESTIONS = [
  { label: 'Landing de servicio', value: 'landing' },
  { label: 'Tienda online', value: 'tienda' },
  { label: 'Restaurante o cafetería', value: 'restaurante' },
  { label: 'Portfolio personal', value: 'portfolio' },
  { label: 'Web corporativa', value: 'corporativa' },
  { label: 'Algo distinto', value: 'otro' },
];

const COMPLEXITY_SUGGESTIONS = (
  caps: StudioCapabilities | null,
): { label: string; value: VisualComplexity; locked?: boolean; lockedReason?: string }[] => {
  const isPaid = caps?.isPaid ?? false;
  const hasPro = caps?.tools?.tripo3d ?? false;
  return [
    { label: 'Simple y directo', value: 'simple' },
    { label: 'Moderno con animaciones', value: 'modern' },
    {
      label: 'Estilo Apple / Stripe',
      value: 'clean',
      locked: !isPaid,
      lockedReason: 'Disponible desde Starter',
    },
    {
      label: 'Premium 3D / Cinematográfico',
      value: 'premium',
      locked: !hasPro,
      lockedReason: 'Disponible desde Pro',
    },
  ];
};

export const ConversationalOnboarding = React.forwardRef<
  ConversationalOnboardingHandle,
  Props
>(({ capabilities, initialPrompt, onConfirm, onClose }, ref) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [phase, setPhase] = useState<Phase>('greet');
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    projectType: '',
    businessName: '',
    description: initialPrompt || '',
    complexity: 'modern',
    hasOwnAssets: false,
  });
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll al fondo cuando entran mensajes nuevos.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Auto-focus en el input cuando no estamos pensando.
  useEffect(() => {
    if (!isThinking && phase !== 'generating' && phase !== 'done') {
      inputRef.current?.focus();
    }
  }, [isThinking, phase]);

  // Helpers para encadenar mensajes con "pensando" entre medio.
  const pushUser = (text: string) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
  };

  const pushAssistantTyped = useCallback(
    async (text: string, suggestions?: ChatMsg['suggestions']) => {
      setIsThinking(true);
      // Pequeño delay simulado para que se sienta natural — entre 600-1100ms
      // según largo del texto. Como un humano pensando.
      const delay = Math.min(1100, 600 + text.length * 8);
      await new Promise((r) => setTimeout(r, delay));
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text,
          suggestions,
        },
      ]);
    },
    [],
  );

  // Exposición para el caller (progress messages durante la generación).
  React.useImperativeHandle(ref, () => ({
    appendProgress: (text: string, opts?: { done?: boolean }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          role: 'assistant',
          text,
          isProgress: true,
        },
      ]);
      if (opts?.done) setPhase('done');
    },
    appendAssistant: (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text },
      ]);
    },
  }));

  // ─── Saludo inicial ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'greet') return;
    (async () => {
      // Si vino un initialPrompt desde la landing, lo mostramos como el
      // primer mensaje del user (continuidad visual desde el textarea).
      if (initialPrompt && initialPrompt.trim()) {
        pushUser(initialPrompt);
      }
      const greeting = initialPrompt
        ? '¡Genial! Para armarte algo realmente bueno necesito conocer un poco más tu negocio. ¿Qué tipo de web te imaginas?'
        : '¡Hola! Soy tu asistente de PLIA. Vamos a armar tu web juntos. ¿Qué tipo de web te imaginás?';
      await pushAssistantTyped(greeting, PROJECT_SUGGESTIONS);
      setPhase('project-type');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handler unificado para respuestas ────────────────────────────────
  const handleAnswer = useCallback(
    async (value: string, displayText?: string) => {
      pushUser(displayText || value);

      switch (phase) {
        case 'project-type': {
          setAnswers((a) => ({ ...a, projectType: value }));
          await pushAssistantTyped(
            'Perfecto. ¿Cómo se llama tu negocio o marca?',
          );
          setPhase('business-name');
          break;
        }
        case 'business-name': {
          setAnswers((a) => ({ ...a, businessName: value }));
          await pushAssistantTyped(
            `Buen nombre. Contame algo más sobre ${value}: ¿qué hacés, qué te diferencia, dónde estás ubicado? Cuanto más específico, mejor diseño te puedo armar.`,
          );
          setPhase('description');
          break;
        }
        case 'description': {
          setAnswers((a) => ({
            ...a,
            description: a.description
              ? `${a.description}\n\n${value}`.trim()
              : value,
          }));
          await pushAssistantTyped(
            '¿Qué estilo visual te gusta más?',
            COMPLEXITY_SUGGESTIONS(capabilities),
          );
          setPhase('complexity');
          break;
        }
        case 'complexity': {
          setAnswers((a) => ({ ...a, complexity: value as VisualComplexity }));
          await pushAssistantTyped(
            '¿Tenés fotos propias del negocio (productos, local, equipo) que querés que use, o las genero todas con IA?',
            [
              { label: 'Tengo fotos propias, las subiré', value: 'own' },
              { label: 'Generá todo con IA', value: 'ai' },
            ],
          );
          setPhase('assets');
          break;
        }
        case 'assets': {
          const hasOwn = value === 'own';
          setAnswers((a) => ({ ...a, hasOwnAssets: hasOwn }));
          const summary = [
            `Listo, esto es lo que voy a construir:`,
            ``,
            `- ${labelForType((answers.projectType || value) as string)}`,
            `- ${answers.businessName}`,
            `- Estilo ${labelForComplexity(answers.complexity)}`,
            `- ${hasOwn ? 'Vas a subir tus fotos en el próximo paso' : 'Imágenes generadas con IA por mí'}`,
            ``,
            `¿Le doy?`,
          ].join('\n');
          await pushAssistantTyped(summary);
          setMessages((prev) => [
            ...prev,
            {
              id: `c-${Date.now()}`,
              role: 'assistant',
              text: '',
              isConfirm: true,
            },
          ]);
          setPhase('confirm');
          break;
        }
        default:
          break;
      }
    },
    [phase, capabilities, answers, pushAssistantTyped],
  );

  const handleSendInput = async () => {
    const value = input.trim();
    if (!value || isThinking) return;
    setInput('');
    await handleAnswer(value);
  };

  const handleSuggestion = (s: { value: string; label: string; locked?: boolean }) => {
    if (s.locked || isThinking) return;
    handleAnswer(s.value, s.label);
  };

  const handleConfirm = async () => {
    setPhase('generating');
    setMessages((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        role: 'assistant',
        text: '¡Vamos! Empiezo a construir tu sitio…',
        isProgress: true,
      },
    ]);
    await onConfirm(answers);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header del chat */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cta to-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cta">
              PLIA Assistant
            </p>
            <p className="text-sm font-bold text-white">
              {answers.businessName || 'Tu proyecto'}
            </p>
          </div>
        </div>
        {capabilities && (
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            {capabilities.planName}
          </span>
        )}
      </div>

      {/* Stream de mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Message key={m.id} msg={m} onSuggestion={handleSuggestion} onConfirm={handleConfirm} />
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 pl-1"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-cta"
                />
              ))}
            </div>
            <span className="text-xs text-white/40 italic">Pensando…</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      {phase !== 'generating' && phase !== 'done' && phase !== 'confirm' && (
        <div className="px-5 pb-5 pt-3 border-t border-white/5">
          <div className="relative bg-white/[0.04] border border-white/10 rounded-2xl focus-within:border-cta/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInput();
                }
              }}
              placeholder={placeholderForPhase(phase)}
              disabled={isThinking}
              rows={2}
              className="w-full bg-transparent px-4 py-3 pr-14 resize-none text-sm text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendInput}
              disabled={!input.trim() || isThinking}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-cta text-black flex items-center justify-center hover:bg-cta-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-2 text-center">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      )}
    </div>
  );
});

ConversationalOnboarding.displayName = 'ConversationalOnboarding';

// ─── Helpers ─────────────────────────────────────────────────────────────

function placeholderForPhase(phase: Phase): string {
  switch (phase) {
    case 'business-name':
      return 'Ej: Pastelería Dulce María';
    case 'description':
      return 'Ej: Pastelería artesanal en San Isidro, especializada en tortas de bodas y eventos…';
    default:
      return 'Escribí tu respuesta o elegí una opción arriba…';
  }
}

function labelForType(t: string): string {
  const map: Record<string, string> = {
    landing: 'Landing de servicio',
    tienda: 'Tienda online',
    restaurante: 'Restaurante o cafetería',
    portfolio: 'Portfolio personal',
    corporativa: 'Web corporativa',
    otro: 'Web custom',
  };
  return map[t] || 'Web';
}

function labelForComplexity(c: VisualComplexity): string {
  const map: Record<VisualComplexity, string> = {
    simple: 'simple y directo',
    modern: 'moderno con animaciones',
    clean: 'Apple/Stripe',
    premium: 'Premium 3D cinematográfico',
  };
  return map[c];
}

// ─── Subcomponente: una burbuja ─────────────────────────────────────────

const Message: React.FC<{
  msg: ChatMsg;
  onSuggestion: (s: any) => void;
  onConfirm: () => void;
}> = ({ msg, onSuggestion, onConfirm }) => {
  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-cta text-black text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {msg.text}
        </div>
      </motion.div>
    );
  }

  if (msg.isConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="pt-2"
      >
        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-cta to-emerald-400 text-black font-black uppercase tracking-wide text-sm hover:scale-[1.01] transition-transform shadow-[0_8px_24px_rgba(191,255,0,0.25)]"
        >
          <Sparkles className="w-4 h-4" />
          Sí, construilo
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3"
    >
      {/* Burbuja del assistant */}
      {msg.text && (
        <div
          className={`max-w-[88%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-wrap ${
            msg.isProgress
              ? 'bg-white/[0.03] border border-white/5 text-white/70 italic flex items-start gap-2'
              : 'bg-white/[0.06] text-white'
          }`}
        >
          {msg.isProgress && (
            <Check className="w-3.5 h-3.5 text-cta mt-0.5 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Sugerencias clickeables */}
      {msg.suggestions && msg.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-1">
          {msg.suggestions.map((s) => (
            <button
              key={s.value}
              onClick={() => onSuggestion(s)}
              disabled={s.locked}
              title={s.locked ? s.lockedReason : undefined}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                s.locked
                  ? 'border-white/10 bg-white/[0.02] text-white/30 cursor-not-allowed line-through'
                  : 'border-cta/30 bg-cta/10 text-cta hover:bg-cta/20 hover:border-cta/50 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {s.label}
              {s.locked && (
                <span className="ml-1.5 text-[9px] uppercase tracking-wider opacity-80">
                  · {s.lockedReason}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export type { ConversationalOnboardingHandle };
