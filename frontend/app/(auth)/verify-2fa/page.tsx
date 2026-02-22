'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import Image from "next/image";

export default function Verify2FAPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const userId = Number(localStorage.getItem('2fa_userId'))
    if (!userId) {
      setError('Sesion invalida')
      return
    }

    try {
      const res = await apiFetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          code,
          fingerprint: navigator.userAgent,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || 'Codigo invalido o expirado')
      }

      localStorage.removeItem('2fa_userId')
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
    <section className="section-container min-h-screen flex items-center justify-center px-5 py-5">

        <div className="grid lg:grid-cols-5 gap-10 gap-y-3 w-full h-full">

          <div className="lg:col-span-3 lg:col-start-2 py-3 px-6 rounded-2xl bg-accent/10 border border-accent flex items-center gap-3">
            <div className="shrink-0 text-xl">
              ⚠️📩
            </div>
            <p className="text-xs leading-relaxed">
              Te ha llegado un correo electrónico con tu código de verificación; revisa el correo, copia el código e ingrésalo en este formulario
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-2 bg-white rounded-2xl border border-border shadow-card p-8 md:p-10 h-full flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center h-full pb-6">
              <div className="flex items-center gap-2">
                
                  <Image
                    src="/plia-logo-black.svg"
                    alt="PLIA"
                    width={120}
                    height={32}
                    priority
                    className="h-10 w-auto"
                  />
              
              </div>
              
            </div>

            <h1 className="text-3xl text-center md:text-4xl font-bold text-foreground mb-6">Código de Verificación 2FA</h1>

            <form onSubmit={handleVerify}>
              <Input
                placeholder="Ingresar Código"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="mb-6 h-12"
              />

              {error && <p style={{ color: 'red' }}>{error}</p>}

              <Button 
                variant="cta"
                size="lg"
                type="submit"
                className="w-full"
                disabled={loading}>
                {loading ? 'Verificando...' : 'Validar Código'}
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

        </div>

    </section>
      
    
  )
}
