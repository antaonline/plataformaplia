'use client';

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import nextdynamic from "next/dynamic";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  LogIn,
  Sparkles,
} from "lucide-react";

const DeepParticleField = nextdynamic(
  () => import("@/components/shared/DeepParticleField").then(mod => mod.DeepParticleField),
  { ssr: false }
)

/**
 * Página de configurar contraseña post-pago.
 *
 * Flujo (Opción A — auto-login + fallback claro):
 *  1. Usuario llega con ?token=... después del checkout.
 *  2. Ingresa contraseña + confirmación → click "Guardar".
 *  3. POST /auth/set-password.
 *  4. Si OK → INTENTA auto-login con esa contraseña.
 *     a) Login OK → redirige a /dashboard inmediatamente.
 *     b) Login OK con 2FA → redirige a /verify-2fa.
 *     c) Login falla → muestra pantalla de éxito con botón "Iniciar sesión"
 *        + countdown automático de 5s al login (cancelable si user clickea
 *        el botón antes).
 *  5. Si POST set-password falla por token inválido pero email + password
 *     coinciden con una cuenta existente → intenta login (caso edge: usuario
 *     entra después de que el link expiró pero ya tiene contraseña).
 */
function SetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenFromQuery = searchParams.get('token') ?? '';
  const tokenFromStorage = typeof window !== 'undefined'
    ? localStorage.getItem('password_setup_token') ?? ''
    : '';
  const token = tokenFromQuery || tokenFromStorage;
  const status = searchParams.get('status') ?? '';
  const emailFromQuery = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailInput, setEmailInput] = useState(emailFromQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Estados de la pantalla de éxito post-set-password
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [autoLoginFailed, setAutoLoginFailed] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
  const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

  // Cuando autoLoginFailed activa el countdown, arrancamos el timer y
  // limpiamos al desmontar/cancelar.
  useEffect(() => {
    if (!autoLoginFailed) return;
    setSecondsLeft(5);
    const tick = () => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          goToLogin();
          return 0;
        }
        return s - 1;
      });
    };
    countdownRef.current = setInterval(tick, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoginFailed]);

  const goToLogin = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const q = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : '';
    router.push(`/login${q}`);
  };

  const attemptLogin = async (loginEmail: string, plainPassword: string) => {
    try {
      const loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: plainPassword,
          fingerprint: navigator.userAgent,
        }),
      });
      const data = await loginRes.json().catch(() => ({}));

      if (loginRes.ok) {
        if (data.requires2FA) {
          localStorage.setItem('2fa_userId', data.userId);
          router.push('/verify-2fa');
          return true;
        }
        if (data.access_token) localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.removeItem('checkout_email');
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    setLoading(true);
    try {
      const storedEmail = typeof window !== 'undefined'
        ? localStorage.getItem('checkout_email')
        : null;
      const loginEmail = storedEmail || emailFromQuery;

      // Caso 1: Sin token → flujo "olvidé mi contraseña" (envía magic link).
      if (!token) {
        const targetEmail = emailInput.trim() || loginEmail || '';
        if (!targetEmail) {
          setErrorMsg('Ingresa tu correo para enviar el enlace.');
          return;
        }
        const resetRes = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail }),
        });
        if (!resetRes.ok) {
          setErrorMsg('No se pudo enviar el enlace. Intenta de nuevo.');
          return;
        }
        setInfoMsg('Te enviamos un enlace a tu correo para crear tu contraseña.');
        return;
      }

      // Caso 2: Con token → set-password.
      if (!password || password.length < 8) {
        setErrorMsg('Tu contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (password !== confirm) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }

      const res = await fetch(`${apiBase}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      // Caso 2a: set-password falló.
      if (!res.ok) {
        const errText = await res.text();
        const isTokenError =
          errText.toLowerCase().includes('token') ||
          errText.toLowerCase().includes('expirado') ||
          errText.toLowerCase().includes('invalid');
        if (isTokenError && loginEmail) {
          // El token expiró pero quizás la cuenta ya existe con esa pwd
          const loggedIn = await attemptLogin(loginEmail, password);
          if (loggedIn) return;
          router.push(`/login${loginEmail ? `?email=${encodeURIComponent(loginEmail)}` : ''}`);
          return;
        }
        setErrorMsg(
          isTokenError
            ? 'El enlace expiró. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".'
            : 'No se pudo actualizar la contraseña. Intenta de nuevo.',
        );
        return;
      }

      // Caso 2b: set-password OK → activamos pantalla de éxito + intentamos auto-login.
      localStorage.removeItem('password_setup_token');
      setSavedEmail(loginEmail || '');
      setIsSuccess(true);
      setAutoLoggingIn(true);

      if (loginEmail) {
        const loggedIn = await attemptLogin(loginEmail, password);
        if (loggedIn) return; // ya redirigió a dashboard / verify-2fa
      }

      // Auto-login falló o no había email → mostrar fallback con botón + countdown
      setAutoLoggingIn(false);
      setAutoLoginFailed(true);
    } catch (err) {
      setErrorMsg('Error de conexión. Revisa tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────────

  return (
    <div>
      <section className="w-full lg:min-h-screen lg:flex lg:items-stretch lg:px-5 lg:py-5 xl:px-6 xl:py-6">
        <div className="w-full">
          <div className="grid lg:grid-cols-5 gap-10 w-full h-full">

            <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card p-8 md:p-10 h-full flex flex-col justify-center min-h-[560px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  // ─── Pantalla de éxito ────────────────────────────
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    {/* Halo de fondo */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-72 h-72 rounded-full bg-cta/15 blur-3xl" />
                    </motion.div>

                    {/* Check con bounce */}
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 14,
                        delay: 0.12,
                      }}
                      className="relative w-24 h-24 rounded-full bg-cta flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(191,255,0,0.4)]"
                    >
                      <CheckCircle2 className="w-12 h-12 text-foreground" strokeWidth={2.5} />
                      {/* Ondas decorativas */}
                      {[0, 1].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 1, opacity: 0.45 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{
                            duration: 1.8,
                            delay: 0.4 + i * 0.4,
                            repeat: Infinity,
                            repeatDelay: 0.6,
                            ease: 'easeOut',
                          }}
                          className="absolute inset-0 rounded-full border-2 border-cta"
                        />
                      ))}
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="relative text-2xl md:text-3xl font-bold text-foreground mb-2"
                    >
                      ¡Tu cuenta está lista!
                    </motion.h2>

                    {autoLoggingIn ? (
                      // Spinner mientras se intenta el auto-login
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="relative flex flex-col items-center"
                      >
                        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                          Estamos iniciando tu sesión...
                        </p>
                        <Loader2 className="w-6 h-6 text-cta animate-spin" />
                      </motion.div>
                    ) : autoLoginFailed ? (
                      // Botón + countdown si auto-login falló
                      <>
                        <motion.p
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="relative text-sm text-muted-foreground mb-6 max-w-sm"
                        >
                          Inicia sesión con la contraseña que acabás de crear para acceder a tu dashboard.
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="relative w-full max-w-xs"
                        >
                          <Button
                            variant="cta"
                            size="lg"
                            className="w-full"
                            onClick={goToLogin}
                          >
                            <LogIn className="w-4 h-4" />
                            Iniciar sesión
                          </Button>
                          <p className="mt-4 text-xs text-muted-foreground/80">
                            Te llevamos al login en{' '}
                            <span className="font-bold text-foreground">{secondsLeft}s</span>...
                          </p>
                        </motion.div>
                      </>
                    ) : null}
                  </motion.div>
                ) : (
                  // ─── Formulario normal ─────────────────────────────
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-2">
                        <Link href="/" className="pr-10 flex items-center gap-2">
                          <Image
                            src="/plia-logo-black.svg"
                            alt="PLIA"
                            width={120}
                            height={32}
                            priority
                            className="h-8 w-auto"
                          />
                        </Link>
                      </div>
                      <button className="text-sm font-medium bg-muted px-4 py-2 rounded-full border border-border">
                        ES
                      </button>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      {token ? 'Crea tu contraseña' : 'Recupera tu cuenta'}
                    </h1>

                    {status === 'success' && (
                      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Pago confirmado.</strong> Solo falta crear tu contraseña para acceder.
                        </div>
                      </div>
                    )}

                    <form className="space-y-5 loginform" onSubmit={submit}>
                      <div>
                        {!token && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Correo electrónico *
                            </label>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              required
                            />
                            <p className="text-xs text-muted-foreground/80">
                              Te enviaremos un enlace para crear tu contraseña.
                            </p>
                          </div>
                        )}
                        {token && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Nueva contraseña *
                              </label>
                              <Input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                autoComplete="new-password"
                                required
                              />
                            </div>
                            <div className="space-y-2 mt-3">
                              <label className="text-sm font-medium text-muted-foreground">
                                Confirmar contraseña *
                              </label>
                              <Input
                                type="password"
                                placeholder="Repite tu contraseña"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                minLength={8}
                                autoComplete="new-password"
                                required
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Mensajes de error con estilo destructive */}
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                        >
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{errorMsg}</span>
                        </motion.div>
                      )}

                      {/* Mensajes informativos (ej. "te enviamos un enlace") */}
                      {infoMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
                        >
                          <Check className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{infoMsg}</span>
                        </motion.div>
                      )}

                      <Button
                        variant="cta"
                        size="lg"
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        style={{ marginTop: 16 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : token ? (
                          'Guardar contraseña'
                        ) : (
                          'Enviar enlace por correo'
                        )}
                      </Button>
                    </form>

                    <div className="flex items-center justify-between text-sm mt-5">
                      {token ? (
                        <Link href="/login" className="text-cta hover:underline">
                          ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          ¿No tienes cuenta?{' '}
                          <Link href="/planes" className="text-foreground hover:underline font-semibold">
                            Ver planes
                          </Link>
                        </span>
                      )}
                    </div>

                    <div className="mt-8 text-xs text-muted-foreground flex flex-wrap gap-3">
                      <Link href="/privacidad" className="hover:underline">Privacidad</Link>
                      <span>-</span>
                      <Link href="/terminos" className="hover:underline">Términos</Link>
                      <span>-</span>
                      <Link href="/contacto" className="hover:underline">Soporte</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-border h-full hidden lg:block">
              <DeepParticleField />
              <div className="absolute inset-0 bg-gradient-to-br" />
              <div className="relative z-10 h-full p-8 md:p-10 flex flex-col justify-between text-white">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Una sola cuenta para todo</h2>
                  <p className="text-white/90 mt-2">Accede a tu proyecto, hosting y dominio en un solo lugar.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 w-fit">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span className="text-sm">Soporte activo y acompañamiento personalizado</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}

export {};
