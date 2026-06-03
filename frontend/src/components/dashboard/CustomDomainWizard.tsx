"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface CustomDomainWizardProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  /** URL del subdominio plia.pe actual del proyecto (ej. "https://miweb.plia.pe"). */
  fallbackUrl: string;
  /** Llamada cuando se vincula con éxito; padre debería refetchear el proyecto. */
  onSuccess: (customDomain: string, primaryUrl: string) => void;
  apiBase: string;
  /** IP pública del servidor (para mostrar en los registros DNS sugeridos). */
  serverIp: string;
}

type Step = 1 | 2 | 3 | 4;

/**
 * Wizard 3-step para vincular un dominio propio al sitio del cliente.
 *  1. Captura el dominio.
 *  2. Muestra los registros DNS A que el cliente debe crear en su registrador.
 *  3. Verifica DNS y dispara el attach. Si OK, paso 4 (éxito).
 *
 * NO crea sitios nuevos en CyberPanel. Vincula como vhAlias del subdominio.
 */
export function CustomDomainWizard({
  open,
  onClose,
  projectId,
  fallbackUrl,
  onSuccess,
  apiBase,
  serverIp,
}: CustomDomainWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [domain, setDomain] = useState('');
  const [dnsCheck, setDnsCheck] = useState<{
    pointsToServer: boolean;
    resolvedIps: string[];
    reason?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    primaryUrl: string;
    customDomain: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const normalizedDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');

  const domainValid =
    /^[a-z0-9][a-z0-9-]{0,62}(\.[a-z0-9][a-z0-9-]{0,62})+$/.test(normalizedDomain) &&
    !normalizedDomain.endsWith('.plia.pe') &&
    normalizedDomain !== 'plia.pe';

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const reset = () => {
    setStep(1);
    setDomain('');
    setDnsCheck(null);
    setBusy(false);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const goCheckDns = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/projects/${projectId}/custom-domain/check-dns`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: normalizedDomain }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(' · ')
            : data?.message || 'No se pudo verificar el DNS.',
        );
      }
      setDnsCheck({
        pointsToServer: !!data.pointsToServer,
        resolvedIps: data.resolvedIps || [],
        reason: data.reason,
      });
      if (data.pointsToServer) {
        // DNS apunta bien → activar directo
        await attachDomain();
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar DNS.');
    } finally {
      setBusy(false);
    }
  };

  const attachDomain = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/projects/${projectId}/custom-domain/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: normalizedDomain }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(' · ')
            : data?.message || 'No se pudo vincular el dominio.',
        );
      }
      setSuccess({
        customDomain: data.customDomain,
        primaryUrl: data.primaryUrl,
      });
      setStep(4);
      onSuccess(data.customDomain, data.primaryUrl);
    } catch (err: any) {
      setError(err.message || 'Error al vincular el dominio.');
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-7 pt-7 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-cta/15 border border-cta/30 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Vincular tu dominio propio
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tu web va a responder en tu dominio con SSL automático.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-7 py-3 flex items-center gap-2 bg-slate-50/70">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= (n as Step)
                        ? 'bg-cta text-foreground'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step > (n as Step) ? <Check className="h-3.5 w-3.5" /> : n}
                  </div>
                  <div
                    className={`flex-1 h-0.5 ${
                      step > (n as Step) ? 'bg-cta' : 'bg-slate-200'
                    } ${n === 3 ? 'hidden' : ''}`}
                  />
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="p-7 min-h-[340px]">
              <AnimatePresence mode="wait">
                {/* STEP 1 — Captura dominio */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      ¿Cuál es tu dominio?
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      Escribilo sin <code>https://</code> ni <code>www</code>.
                      Ejemplo: <code>mi-marca.com</code>
                    </p>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="mi-marca.com"
                      autoFocus
                      className="w-full px-4 h-12 rounded-xl border border-slate-300 focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none text-base font-mono"
                    />
                    {domain && !domainValid && (
                      <p className="mt-3 text-xs text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Formato inválido. No usés .plia.pe acá (eso ya lo tenés).
                      </p>
                    )}
                    <div className="mt-7 flex justify-end gap-2">
                      <button
                        onClick={handleClose}
                        className="px-4 h-10 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        disabled={!domainValid}
                        onClick={() => setStep(2)}
                        className="px-5 h-10 rounded-xl bg-cta hover:bg-cta-hover text-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Continuar <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Mostrar registros DNS */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Configurá el DNS en tu registrador
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Entrá a donde compraste <strong>{normalizedDomain}</strong>{' '}
                      (GoDaddy, Namecheap, etc) y creá estos registros:
                    </p>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-[80px_80px_1fr_60px] bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <div>Tipo</div>
                        <div>Nombre</div>
                        <div>Valor</div>
                        <div></div>
                      </div>
                      {[
                        { type: 'A', name: '@', value: serverIp },
                        { type: 'A', name: 'www', value: serverIp },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[80px_80px_1fr_60px] px-4 py-3 items-center text-sm border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-mono font-bold">{row.type}</div>
                          <div className="font-mono">{row.name}</div>
                          <div className="font-mono text-slate-800 truncate">
                            {row.value}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(row.value, `dns-${i}`)
                            }
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copiar"
                          >
                            {copied === `dns-${i}` ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Importante:</strong> La propagación DNS tarda
                        entre 5 minutos y 2 horas. Si recién configuraste,
                        esperá un poco antes de hacer click en{' '}
                        <em>Verificar</em>.
                      </div>
                    </div>
                    <div className="mt-7 flex justify-between gap-2">
                      <button
                        onClick={() => setStep(1)}
                        className="px-4 h-10 rounded-xl text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" /> Atrás
                      </button>
                      <button
                        onClick={() => {
                          setStep(3);
                          goCheckDns();
                        }}
                        className="px-5 h-10 rounded-xl bg-cta hover:bg-cta-hover text-foreground font-bold text-sm flex items-center gap-2"
                      >
                        Ya lo configuré, verificar{' '}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Verificando / activando */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center py-6"
                  >
                    {busy && (
                      <>
                        <Loader2 className="h-10 w-10 mx-auto animate-spin text-cta mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">
                          {dnsCheck?.pointsToServer
                            ? 'Activando tu dominio...'
                            : 'Verificando DNS...'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                          {dnsCheck?.pointsToServer
                            ? 'Configurando el alias en el servidor y emitiendo SSL. Esto tarda 15-60 segundos.'
                            : `Consultando si ${normalizedDomain} apunta a nuestro servidor...`}
                        </p>
                      </>
                    )}
                    {!busy && error && (
                      <div className="text-left">
                        <div className="h-12 w-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto mb-3">
                          <AlertCircle className="h-6 w-6 text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center">
                          No se pudo vincular
                        </h3>
                        <p className="text-sm text-rose-700 mt-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                          {error}
                        </p>
                        {dnsCheck && !dnsCheck.pointsToServer && (
                          <div className="mt-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                            <p className="font-bold mb-1">Detalles del DNS:</p>
                            <p>
                              {normalizedDomain} apunta a:{' '}
                              <code>
                                {dnsCheck.resolvedIps.length
                                  ? dnsCheck.resolvedIps.join(', ')
                                  : '(no resuelve)'}
                              </code>
                            </p>
                            <p>
                              Debería apuntar a: <code>{serverIp}</code>
                            </p>
                          </div>
                        )}
                        <div className="mt-5 flex justify-between gap-2">
                          <button
                            onClick={() => setStep(2)}
                            className="px-4 h-10 rounded-xl text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                          >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                          </button>
                          <button
                            onClick={goCheckDns}
                            className="px-5 h-10 rounded-xl bg-cta hover:bg-cta-hover text-foreground font-bold text-sm"
                          >
                            Verificar de nuevo
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4 — Éxito */}
                {step === 4 && success && (
                  <motion.div
                    key="s4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 14,
                        delay: 0.1,
                      }}
                      className="h-16 w-16 rounded-full bg-cta border border-cta/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(191,255,0,0.4)]"
                    >
                      <Sparkles className="h-8 w-8 text-foreground" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                      ¡Tu dominio ya está activo!
                    </h3>
                    <p className="text-sm text-slate-600 mb-5">
                      Tu web responde en <strong>{success.customDomain}</strong>{' '}
                      con SSL. El subdominio sigue funcionando como redirect
                      automático.
                    </p>
                    <a
                      href={success.primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-cta hover:bg-cta-hover text-foreground font-bold text-sm"
                    >
                      Abrir mi sitio <ExternalLink className="h-4 w-4" />
                    </a>
                    <div className="mt-7">
                      <button
                        onClick={handleClose}
                        className="text-sm text-slate-500 hover:text-slate-900 underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
