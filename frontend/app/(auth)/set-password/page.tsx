'use client';

export const dynamic = "force-dynamic";

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation';


import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import Image from "next/image";

import nextdynamic from "next/dynamic"

const DeepParticleField = nextdynamic(
  () => import("@/components/shared/DeepParticleField").then(mod => mod.DeepParticleField),
  { ssr: false }
)

function SetPasswordContent() {
  const searchParams = useSearchParams()

  const [error, setError] = useState<string | null>(null);
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
  const [result, setResult] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

  const attemptLogin = async (loginEmail: string, plainPassword: string) => {
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

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      localStorage.removeItem('checkout_email');
      router.push('/dashboard');
      return true;
    }

    return false;
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setResult(null);

    setLoading(true);
    try {
      const storedEmail = localStorage.getItem('checkout_email');
      const loginEmail = storedEmail || emailFromQuery;

      if (!token) {
        const targetEmail = emailInput.trim() || loginEmail || '';
        if (!targetEmail) {
          setResult('Ingresa tu correo para enviar el enlace.');
          return;
        }
        const resetRes = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail }),
        });
        if (!resetRes.ok) {
          setResult('No se pudo enviar el enlace. Intenta de nuevo.');
          return;
        }
        setResult('Te enviamos un enlace para crear tu contrasena.');
        return;
      }

      if (!password || password !== confirm) {
        setResult('Las contrasenas no coinciden.');
        return;
      }

      const res = await fetch(`${apiBase}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        const isTokenError =
          errText.toLowerCase().includes('token') ||
          errText.toLowerCase().includes('expirado') ||
          errText.toLowerCase().includes('invalid');
        if (isTokenError && loginEmail) {
          const loggedIn = await attemptLogin(loginEmail, password);
          if (loggedIn) return;
          router.push(`/login${loginEmail ? `?email=${encodeURIComponent(loginEmail)}` : ''}`);
          return;
        }
        setResult('No se pudo actualizar la contrasena.');
      } else {
        if (loginEmail) {
          const loggedIn = await attemptLogin(loginEmail, password);
          if (loggedIn) return;
        }
        localStorage.removeItem('password_setup_token');
        setResult('Contrasena actualizada. Ya puedes iniciar sesion.');
      }
    } catch (err) {
      setResult('Error de conexion.');
    } finally {
      setLoading(false);
    }
  };
  
  return ( 
    <div>
     <section className="w-full lg:min-h-screen lg:flex lg:items-stretch lg:px-5 lg:py-5 xl:px-6 xl:py-6">
          <div className="w-full">
            <div className="grid lg:grid-cols-5 gap-10 w-full h-full">


              <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card p-8 md:p-10 h-full flex flex-col justify-center">
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

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Configurar contraseña</h1>

                {status === 'success' && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Pago confirmado. Solo falta crear tu contrasena.
                  </div>
                )}

                <form className="space-y-5 loginform" onSubmit={submit}>
                  
                  <div>
                    {!token && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Correo electronico *</label>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {token && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Nueva contrasena *</label>
                          <Input
                            type="password"
                            placeholder="Nueva Contrase?a"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Confirmar contrasena *</label>
                          <Input
                            type="password"
                            placeholder="Confirmar Nueva Contrase?a"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    variant="cta"
                    size="lg"
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    style={{ marginTop: 16 }}
                  >
                    {loading ? 'Procesando...' : token ? 'Guardar' : 'Enviar enlace'}
                  </Button>

                  {result && (
                    <p style={{ marginTop: 16 }}>
                      {result}
                    </p>
                  )}


                </form>
                  <div className="flex items-center justify-between text-sm">
                    <Link href="/set-password" className="text-cta hover:underline">Olvidaste tu contrasena?</Link>
                    <Link href="/planes" className="text-foreground hover:underline">No tienes cuenta? Registrate</Link>
                  </div>

                <div className="mt-8 text-xs text-muted-foreground flex flex-wrap gap-3">
                  <Link href="/privacidad" className="hover:underline">Privacidad</Link>
                  <span>-</span>
                  <Link href="/terminos" className="hover:underline">Terminos</Link>
                  <span>-</span>
                  <Link href="/contacto" className="hover:underline">Soporte</Link>
                </div>
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
                    <span className="text-sm">Soporte activo y acompanamiento personalizado</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
           <SetPasswordContent />
    </Suspense>
  );
}

export {};
