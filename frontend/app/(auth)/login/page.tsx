'use client'

import { useState } from 'react'
import { Layout } from "@/components/layout/Layout";
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
                    <div className="w-10 h-10 bg-cta rounded-xl flex items-center justify-center">
                      <span className="font-black text-cta-foreground text-xl">P</span>
                    </div>
                    <span className="font-bold text-2xl text-foreground">PLIA</span>
                  </div>
                  <button className="text-sm font-medium bg-muted px-4 py-2 rounded-full border border-border">
                    ES
                  </button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Iniciar sesion</h1>

                <form onSubmit={handleLogin} className="space-y-5 loginform">
                  
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Correo electronico *</label>
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
                      <Input
                        type="password"
                        placeholder="Tu contrasena"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
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

                <div className="mt-8 text-xs text-muted-foreground flex flex-wrap gap-3">
                  <Link href="/privacidad" className="hover:underline">Privacidad</Link>
                  <span>-</span>
                  <Link href="/terminos" className="hover:underline">Terminos</Link>
                  <span>-</span>
                  <Link href="/contacto" className="hover:underline">Soporte</Link>
                </div>
              </div>

              <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-border h-full hidden lg:block">
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/videos/hero-video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
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
