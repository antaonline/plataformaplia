'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * Embudo de calificacion para anuncios de Facebook (plan WEB EXPRESS S/100).
 *
 * - Una pregunta a la vez, sin opcion de retroceder (no se pueden cambiar
 *   respuestas: refuerza el compromiso).
 * - El boton "Continuar" vive abajo y ocupa todo el ancho en mobile.
 * - Algunas respuestas descalifican y llevan a una pantalla final suave que
 *   invita a ver otros servicios.
 * - El cliente apto pasa al checkout del plan express con el nombre de su
 *   negocio, que luego se autocompleta en el brief del dashboard.
 *
 * Esta pagina vive FUERA del grupo (public) a proposito: el root layout no
 * renderiza Header/Footer, asi que el embudo queda sin distracciones. El
 * Meta Pixel del root layout sigue disparando para medir conversiones.
 */

type Option = {
  label: string;
  value: string;
  /** Si es true, esta respuesta lleva a la pantalla de "no apto". */
  disqualify?: boolean;
  emoji?: string;
};

type Step = {
  id: string;
  kind: 'single' | 'text' | 'contact';
  /** {business} se reemplaza por el nombre del negocio capturado. */
  question: string;
  subtitle?: string;
  options?: Option[];
  placeholder?: string;
  cta?: string;
};

const STEPS: Step[] = [
  {
    id: 'intro',
    kind: 'single',
    question: '¿Sabías que puedes tener tu página web lista hoy mismo, 100% online y sin reuniones?',
    subtitle: 'Cuéntanos sobre ti y comenzamos hoy mismo.',
    options: [
      { label: 'Sí, lo sabía', value: 'si' },
      { label: 'No, no lo sabía', value: 'no' },
    ],
  },
  {
    id: 'contact',
    kind: 'contact',
    question: '¡Genial! ¿Cómo te llamas?',
    subtitle: 'Ingresa tus datos para reservar tu web.',
    cta: 'Continuar',
  },
  {
    id: 'type',
    kind: 'single',
    question: '¿Qué tipo de web necesitas, {name}?',
    options: [
      { label: 'Para mi negocio', value: 'negocio' },
      { label: 'Marca personal', value: 'personal' },
      { label: 'Tienda online', value: 'tienda' },
      { label: 'Servicios profesionales', value: 'servicios' },
      { label: 'Otro', value: 'otro' },
    ],
  },
  {
    id: 'urgency',
    kind: 'single',
    question: '¿Para cuándo la necesitas, {name}?',
    options: [
      { label: 'La necesito hoy', value: 'hoy', emoji: '🚀' },
      { label: 'Esta semana', value: 'semana' },
      { label: 'Lo antes posible', value: 'pronto' },
      { label: 'Todavía estoy evaluando', value: 'evaluando', disqualify: true },
    ],
  },
];

const TOTAL = STEPS.length;

function fill(text: string, firstName: string): string {
  const name = firstName.trim() || 'tú';
  return text.replace(/\{name\}/g, name);
}

