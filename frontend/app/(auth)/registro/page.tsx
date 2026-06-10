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
