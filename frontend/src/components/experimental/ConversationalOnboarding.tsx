"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Loader2, Check } from 'lucide-react';
import type { StudioCapabilities } from './OnboardingChat';

/**
 * Onboarding conversacional con IA REAL, centrado (estilo Lovable).
 *
 * No hay chips predefinidos ni wizard scripted. La IA del backend
 * (POST /experimental/iachat/onboarding-turn) decide cada pregunta con
 * criterio según lo que el cliente responde. Cuando la IA junta suficiente
 * contexto, devuelve done:true + richPrompt y el caller crea el chat.
 *
 * El componente es full-width centrado: el chat vive en una columna central,
 * sin paneles laterales. Pensado para superponerse a la landing con un
 * morph desde el textarea grande.
 */

type ChatMsg = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  isProgress?: boolean;
};

interface Props {
  capabilities: StudioCapabilities | null;
  /** Prompt inicial del cliente (del textarea de la landing). */
  initialPrompt: string;
  /** Base URL del API. */
  apiBase: string;
  /** JWT. */
  authToken: string;
  /**
   * Disparado cuando la IA decidió construir. Recibe el richPrompt ya
   * armado por el backend. El caller crea el chat y empieza a publicar
   * progreso via el ref.
   */
  onReadyToBuild: (richPrompt: string, businessName: string) => Promise<void>;
}

export interface ConversationalOnboardingHandle {
  appendProgress: (text: string, opts?: { done?: boolean }) => void;
  appendAssistant: (text: string) => void;
}

export const ConversationalOnboarding = React.forwardRef<
  ConversationalOnboardingHandle,
  Props
>(({ capabilities, initialPrompt, apiBase, authToken, onReadyToBuild }, ref) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [building, setBuilding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);
  // Historial crudo para el backend (sin los mensajes de progreso).
  const convoRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking && !building) inputRef.current?.focus();
  }, [isThinking, building]);

  React.useImperativeHandle(ref, () => ({
    appendProgress: (text: string, opts?: { done?: boolean }) => {
      setMessages((prev) => [
        ...prev,
        { id: `p-${Date.now()}-${Math.random()}`, role: 'assistant', text, isProgress: true },
      ]);
    },
    appendAssistant: (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}-${Math.random()}`, role: 'assistant', text },
      ]);
    },
  }));

  // ─── Llamada al backend para un turno ──────────────────────────────────
  const runTurn = useCallback(async () => {
    setIsThinking(true);
    try {
      const res = await fetch(`${apiBase}/experimental/iachat/onboarding-turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ messages: convoRef.current }),
      });
      const data = await res.json();
      setIsThinking(false);

      const reply = String(data.reply || '¿Me contás un poco más?');
      // Añadir la respuesta de la IA al stream + al historial crudo.
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: reply },
      ]);
      convoRef.current.push({ role: 'assistant', content: reply });

      if (data.done && data.richPrompt) {
        // La IA decidió construir. Pasamos a modo building y notificamos.
        setBuilding(true);
        const businessName = data.brief?.businessName || '';
        // Pequeño delay para que el cliente lea el mensaje de cierre.
        await new Promise((r) => setTimeout(r, 900));
        await onReadyToBuild(data.richPrompt, businessName);
      }
    } catch (e) {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Tuve un problemita de conexión. ¿Probamos de nuevo? Contame sobre tu negocio.',
        },
      ]);
    }
  }, [apiBase, authToken, onReadyToBuild]);

  // ─── Arranque: empujar el prompt inicial y pedir el 1er turno ──────────
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const seed = (initialPrompt || '').trim();
    if (seed) {
      setMessages([{ id: 'u-seed', role: 'user', text: seed }]);
      convoRef.current.push({ role: 'user', content: seed });
    } else {
      // Sin prompt inicial: la IA arranca con un saludo. Le mandamos un
      // mensaje de sistema implícito via un user "hola".
      convoRef.current.push({ role: 'user', content: 'Hola, quiero crear una web.' });
    }
    runTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Enviar respuesta del usuario ──────────────────────────────────────
  const handleSend = async () => {
    const value = input.trim();
    if (!value || isThinking || building) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: value }]);
    convoRef.current.push({ role: 'user', content: value });
    await runTurn();
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      {/* Columna central */}
      <div className="w-full max-w-2xl flex-1 flex flex-col min-h-0 px-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2.5 pt-6 pb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cta to-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-bold text-white">PLIA Assistant</span>
          {capabilities && (
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">
              · {capabilities.planName}
            </span>
          )}
        </div>

        {/* Stream de mensajes */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
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

        {/* Input estilo Lovable — grande, centrado */}
        {!building && (
          <div className="pb-6 pt-2">
            <div className="relative bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl focus-within:border-cta/40 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribí tu respuesta…"
                disabled={isThinking}
                rows={2}
                className="w-full bg-transparent px-5 py-4 pr-16 resize-none text-base text-white placeholder:text-white/25 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-cta text-black flex items-center justify-center hover:bg-cta-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Enviar"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {building && (
          <div className="pb-8 pt-2 flex items-center justify-center gap-2 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-cta" />
            Construyendo tu sitio…
          </div>
        )}
      </div>
    </div>
  );
});

ConversationalOnboarding.displayName = 'ConversationalOnboarding';

// ─── Burbuja ─────────────────────────────────────────────────────────────

const Bubble: React.FC<{ msg: ChatMsg }> = ({ msg }) => {
  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-cta text-black text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {msg.text}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start"
    >
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-wrap ${
          msg.isProgress
            ? 'bg-white/[0.03] border border-white/5 text-white/70 italic flex items-start gap-2'
            : 'bg-white/[0.07] text-white'
        }`}
      >
        {msg.isProgress && <Check className="w-3.5 h-3.5 text-cta mt-0.5 flex-shrink-0" />}
        <span>{msg.text}</span>
      </div>
    </motion.div>
  );
};
