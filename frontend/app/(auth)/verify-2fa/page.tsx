'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/src/lib/api'

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
      setError('Sesión inválida')
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

      if (!res?.access_token) {
        throw new Error('Código inválido o expirado')
      }

      localStorage.removeItem('2fa_userId')
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
    <form onSubmit={handleVerify}>
      <h1>Verificación 2FA</h1>

      <input
        placeholder="Código"
        value={code}
        onChange={e => setCode(e.target.value)}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button disabled={loading}>
        {loading ? 'Verificando...' : 'Confirmar'}
      </button>
    </form>
  )
}
