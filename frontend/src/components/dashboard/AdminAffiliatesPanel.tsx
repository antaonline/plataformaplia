'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Users, TrendingUp, Wallet, Check, X } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type Stats = {
  totalAffiliates: number;
  newAffiliates: number;
  conversions: number;
  commissionsGenerated: number;
  commissionsPaid: number;
  commissionsAvailable: number;
  pendingPayouts: { count: number; amount: number };
};
type Affiliate = {
  id: number; code: string; status: string; name?: string; email?: string;
  payoutMethod: string | null; sales: number; generated: number; available: number; createdAt: string;
};
type Conversion = {
  id: number; amount: number; status: string; product: string;
  affiliateCode?: string; affiliateName?: string; createdAt: string; orderId: number;
};
type Payout = {
  id: number; amount: number; method: string; destination: any; status: string;
  reference: string | null; requestedAt: string; dueBy: string | null; paidAt: string | null;
  affiliateCode?: string; affiliateName?: string; affiliateEmail?: string;
};

const money = (n: number) => `S/ ${Number(n || 0).toFixed(2)}`;
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const presets = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'anio', label: 'Año' },
  { id: 'todo', label: 'Todo' },
  { id: 'rango', label: 'Rango' },
];

function computeRange(preset: string, from: string, to: string): { from?: string; to?: string } {
  const now = new Date();
  if (preset === 'hoy') {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    return { from: d.toISOString(), to: now.toISOString() };
  }
  if (preset === 'semana') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    return { from: d.toISOString(), to: now.toISOString() };
  }
  if (preset === 'mes') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: now.toISOString() };
  }
  if (preset === 'anio') {
    return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: now.toISOString() };
  }
  if (preset === 'rango') {
    return {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    };
  }
  return {};
}

const statusPill: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  PAID: 'bg-blue-100 text-blue-700',
  REVERSED: 'bg-rose-100 text-rose-700',
  REQUESTED: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

