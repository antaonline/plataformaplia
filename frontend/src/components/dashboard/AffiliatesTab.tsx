'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Copy,
  Check,
  Landmark,
  Smartphone,
  Link2,
  Loader2,
  Clock,
  Star,
} from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://plia.pe').replace(/\/$/, '');

type Balances = { available: number; inProcess: number; paid: number; totalEarned: number };
type Rules = { minWithdrawal: number; maxWithdrawalsPerMonth: number; payoutSlaBusinessDays: number };
type AffiliateMe = {
  code: string;
  status: string;
  payoutMethod: 'YAPE' | 'BANK' | null;
  payout: {
    yapeNumber?: string;
    yapeName?: string;
    bankName?: string;
    bankAccount?: string;
    bankCci?: string;
    bankHolder?: string;
    bankDocType?: string;
    bankDocNumber?: string;
  };
  balances: Balances;
  conversions: number;
  unreadCount: number;
  rules: Rules;
};
type Commission = {
  id: number;
  amount: number;
  currency: string;
  status: string;
  product: string;
  orderId: number;
  createdAt: string;
  read: boolean;
};
type Payout = {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  requestedAt: string;
  dueBy: string | null;
  paidAt: string | null;
};

const money = (n: number) => `S/ ${Number(n || 0).toFixed(2)}`;
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const commissionStatus: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700' },
  PAID: { label: 'Pagada', cls: 'bg-blue-100 text-blue-700' },
  REVERSED: { label: 'Revertida', cls: 'bg-rose-100 text-rose-700' },
};
const payoutStatus: Record<string, { label: string; cls: string }> = {
  REQUESTED: { label: 'En proceso', cls: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Pagado', cls: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rechazado', cls: 'bg-rose-100 text-rose-700' },
};