export default function TuWebHoyPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'apto' | 'noapto'>('quiz');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Origen de la visita (para saber quién llegó por el anuncio de Facebook).
  const source = useRef<Record<string, string | undefined>>({});
  const sentRef = useRef(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      source.current = {
        utmSource: p.get('utm_source') || undefined,
        utmMedium: p.get('utm_medium') || undefined,
        utmCampaign: p.get('utm_campaign') || undefined,
        fbclid: p.get('fbclid') || undefined,
        referrer: document.referrer || undefined,
        landingPath: window.location.pathname + window.location.search,
      };
    } catch {}
  }, []);

  const step = STEPS[index];
  // Primer nombre del cliente para personalizar las preguntas
  const firstName = contactName.trim().split(/\s+/)[0] || '';

  const progress = useMemo(
    () => Math.round(((index + (phase === 'quiz' ? 0 : 1)) / TOTAL) * 100),
    [index, phase],
  );

  const canContinue =
    step?.kind === 'text'
      ? businessName.trim().length >= 2
      : step?.kind === 'contact'
        ? contactName.trim().length >= 2 && whatsapp.replace(/\D/g, '').length === 9
        : selected !== null;

  const handleSelect = (opt: Option) => {
    setSelected(opt.value);
  };

  // Envía el lead al backend UNA sola vez, con la foto de respuestas del
  // momento de decisión. Fire-and-forget (keepalive): nunca bloquea la UX,
  // y sobrevive aunque la persona navegue al checkout enseguida.
  const submitLead = (
    outcome: 'APTO' | 'NOAPTO',
    disqualifier: string | undefined,
    answersSnapshot: Record<string, string>,
  ) => {
    if (sentRef.current) return;
    sentRef.current = true;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002').replace(/\/$/, '');
    const payload = {
      businessName: businessName.trim() || undefined,
      contactName: contactName.trim() || undefined,
      whatsapp: whatsapp ? `+51 ${whatsapp}` : undefined,
      email: email.trim() || undefined,
      outcome,
      disqualifier,
      answers: answersSnapshot,
      ...source.current,
    };
    try {
      fetch(`${apiBase}/api/funnel-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const advance = () => {
    if (!step) return;

    // Registrar respuesta (el paso de contacto no va al mapa de answers).
    const value =
      step.kind === 'text'
        ? businessName.trim()
        : step.kind === 'contact'
          ? ''
          : (selected ?? '');
    const nextAnswers =
      step.kind === 'contact' ? { ...answers } : { ...answers, [step.id]: value };
    setAnswers(nextAnswers);

    // ¿La opción elegida descalifica? → no apto (se registra el lead igual).
    if (step.kind === 'single') {
      const chosen = step.options?.find((o) => o.value === selected);
      if (chosen?.disqualify) {
        setPhase('noapto');
        submitLead('NOAPTO', step.id, nextAnswers);
        return;
      }
    }

    // ¿Última pregunta? → apto (se registra el lead).
    if (index >= TOTAL - 1) {
      setPhase('apto');
      submitLead('APTO', undefined, nextAnswers);
      return;
    }

    // Siguiente pregunta.
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const goToCheckout = () => {
    const params = new URLSearchParams({ plan: 'express' });
    // Pasamos el primer nombre para personalizar el checkout.
    if (firstName) params.set('name', firstName);
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Barra superior: logo + progreso */}
      <header className="w-full px-5 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Image
            src="/plia-logo-white.svg"
            alt="PLIA"
            width={110}
            height={30}
            priority
            className="h-7 w-auto"
          />
          <span className="text-xs font-semibold text-white/50 tracking-wide flex items-center gap-1.5">
            SOLO PARA PERÚ
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden className="rounded-[2px]">
              <rect width="6" height="12" fill="#D91023" />
              <rect x="6" width="6" height="12" fill="#fff" />
              <rect x="12" width="6" height="12" fill="#D91023" />
            </svg>
          </span>
        </div>
        {phase === 'quiz' && (
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-cta transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 pb-32 flex flex-col">
        {phase === 'quiz' && step && (
          <div key={step.id} className="flex-1 flex flex-col animate-fadein">
            <p className="text-xs font-semibold uppercase tracking-widest text-cta mt-6 mb-3">
              Paso {index + 1} de {TOTAL}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {fill(step.question, firstName)}
            </h1>
            {step.subtitle && (
              <p className="text-white/60 mt-3 text-base">
                {fill(step.subtitle, firstName)}
              </p>
            )}

            <div className="mt-8 space-y-3">
              {step.kind === 'text' ? (
                <input
                  autoFocus
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canContinue) advance();
                  }}
                  placeholder={step.placeholder}
                  className="w-full h-14 rounded-xl bg-white/5 border border-white/15 px-4 text-lg text-white placeholder:text-white/30 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30 transition"
                />
              ) : step.kind === 'contact' ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full h-14 rounded-xl bg-white/5 border border-white/15 px-4 text-lg text-white placeholder:text-white/30 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30 transition"
                  />
                  <div className="flex items-stretch rounded-xl bg-white/5 border border-white/15 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/30 transition overflow-hidden">
                    <span className="flex items-center gap-2 px-3.5 border-r border-white/15 text-white/85 text-lg font-medium select-none shrink-0">
                      <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden className="rounded-[2px]">
                        <rect width="6" height="12" fill="#D91023" />
                        <rect x="6" width="6" height="12" fill="#fff" />
                        <rect x="12" width="6" height="12" fill="#D91023" />
                      </svg>
                      +51
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canContinue) advance();
                      }}
                      placeholder="987 654 321"
                      maxLength={9}
                      className="flex-1 h-14 bg-transparent px-3.5 text-lg text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canContinue) advance();
                    }}
                    placeholder="Correo (opcional)"
                    className="w-full h-14 rounded-xl bg-white/5 border border-white/15 px-4 text-lg text-white placeholder:text-white/30 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30 transition"
                  />
                  <p className="text-xs text-white/40 pt-1">
                    Sin esperas: aseguras tu web y pagas al final. Tus datos van seguros, sin spam.
                  </p>
                </div>
              ) : (
                step.options?.map((opt) => {
                  const active = selected === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={[
                        'w-full text-left rounded-xl border px-5 py-4 text-base font-medium transition-all flex items-center gap-3',
                        active
                          ? 'border-cta bg-cta text-cta-foreground shadow-[0_8px_20px_-4px_hsl(75_100%_50%_/_0.4)]'
                          : 'border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                          active ? 'border-cta-foreground' : 'border-white/40',
                        ].join(' ')}
                      >
                        {active && (
                          <span className="h-2.5 w-2.5 rounded-full bg-cta-foreground" />
                        )}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {phase === 'apto' && (
          <div className="flex-1 flex flex-col justify-center animate-fadein py-10">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {firstName ? `¡Todo listo, ${firstName}!` : '¡Todo listo!'}
              <br />
              <span className="text-cta">Tu web empieza hoy.</span>
            </h1>
            <p className="text-white/70 mt-5 text-lg">
              Un solo paso más y comenzamos. Asegura tu plan{' '}
              <b className="text-white">WEB EXPRESS por S/100</b> (pago único, hosting
              gratis 1 año) y tendrás tu web{' '}
              <b className="text-white">lista hoy mismo</b>.
            </p>

            <div className="mt-6 rounded-2xl border border-cta/30 bg-cta/5 p-5">
              <p className="text-sm text-white/60 mb-3 font-semibold uppercase tracking-wide">
                Tu pedido
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between gap-4">
                  <span className="text-white/60">Cliente</span>
                  <span className="font-semibold text-right">
                    {contactName.trim() || '—'}
                  </span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-white/60">Plan</span>
                  <span className="font-semibold">Web Express</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-white/60">Entrega</span>
                  <span className="font-semibold text-cta">Hoy mismo</span>
                </li>
                <li className="flex justify-between gap-4 border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/60">Total</span>
                  <span className="font-bold text-lg">S/ 100.00</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {phase === 'noapto' && (
          <div className="flex-1 flex flex-col justify-center animate-fadein py-10">
            <div className="text-5xl mb-4">📌</div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {firstName ? `Tu lugar está reservado, ${firstName}.` : 'Tu lugar está reservado.'}
              <br />
              <span className="text-cta">La oferta te espera.</span>
            </h1>
            <p className="text-white/70 mt-5 text-lg">
              Cuando estés listo, escríbenos y empezamos ese mismo día.
              El plan WEB EXPRESS a{' '}
              <b className="text-white">S/100</b> sigue disponible para ti.
            </p>

            {/* Recordatorio visual de la oferta */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-4">
              <span className="text-3xl">🚀</span>
              <div>
                <p className="font-bold text-white">Web Express — S/100</p>
                <p className="text-sm text-white/50">Hosting gratis 1 año · Lista el mismo día · Pago único</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={`https://wa.me/51958617185?text=${encodeURIComponent(
                  `Hola PLIA, quiero retomar mi solicitud de web${firstName ? `. Soy ${firstName}` : ''}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-xl bg-[#25D366] text-black font-bold text-lg flex items-center justify-center gap-2.5 hover:bg-[#1ebe5b] transition"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escríbenos cuando estés listo
              </a>
              <button
                type="button"
                onClick={goToCheckout}
                className="w-full h-12 rounded-xl border border-cta/40 text-cta font-medium flex items-center justify-center hover:bg-cta/10 transition"
              >
                Empezar ahora de todas formas →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Boton fijo abajo (full-width en mobile) */}
      {phase === 'quiz' && (
        <footer className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-5 px-5">
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              disabled={!canContinue}
              onClick={advance}
              className="w-full h-14 rounded-xl bg-cta text-cta-foreground font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cta-hover"
            >
              {step?.cta ?? 'Siguiente'}
              <span aria-hidden>→</span>
            </button>
          </div>
        </footer>
      )}

      {phase === 'apto' && (
        <footer className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-5 px-5">
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full h-14 rounded-xl bg-cta text-cta-foreground font-bold text-lg flex items-center justify-center gap-2 transition hover:bg-cta-hover shadow-[0_8px_20px_-4px_hsl(75_100%_50%_/_0.4)]"
            >
              Continuar y asegurar mi web
              <span aria-hidden>→</span>
            </button>
            <p className="text-center text-xs text-white/40 mt-3">
              Pago único · Sin mensualidades · Hosting gratis 1 año
            </p>
          </div>
        </footer>
      )}

      <style jsx global>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein 0.35s ease-out;
        }
      `}</style>
    </div>
  );
}
