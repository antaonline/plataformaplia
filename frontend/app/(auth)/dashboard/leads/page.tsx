'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminFunnelLeadsPanel } from '@/components/dashboard/AdminFunnelLeadsPanel';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export default function LeadsAdminPage() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${apiBase}/auth/me`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) return setState('denied');
        const u = await r.json();
        setState(u?.role === 'ADMIN' ? 'ok' : 'denied');
      })
      .catch(() => setState('denied'));
  }, [router]);

  if (state === 'loading') {
    return <div className="p-20 text-center text-muted-foreground">Cargando…</div>;
  }
  if (state === 'denied') {
    return (
      <div className="p-20 text-center text-muted-foreground">
        Acceso solo para administradores.{' '}
        <Link href="/dashboard" className="text-cta-foreground underline">Volver</Link>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>
      <AdminFunnelLeadsPanel />
    </div>
  );
}