export function AffiliatesTab({ onRead }: { onRead?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const [method, setMethod] = useState<'YAPE' | 'BANK'>('YAPE');
  const [form, setForm] = useState({
    yapeNumber: '',
    yapeName: '',
    bankName: '',
    bankAccount: '',
    bankCci: '',
    bankHolder: '',
    bankDocType: 'DNI',
    bankDocNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const load = async () => {
    setLoading(true);
    try {
      const [meRes, comRes, payRes] = await Promise.all([
        fetch(`${apiBase}/affiliates/me`, { headers: authHeaders() }),
        fetch(`${apiBase}/affiliates/commissions`, { headers: authHeaders() }),
        fetch(`${apiBase}/affiliates/payouts`, { headers: authHeaders() }),
      ]);
      const meData = meRes.ok ? await meRes.json() : null;
      const comData = comRes.ok ? await comRes.json() : [];
      const payData = payRes.ok ? await payRes.json() : [];

      if (meData) {
        setMe(meData);
        setMethod(meData.payoutMethod ?? 'YAPE');
        setForm((f) => ({
          yapeNumber: meData.payout?.yapeNumber ?? '',
          yapeName: meData.payout?.yapeName ?? '',
          bankName: meData.payout?.bankName ?? '',
          bankAccount: meData.payout?.bankAccount ?? '',
          bankCci: meData.payout?.bankCci ?? '',
          bankHolder: meData.payout?.bankHolder ?? '',
          bankDocType: meData.payout?.bankDocType ?? 'DNI',
          bankDocNumber: meData.payout?.bankDocNumber ?? '',
        }));

        // Marca las comisiones como leídas → resetea la bolita del menú.
        if (meData.unreadCount > 0) {
          fetch(`${apiBase}/affiliates/commissions/mark-read`, {
            method: 'POST',
            headers: authHeaders(),
          })
            .then(() => onRead?.())
            .catch(() => {});
        } else {
          onRead?.();
        }
      }
      setCommissions(Array.isArray(comData) ? comData : []);
      setPayouts(Array.isArray(payData) ? payData : []);
    } catch {
      toast({ title: 'No se pudo cargar tu panel de afiliado', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
    } catch {
      /* noop */
    }
  };

  const saveMethod = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/affiliates/payout-method`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ payoutMethod: method, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo guardar');
      toast({ title: 'Medio de cobro guardado' });
      await load();
    } catch (e: any) {
      toast({ title: e.message ?? 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const requestPayout = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`${apiBase}/affiliates/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo solicitar el retiro');
      toast({
        title: 'Retiro solicitado',
        description: `Recibirás tu pago en máximo ${me?.rules.payoutSlaBusinessDays ?? 3} días hábiles.`,
      });
      await load();
    } catch (e: any) {
      toast({ title: e.message ?? 'Error al solicitar el retiro', variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu panel de afiliado…
      </div>
    );
  }
  if (!me) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        No se pudo cargar tu panel de afiliado. Intenta recargar la página.
      </div>
    );
  }

  const code = me.code;
  const links: { label: string; url: string; primary?: boolean }[] = [
    { label: 'Link principal', url: `${siteUrl}/?ref=${code}`, primary: true },
    { label: 'Planes', url: `${siteUrl}/planes?ref=${code}` },
    { label: 'Plan Landing', url: `${siteUrl}/checkout?plan=landing&ref=${code}` },
    { label: 'Plan Web institucional', url: `${siteUrl}/checkout?plan=web&ref=${code}` },
    { label: 'Hosting', url: `${siteUrl}/web-hosting?ref=${code}` },
  ];

  const canRequest = !!me.payoutMethod && me.balances.available >= me.rules.minWithdrawal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Programa de afiliados</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comparte tu link y gana una comisión por cada venta que generes — Landing, Web u Hosting.
        </p>
      </div>

      {/* Saldos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-cta/40 bg-cta/5">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">Disponible para cobro</p>
            <p className="text-3xl font-bold text-foreground mt-1">{money(me.balances.available)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">En proceso de pago</p>
            <p className="text-2xl font-bold text-foreground mt-1">{money(me.balances.inProcess)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">Pagado</p>
            <p className="text-2xl font-bold text-foreground mt-1">{money(me.balances.paid)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total ganado</p>
            <p className="text-2xl font-bold text-foreground mt-1">{money(me.balances.totalEarned)}</p>
            <p className="text-xs text-muted-foreground mt-1">{me.conversions} ventas</p>
          </CardContent>
        </Card>
      </div>

      {/* Retiro */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="w-5 h-5" /> Cobrar mis comisiones
          </CardTitle>
          <CardDescription>
            Mínimo {money(me.rules.minWithdrawal)} para retirar · hasta {me.rules.maxWithdrawalsPerMonth} retiros
            por mes · pago en máximo {me.rules.payoutSlaBusinessDays} días hábiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant="cta" disabled={!canRequest || requesting} onClick={requestPayout}>
              {requesting ? 'Solicitando…' : `Solicitar retiro de ${money(me.balances.available)}`}
            </Button>
            {!me.payoutMethod && (
              <p className="text-xs text-amber-700">
                Configura tu medio de cobro abajo para poder retirar.
              </p>
            )}
            {me.payoutMethod && me.balances.available < me.rules.minWithdrawal && (
              <p className="text-xs text-muted-foreground">
                Te faltan {money(me.rules.minWithdrawal - me.balances.available)} para llegar al mínimo de retiro.
              </p>
            )}
          </div>

          {payouts.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Historial de retiros</p>
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{money(p.amount)}</span>
                    <span className="text-muted-foreground">· {p.method === 'YAPE' ? 'Yape' : 'Banco'}</span>
                    <span className="text-xs text-muted-foreground">{fmtDate(p.requestedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'REQUESTED' && p.dueBy && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> antes del {fmtDate(p.dueBy)}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        payoutStatus[p.status]?.cls ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {payoutStatus[p.status]?.label ?? p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mis links */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5" /> Mis links de afiliado
          </CardTitle>
          <CardDescription>
            Comparte el link principal: cuente lo que compre tu referido en los próximos 30 días, ganas la comisión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {links.map((l) => (
            <div
              key={l.label}
              className={cn(
                'flex items-center gap-2 rounded-xl transition',
                l.primary
                  ? 'border-2 border-cta bg-cta/5 px-3 py-3 shadow-sm'
                  : 'border border-border bg-background px-3 py-2',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-xs',
                      l.primary ? 'font-bold text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {l.label}
                  </p>
                  {l.primary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cta-foreground">
                      <Star className="w-3 h-3" /> Recomendado
                    </span>
                  )}
                </div>
                <p className={cn('text-sm truncate', l.primary ? 'font-semibold' : 'font-medium')}>
                  {l.url}
                </p>
              </div>
              <Button
                variant={l.primary ? 'cta' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => copy(l.label, l.url)}
              >
                {copied === l.label ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copiar
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Medio de cobro */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Medio de cobro</CardTitle>
          <CardDescription>
            Puedes guardar ambos datos, pero solo el método seleccionado quedará habilitado para pagarte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod('YAPE')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition',
                method === 'YAPE' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted',
              )}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold">Yape</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('BANK')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition',
                method === 'BANK' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted',
              )}
            >
              <Landmark className="w-5 h-5" />
              <span className="font-semibold">Cuenta bancaria</span>
            </button>
          </div>

          {method === 'YAPE' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Número de Yape</label>
                <Input
                  placeholder="9XX XXX XXX"
                  value={form.yapeNumber}
                  onChange={(e) => setForm((f) => ({ ...f, yapeNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Titular (nombre)</label>
                <Input
                  placeholder="Como aparece en Yape"
                  value={form.yapeName}
                  onChange={(e) => setForm((f) => ({ ...f, yapeName: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Banco</label>
                <Input
                  placeholder="Ej. BCP, BBVA, Interbank"
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Número de cuenta</label>
                <Input
                  value={form.bankAccount}
                  onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">CCI (interbancario)</label>
                <Input
                  value={form.bankCci}
                  onChange={(e) => setForm((f) => ({ ...f, bankCci: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Titular de la cuenta</label>
                <Input
                  value={form.bankHolder}
                  onChange={(e) => setForm((f) => ({ ...f, bankHolder: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Tipo de documento</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.bankDocType}
                  onChange={(e) => setForm((f) => ({ ...f, bankDocType: e.target.value }))}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Número de documento</label>
                <Input
                  value={form.bankDocNumber}
                  onChange={(e) => setForm((f) => ({ ...f, bankDocNumber: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button variant="cta" onClick={saveMethod} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar medio de cobro'}
            </Button>
            {me.payoutMethod && (
              <span className="text-xs text-muted-foreground">
                Método habilitado actualmente: <strong>{me.payoutMethod === 'YAPE' ? 'Yape' : 'Cuenta bancaria'}</strong>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mis ventas */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Mis ventas</CardTitle>
          <CardDescription>Cada comisión que has generado con tus links.</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aún no tienes ventas de afiliado. Comparte tu link para empezar a ganar.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{c.product}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(c.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{money(c.amount)}</span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        commissionStatus[c.status]?.cls ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {commissionStatus[c.status]?.label ?? c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
