'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegistroPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<'LANDING' | 'WEB'>('LANDING');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo crear la cuenta.');
      if (data.access_token) localStorage.setItem('access_token', data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Image src="/iconplia.svg" alt="PLIA" width={36} height={36} />
          <span className="font-bold text-lg">Tu Web Fácil</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">Crea tu web gratis</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Te la construimos, la pruebas 30 días y pagas solo si decides conservarla. Sin tarjeta.
        </p>

        {/* Tipo de web */}
        <div className="mb-5">
          <Label className="text-xs font-bold uppercase text-muted-foreground">¿Qué quieres crear?</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([
              { id: 'LANDING', label: 'Landing', desc: 'Una página de ventas' },
              { id: 'WEB', label: 'Web institucional', desc: 'Varias páginas' },
            ] as const).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setPlan(o.id)}
                className={`rounded-2xl border-2 p-3 text-left transition ${
                  plan === o.id ? 'border-cta bg-cta/10' : 'border-border bg-white hover:border-foreground/25'
                }`}
              >
                <p className="text-sm font-bold">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Correo electrónico</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Contraseña</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="cta" className="w-full rounded-full" disabled={loading}>
            {loading ? 'Creando tu cuenta...' : 'Empieza gratis'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
        </div>
        <a
          href={`${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002').replace(/\/api$/, '')}/api/auth/google/dashboard`}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-muted transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continuar con Google
        </a>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-cta-foreground underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