export function AdminAffiliatesPanel() {
  const { toast } = useToast();
  const [preset, setPreset] = useState('mes');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [view, setView] = useState<'payouts' | 'affiliates' | 'conversions'>('payouts');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutScope, setPayoutScope] = useState<'REQUESTED' | 'ALL'>('REQUESTED');
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => computeRange(preset, customFrom, customTo), [preset, customFrom, customTo]);

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (range.from) q.set('from', range.from);
    if (range.to) q.set('to', range.to);
    const qs = q.toString() ? `?${q.toString()}` : '';
    try {
      const [statsRes, affRes, convRes, payRes] = await Promise.all([
        fetch(`${apiBase}/admin/affiliates/stats${qs}`, { headers: authHeaders() }),
        fetch(`${apiBase}/admin/affiliates/list`, { headers: authHeaders() }),
        fetch(`${apiBase}/admin/affiliates/conversions${qs}`, { headers: authHeaders() }),
        fetch(`${apiBase}/admin/affiliates/payouts?status=${payoutScope}`, { headers: authHeaders() }),
      ]);
      setStats(statsRes.ok ? await statsRes.json() : null);
      setAffiliates(affRes.ok ? await affRes.json() : []);
      setConversions(convRes.ok ? await convRes.json() : []);
      setPayouts(payRes.ok ? await payRes.json() : []);
    } catch {
      toast({ title: 'No se pudo cargar el panel de afiliados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, payoutScope]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const pay = async (p: Payout) => {
    const reference = window.prompt(
      `Marcar como PAGADO el retiro de ${money(p.amount)} a ${p.affiliateName ?? p.affiliateCode}.\n\nNúmero de operación / constancia (opcional):`,
      '',
    );
    if (reference === null) return;
    try {
      const res = await fetch(`${apiBase}/admin/affiliates/payouts/${p.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ reference: reference || undefined }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || 'Error');
      toast({ title: 'Retiro marcado como pagado' });
      loadAll();
    } catch (e: any) {
      toast({ title: e.message ?? 'Error', variant: 'destructive' });
    }
  };

  const reject = async (p: Payout) => {
    if (!window.confirm(`¿Rechazar el retiro de ${money(p.amount)}? Las comisiones volverán a estar disponibles para el afiliado.`)) return;
    try {
      const res = await fetch(`${apiBase}/admin/affiliates/payouts/${p.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || 'Error');
      toast({ title: 'Retiro rechazado' });
      loadAll();
    } catch (e: any) {
      toast({ title: e.message ?? 'Error', variant: 'destructive' });
    }
  };

  const renderDestination = (d: any) => {
    if (!d || typeof d !== 'object') return null;
    if (d.method === 'YAPE') {
      return <span>Yape {d.yapeNumber}{d.yapeName ? ` · ${d.yapeName}` : ''}</span>;
    }
    return (
      <span>
        {d.bankName} · {d.bankAccount}
        {d.bankCci ? ` · CCI ${d.bankCci}` : ''}
        {d.bankHolder ? ` · ${d.bankHolder}` : ''}
        {d.bankDocNumber ? ` · ${d.bankDocType} ${d.bankDocNumber}` : ''}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Afiliados · Administración</h2>
          <p className="text-sm text-muted-foreground">Estadísticas, afiliados y cola de pagos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition',
                preset === p.id ? 'border-cta bg-cta/10 font-medium' : 'border-border hover:bg-muted text-muted-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {preset === 'rango' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Desde</span>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Hasta</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-auto" />
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Afiliados</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalAffiliates ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">+{stats?.newAffiliates ?? 0} nuevos en el periodo</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Conversiones</p>
            <p className="text-3xl font-bold mt-1">{stats?.conversions ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{money(stats?.commissionsGenerated ?? 0)} generado</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">Pagado (periodo)</p>
            <p className="text-2xl font-bold mt-1">{money(stats?.commissionsPaid ?? 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{money(stats?.commissionsAvailable ?? 0)} por pagar (total)</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-cta/40 bg-cta/5">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Retiros pendientes</p>
            <p className="text-3xl font-bold mt-1">{stats?.pendingPayouts.count ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{money(stats?.pendingPayouts.amount ?? 0)} por desembolsar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de vista */}
      <div className="flex items-center gap-2 border-b border-border">
        {([
          ['payouts', 'Retiros'],
          ['affiliates', 'Afiliados'],
          ['conversions', 'Conversiones'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'px-4 py-2 text-sm border-b-2 -mb-px transition',
              view === id ? 'border-cta font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      )}

      {!loading && view === 'payouts' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setPayoutScope('REQUESTED')} className={cn('text-xs px-3 py-1 rounded-full border', payoutScope === 'REQUESTED' ? 'border-cta bg-cta/10' : 'border-border text-muted-foreground')}>Pendientes</button>
            <button onClick={() => setPayoutScope('ALL')} className={cn('text-xs px-3 py-1 rounded-full border', payoutScope === 'ALL' ? 'border-cta bg-cta/10' : 'border-border text-muted-foreground')}>Todos</button>
          </div>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No hay retiros {payoutScope === 'REQUESTED' ? 'pendientes' : ''}.</p>
          ) : (
            payouts.map((p) => (
              <Card key={p.id} className="rounded-xl border-border/60">
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{money(p.amount)}</span>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusPill[p.status] ?? 'bg-muted')}>{p.status}</span>
                      {p.status === 'REQUESTED' && p.dueBy && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> antes del {fmtDate(p.dueBy)}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{p.affiliateName ?? p.affiliateCode} <span className="text-muted-foreground font-normal">· {p.affiliateEmail}</span></p>
                    <p className="text-xs text-muted-foreground">{p.method === 'YAPE' ? 'Yape' : 'Banco'}: {renderDestination(p.destination)}</p>
                    <p className="text-xs text-muted-foreground">Solicitado {fmtDate(p.requestedAt)}{p.reference ? ` · Ref: ${p.reference}` : ''}</p>
                  </div>
                  {p.status === 'REQUESTED' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="cta" size="sm" onClick={() => pay(p)}><Check className="w-4 h-4 mr-1" /> Marcar pagado</Button>
                      <Button variant="outline" size="sm" onClick={() => reject(p)}><X className="w-4 h-4 mr-1" /> Rechazar</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {!loading && view === 'affiliates' && (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Afiliado</th>
                <th className="px-4 py-2 font-medium">Código</th>
                <th className="px-4 py-2 font-medium text-right">Ventas</th>
                <th className="px-4 py-2 font-medium text-right">Generado</th>
                <th className="px-4 py-2 font-medium text-right">Disponible</th>
                <th className="px-4 py-2 font-medium">Cobro</th>
                <th className="px-4 py-2 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aún no hay afiliados.</td></tr>
              ) : affiliates.map((a) => (
                <tr key={a.id} className="border-t border-border/60">
                  <td className="px-4 py-2">
                    <p className="font-medium">{a.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{a.code}</td>
                  <td className="px-4 py-2 text-right">{a.sales}</td>
                  <td className="px-4 py-2 text-right">{money(a.generated)}</td>
                  <td className="px-4 py-2 text-right font-semibold">{money(a.available)}</td>
                  <td className="px-4 py-2">{a.payoutMethod === 'YAPE' ? 'Yape' : a.payoutMethod === 'BANK' ? 'Banco' : '—'}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && view === 'conversions' && (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Producto</th>
                <th className="px-4 py-2 font-medium">Afiliado</th>
                <th className="px-4 py-2 font-medium text-right">Comisión</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {conversions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay conversiones en este periodo.</td></tr>
              ) : conversions.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-4 py-2 text-xs text-muted-foreground">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-2">{c.product}</td>
                  <td className="px-4 py-2">{c.affiliateName ?? c.affiliateCode}</td>
                  <td className="px-4 py-2 text-right font-semibold">{money(c.amount)}</td>
                  <td className="px-4 py-2">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusPill[c.status] ?? 'bg-muted')}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
