'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Users, CheckCircle2, XCircle } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type Lead = {
  id: number;
  businessName: string | null;
  contactName: string | null;
  whatsapp: string | null;
  email: string | null;
  outcome: 'APTO' | 'NOAPTO';
  disqualifier: string | null;
  answers: Record<string, string>;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  fbclid: string | null;
  referrer: string | null;
  landingPath: string | null;
  createdAt: string;
};

const presets = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
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
  if (preset === 'rango') {
    return {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    };
  }
  return {};
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// Etiquetas legibles de las preguntas del quiz.
const ANSWER_LABELS: Record<string, string> = {
  intro: 'Conocía la oferta',
  type: 'Tipo de web',
  process: 'Acepta el proceso',
  urgency: 'Urgencia',
  readiness: 'Info lista',
  identity: 'Perfil',
  budget: 'Presupuesto',
};

function isFacebook(l: Lead): boolean {
  const u = (l.utmSource || '').toLowerCase();
  return !!l.fbclid || u.includes('facebook') || u.includes('fb') || u.includes('ig');
}

function sourceLabel(l: Lead): string {
  if (isFacebook(l)) return l.utmCampaign ? `Facebook · ${l.utmCampaign}` : 'Facebook';
  if (l.utmSource) return l.utmSource;
  if (l.referrer) {
    try { return new URL(l.referrer).hostname.replace(/^www\./, ''); } catch { return 'Referido'; }
  }
  return 'Directo';
}

function toCsv(leads: Lead[]): string {
  const headers = ['Fecha', 'Negocio', 'Nombre', 'WhatsApp', 'Correo', 'Resultado', 'Descalificó en', 'Origen', 'utm_source', 'utm_campaign', 'Facebook', 'Respuestas'];
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString('es-PE'),
    l.businessName ?? '', l.contactName ?? '', l.whatsapp ?? '', l.email ?? '',
    l.outcome, l.disqualifier ?? '', sourceLabel(l),
    l.utmSource ?? '', l.utmCampaign ?? '', isFacebook(l) ? 'sí' : '',
    JSON.stringify(l.answers ?? {}),
  ].map(esc).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function AdminFunnelLeadsPanel() {
  const { toast } = useToast();
  const [preset, setPreset] = useState('mes');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [outcome, setOutcome] = useState<'ALL' | 'APTO' | 'NOAPTO'>('ALL');
  const [source, setSource] = useState<'ALL' | 'facebook'>('ALL');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => computeRange(preset, customFrom, customTo), [preset, customFrom, customTo]);

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (range.from) q.set('from', range.from);
    if (range.to) q.set('to', range.to);
    if (outcome !== 'ALL') q.set('outcome', outcome);
    if (source !== 'ALL') q.set('source', source);
    try {
      const res = await fetch(`${apiBase}/admin/funnel-leads?${q.toString()}`, { headers: authHeaders() });
      setLeads(res.ok ? await res.json() : []);
    } catch {
      toast({ title: 'No se pudieron cargar los leads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, outcome, source]);

  useEffect(() => { load(); }, [load]);

  const kpis = useMemo(() => {
    const apto = leads.filter((l) => l.outcome === 'APTO').length;
    const fb = leads.filter(isFacebook).length;
    return { total: leads.length, apto, noapto: leads.length - apto, fb };
  }, [leads]);

  const exportCsv = () => {
    if (!leads.length) return;
    const blob = new Blob(['﻿' + toCsv(leads)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-embudo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads del embudo</h2>
          <p className="text-sm text-muted-foreground">Quién entró a /tu-web-hoy, qué respondió y si fue apto.</p>
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
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!leads.length}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
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
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Leads</p>
            <p className="text-3xl font-bold mt-1">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-cta/40 bg-cta/5">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Aptos</p>
            <p className="text-3xl font-bold mt-1">{kpis.apto}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> No aptos</p>
            <p className="text-3xl font-bold mt-1">{kpis.noapto}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">Desde Facebook</p>
            <p className="text-3xl font-bold mt-1">{kpis.fb}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {([['ALL', 'Todos'], ['APTO', 'Aptos'], ['NOAPTO', 'No aptos']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setOutcome(id)}
            className={cn('text-xs px-3 py-1 rounded-full border', outcome === id ? 'border-cta bg-cta/10' : 'border-border text-muted-foreground')}>
            {label}
          </button>
        ))}
        <span className="w-px h-5 bg-border mx-1" />
        {([['ALL', 'Todo origen'], ['facebook', 'Solo Facebook']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSource(id)}
            className={cn('text-xs px-3 py-1 rounded-full border', source === id ? 'border-cta bg-cta/10' : 'border-border text-muted-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : leads.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No hay leads en este periodo/filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Negocio</th>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Resultado</th>
                <th className="px-4 py-2 font-medium">Origen</th>
                <th className="px-4 py-2 font-medium">Respuestas</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-border/60 align-top">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{l.businessName || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.contactName || '—'}</p>
                    {l.whatsapp && (
                      <a
                        href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-emerald-600 font-medium hover:underline"
                      >
                        {l.whatsapp}
                      </a>
                    )}
                    {l.email && <p className="text-xs text-muted-foreground">{l.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      l.outcome === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                    )}>
                      {l.outcome === 'APTO' ? 'Apto' : 'No apto'}
                    </span>
                    {l.outcome === 'NOAPTO' && l.disqualifier && (
                      <p className="text-[11px] text-muted-foreground mt-1">se cayó en: {ANSWER_LABELS[l.disqualifier] ?? l.disqualifier}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{sourceLabel(l)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Object.entries(l.answers || {})
                        .filter(([k]) => k !== 'business' && k !== 'contact')
                        .map(([k, v]) => (
                          <span key={k} className="text-[11px] bg-muted rounded px-1.5 py-0.5">
                            <span className="text-muted-foreground">{ANSWER_LABELS[k] ?? k}:</span> {v}
                          </span>
                        ))}
                    </div>
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
