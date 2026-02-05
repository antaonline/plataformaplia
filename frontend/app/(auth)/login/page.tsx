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

      // 🚨 LOGIN REQUIERE 2FA
      if (res.requires2FA) {
        localStorage.setItem('2fa_userId', res.userId)
        router.push('/verify-2fa')
        return
      }

      // 🔐 LOGIN DIRECTO
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (



      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 w-full mx-auto">

            <AnimatedSection>

            <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Envíanos un mensaje</h2>
                <p className="text-muted-foreground mb-6">
                  Completa el formulario y te responderemos en menos de 24 horas.
                </p>

                <h1>Login</h1>

                <form onSubmit={handleLogin} className="space-y-5">
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  </div>

                  <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  </div>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button 
                  variant="cta" 
                  size="lg" 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Entrar'}
                </button>
              </form>

              </div>

              </AnimatedSection>

            

          </div>
        </div>
      </section>


      
    
  )
}
