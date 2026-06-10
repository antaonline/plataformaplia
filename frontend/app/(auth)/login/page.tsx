'use client';

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import Image from "next/image";

import dynamic from "next/dynamic"

const DeepParticleField = dynamic(
  () => import("@/components/shared/DeepParticleField").then(mod => mod.DeepParticleField),
  { ssr: false }
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Captura el token cuando Google redirige aquí (?token=...) tras el OAuth.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      localStorage.setItem('access_token', token)
      router.replace('/dashboard')
    }
  }, [router])

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002').replace(/\/api$/, '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fingerprint: navigator.userAgent,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || 'Credenciales incorrectas')
      }

      // LOGIN REQUIERE 2FA
      if (data.requires2FA) {
        localStorage.setItem('2fa_userId', data.userId)
        router.push('/verify-2fa')
        return
      }

      // LOGIN DIRECTO
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (


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

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Iniciar sesión</h1>

                <form onSubmit={handleLogin} className="space-y-5 loginform">
                  
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Correo electrónico *</label>
                      <Input
                        type="email"
                        placeholder="Ej: maria@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Contrasena *</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contrasena"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center justify-between text-sm">
                    <Link href="/set-password" className="text-cta hover:underline">Olvidaste tu contrasena?</Link>
                    <Link href="/planes" className="text-foreground hover:underline">No tienes cuenta? Registrate</Link>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    variant="cta"
                    size="lg"
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Entrar'}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
                </div>
                <a
                  href={`${apiBase}/api/auth/google/dashboard`}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-muted transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continuar con Google
                </a>

                <div className="mt-5 text-center text-sm">
                  <span className="text-muted-foreground">¿No tienes cuenta? </span>
                  <Link href="/registro" className="font-semibold text-cta-foreground underline">
                    Crea tu web gratis
                  </Link>
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
      
    
  )
}
