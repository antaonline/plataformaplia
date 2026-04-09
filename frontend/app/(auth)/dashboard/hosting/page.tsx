'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Globe,
  HardDrive,
  Headphones,
  KeyRound,
  LayoutDashboard,
  Mail,
  Plus,
  Rocket,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE ?? 'plia.pe';

type DashboardData = {
  account: { status: string; packageName: string; technicalAccess: { panelUrl: string; username: string | null; password: string | null; managedByPlia?: boolean } };
  plan: { name: string; billingCycleMonths: number; renewsAt: string | null; price: number };
  usage: {
    websites: { used: number; max: number };
    storage: { usedMb: number; maxMb: number };
    emails: { used: number; max: number };
    bandwidth: { usedMb: number; maxMb: number };
    wordpress: { used: number; max: number };
    ssl: { active: number; total: number };
  };
  sites: Array<{ id: number; name: string; domain: string; publicUrl: string; status: string; sslStatus: string; storageUsedMb: number; storageLimitMb: number; uploadCount: number; lastDeployedAt: string | null; createdAgo: string }>;
};

const tabs = [
  { id: 'overview', label: 'Mis Sitios', icon: Globe },
  { id: 'plan', label: 'Mi Plan', icon: BarChart3 },
  { id: 'account', label: 'Mi Cuenta', icon: UserRound },
  { id: 'support', label: 'Soporte', icon: Headphones },
] as const;

const formatStorage = (value: number) => (value >= 1024 ? `${(value / 1024).toFixed(1)} GB` : `${value} MB`);
const formatDate = (value: string | null) => (value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin fecha');

export default function HostingDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [manageSiteId, setManageSiteId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', mode: 'subdomain' as 'subdomain' | 'custom', subdomain: '', domain: '' });
  const [busy, setBusy] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/hosting/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo cargar el dashboard de hosting.');
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar el dashboard de hosting.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const input = uploadInputRef.current as (HTMLInputElement & { webkitdirectory?: boolean }) | null;
    if (input) input.webkitdirectory = true;
  }, [manageSiteId]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { key: 'websites', icon: Globe, label: 'Websites', value: `${data.usage.websites.used}/${data.usage.websites.max}`, detail: `${data.usage.websites.max - data.usage.websites.used} espacios disponibles`, progress: data.usage.websites.max ? (data.usage.websites.used / data.usage.websites.max) * 100 : 0 },
      { key: 'storage', icon: HardDrive, label: 'Storage', value: `${data.usage.storage.usedMb}/${data.usage.storage.maxMb}`, detail: `${formatStorage(data.usage.storage.usedMb)} de ${formatStorage(data.usage.storage.maxMb)}`, progress: data.usage.storage.maxMb ? (data.usage.storage.usedMb / data.usage.storage.maxMb) * 100 : 0 },
      { key: 'emails', icon: Mail, label: 'Emails', value: `${data.usage.emails.used}/${data.usage.emails.max}`, detail: `${data.usage.emails.max - data.usage.emails.used} cuentas disponibles`, progress: data.usage.emails.max ? (data.usage.emails.used / data.usage.emails.max) * 100 : 0 },
      { key: 'bandwidth', icon: Rocket, label: 'Bandwidth', value: `${data.usage.bandwidth.usedMb}/${data.usage.bandwidth.maxMb}`, detail: `${formatStorage(data.usage.bandwidth.maxMb)} incluidos`, progress: data.usage.bandwidth.maxMb ? (data.usage.bandwidth.usedMb / data.usage.bandwidth.maxMb) * 100 : 0 },
      { key: 'ssl', icon: ShieldCheck, label: 'SSL', value: `${data.usage.ssl.active}/${data.usage.ssl.total}`, detail: 'Sitios con certificado activo', progress: data.usage.ssl.total ? (data.usage.ssl.active / data.usage.ssl.total) * 100 : 0 },
      { key: 'wordpress', icon: LayoutDashboard, label: 'WordPress', value: `${data.usage.wordpress.used}/${data.usage.websites.max}`, detail: 'Instalaciones WordPress operando', progress: data.usage.websites.max ? (data.usage.wordpress.used / data.usage.websites.max) * 100 : 0 },
    ];
  }, [data]);

  const currentSite = data?.sites.find((site) => site.id === manageSiteId) ?? null;

  const createSite = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo crear el sitio.');
      setCreateOpen(false);
      setCreateForm({ name: '', mode: 'subdomain', subdomain: '', domain: '' });
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear el sitio.');
    } finally {
      setBusy(false);
    }
  };

  const deleteSite = async (siteId: number, domain: string) => {
    const token = localStorage.getItem('access_token');
    if (!token || !window.confirm(`Se eliminara ${domain}.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${siteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo eliminar el sitio.');
      setManageSiteId(null);
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo eliminar el sitio.');
    } finally {
      setBusy(false);
    }
  };

  const uploadFolder = async (files: FileList | null) => {
    if (!files?.length || !manageSiteId) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setBusy(true);
    try {
      const form = new FormData();
      const paths: string[] = [];
      Array.from(files).forEach((file) => {
        form.append('files', file);
        paths.push((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
      });
      form.append('paths', JSON.stringify(paths));
      const res = await fetch(`${apiBase}/hosting/sites/${manageSiteId}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo publicar el sitio.');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo publicar el sitio.');
    } finally {
      setBusy(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Cargando dashboard de hosting...</div>;
  if (error && !data) {
    return <div className="mx-auto max-w-3xl px-4 py-16"><Card className="rounded-3xl"><CardHeader><CardTitle>No hay una cuenta de hosting lista todavia</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{error}</p><Button variant="cta" asChild><Link href="/web-hosting">Ver planes de hosting</Link></Button></CardContent></Card></div>;
  }
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f3f0ff]">
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_40px_120px_rgba(86,69,196,0.10)]">
          <div className="grid min-h-[820px] lg:grid-cols-[260px_1fr]">
            <aside className="border-r border-[#ece8ff] bg-[#fbfaff] p-6">
              <div className="mb-8 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebe7ff] text-[#5f55e5]"><Globe className="h-6 w-6" /></div><div><p className="text-2xl font-bold text-[#2c2a54]">Plia</p><p className="text-sm text-[#7b78a6]">Hosting Dashboard</p></div></div>
              <Tabs value={tab} onValueChange={(value) => setTab(value as any)}><TabsList className="grid h-auto gap-2 bg-transparent p-0">{tabs.map((item) => { const Icon = item.icon; return <TabsTrigger key={item.id} value={item.id} className="justify-start rounded-2xl px-4 py-3 data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white data-[state=active]:shadow-none"><Icon className="mr-3 h-4 w-4" />{item.label}</TabsTrigger>; })}</TabsList></Tabs>
              <div className="mt-10 rounded-[28px] bg-[#6c5ce7] p-5 text-white"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Plan activo</p><p className="mt-3 text-2xl font-bold">{data.plan.name}</p><p className="mt-2 text-sm text-white/80">Renueva el {formatDate(data.plan.renewsAt)}</p><Button variant="white" className="mt-5 w-full" asChild><Link href="/web-hosting">Ver mas planes</Link></Button></div>
            </aside>

            <main className="bg-[#f7f5ff] p-6 md:p-8">
              <div className="flex flex-col gap-4 border-b border-[#ece8ff] pb-6 md:flex-row md:items-center md:justify-between">
                <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b78a6]">Dashboard</p><h1 className="mt-2 text-4xl font-bold text-[#2c2a54]">{tab === 'overview' ? 'Mis Sitios' : tab === 'plan' ? 'Mi Plan' : tab === 'account' ? 'Mi Cuenta' : 'Soporte'}</h1><p className="mt-2 text-base text-[#7b78a6]">{tab === 'overview' ? 'Crea sitios, sube tu web y controla el estado de tu hosting desde un solo panel.' : tab === 'plan' ? 'Revisa limites reales y renovacion.' : tab === 'account' ? 'Acceso tecnico y datos de cuenta.' : 'Ayuda rapida para publicar y operar.'}</p></div>
                {tab === 'overview' && <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogTrigger asChild><Button variant="cta" className="rounded-2xl px-6"><Plus className="mr-2 h-4 w-4" />Crear Nueva Web</Button></DialogTrigger><DialogContent className="max-w-xl rounded-[28px]"><DialogHeader><DialogTitle>Crear nuevo sitio</DialogTitle><DialogDescription>Usa un subdominio de PLIA o tu propio dominio.</DialogDescription></DialogHeader><div className="grid gap-4 py-2"><Input value={createForm.name} onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nombre del sitio" /><div className="grid gap-3 md:grid-cols-2"><button type="button" className={cn('rounded-2xl border px-4 py-4 text-left', createForm.mode === 'subdomain' ? 'border-cta bg-cta/10' : 'border-border bg-secondary/20')} onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'subdomain' }))}><p className="font-semibold">Subdominio PLIA</p><p className="mt-1 text-sm text-muted-foreground">Ideal para salir rapido</p></button><button type="button" className={cn('rounded-2xl border px-4 py-4 text-left', createForm.mode === 'custom' ? 'border-cta bg-cta/10' : 'border-border bg-secondary/20')} onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'custom' }))}><p className="font-semibold">Dominio propio</p><p className="mt-1 text-sm text-muted-foreground">Para marcas ya publicadas</p></button></div>{createForm.mode === 'subdomain' ? <div className="flex items-center rounded-xl border border-input bg-background px-3"><input value={createForm.subdomain} onChange={(e) => setCreateForm((prev) => ({ ...prev, subdomain: e.target.value }))} className="h-11 flex-1 bg-transparent outline-none" placeholder="mi-negocio" /><span className="text-sm text-muted-foreground">.{domainBase}</span></div> : <Input value={createForm.domain} onChange={(e) => setCreateForm((prev) => ({ ...prev, domain: e.target.value }))} placeholder="midominio.com" />}</div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button><Button variant="cta" onClick={createSite} disabled={busy}>{busy ? 'Creando...' : 'Crear sitio'}</Button></DialogFooter></DialogContent></Dialog>}
              </div>

              {error && <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

              <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="mt-8">
                <TabsContent value="overview" className="mt-0 space-y-8">
                  <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#5f55e5]">Overview</p><div className="grid gap-5 xl:grid-cols-3">{stats.slice(0, 3).map((stat) => <div key={stat.key} className="rounded-[28px] border border-[#d9d3ff] bg-[#f0edff] p-5"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f55e5] text-white"><stat.icon className="h-6 w-6" /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#5b5885]">{stat.label}</p><p className="mt-2 text-4xl font-bold text-[#1b2140]">{stat.value}</p><Progress value={stat.progress} className="mt-5 h-2 bg-white" /><p className="mt-3 text-sm text-[#5b5885]">{stat.detail}</p></div>)}</div></div>
                  <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#5f55e5]">Insights</p><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{stats.slice(3).map((stat) => <div key={stat.key} className="rounded-[28px] border border-[#d9d3ff] bg-[#f0edff] p-5"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f55e5] text-white"><stat.icon className="h-6 w-6" /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#5b5885]">{stat.label}</p><p className="mt-2 text-4xl font-bold text-[#1b2140]">{stat.value}</p><Progress value={stat.progress} className="mt-5 h-2 bg-white" /><p className="mt-3 text-sm text-[#5b5885]">{stat.detail}</p></div>)}</div></div>
                  {data.sites.length === 0 ? <div className="rounded-[28px] border border-dashed border-[#d7d0ff] bg-white px-6 py-14 text-center"><p className="text-2xl font-bold text-[#2c2a54]">Todavia no tienes sitios creados</p><p className="mt-3 text-sm text-[#7b78a6]">Crea tu primer sitio y luego sube la carpeta exportada de tu web.</p><Button variant="cta" className="mt-6 rounded-2xl" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Crear mi primer sitio</Button></div> : <div className="grid gap-5 xl:grid-cols-2">{data.sites.map((site) => { const sslActive = site.sslStatus === 'ACTIVE'; return <div key={site.id} className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_22px_70px_rgba(101,84,210,0.08)]"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-full', sslActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}><ShieldCheck className="h-5 w-5" /></div><div><p className="text-2xl font-bold text-[#2c2a54]">{site.domain}</p><p className="text-sm text-[#7b78a6]">{site.name}</p></div></div><Badge variant="outline" className={cn('mt-3 rounded-full px-3 py-1 text-xs font-semibold', sslActive ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600')}>{sslActive ? 'SSL Activo' : site.sslStatus === 'PENDING' ? 'SSL Pendiente' : 'Sin SSL'}</Badge></div><button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ece8ff] text-[#7b78a6]" onClick={() => setManageSiteId(site.id)}><Upload className="h-4 w-4" /></button></div><p className="mt-5 border-t border-[#f0edff] pt-4 text-base font-medium text-[#5b5885]">{formatStorage(site.storageUsedMb)} usado · {formatStorage(site.storageLimitMb)} total</p><div className="mt-4 flex items-center justify-between text-sm text-[#7b78a6]"><span>Creado {site.createdAgo}</span><span>{site.uploadCount} publicaciones</span></div><div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" className="rounded-xl border-[#d7d0ff] text-[#5f55e5]" onClick={() => setManageSiteId(site.id)}>Administrar</Button><Button variant="outline" className="rounded-xl border-[#ffe1ea] text-[#d44b7e]" onClick={() => deleteSite(site.id, site.domain)} disabled={busy}>{busy ? 'Procesando...' : 'Eliminar'}</Button></div></div>; })}</div>}
                </TabsContent>

                <TabsContent value="plan" className="mt-0"><div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]"><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Capacidad del plan</CardTitle></CardHeader><CardContent className="space-y-4">{[['Websites', `${data.usage.websites.used}/${data.usage.websites.max}`], ['Storage', `${formatStorage(data.usage.storage.usedMb)} / ${formatStorage(data.usage.storage.maxMb)}`], ['Emails', `${data.usage.emails.used}/${data.usage.emails.max}`], ['Bandwidth', `${formatStorage(data.usage.bandwidth.maxMb)} incluidos`], ['SSL', 'Incluido en todos los sitios']].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-[#ece8ff] px-4 py-4"><span className="text-sm font-medium text-[#7b78a6]">{label}</span><span className="text-base font-semibold text-[#2c2a54]">{value}</span></div>)}</CardContent></Card><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Renovacion</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-[#7b78a6]"><p>Tu plan actual es <strong className="text-[#2c2a54]">{data.plan.name}</strong>.</p><div className="rounded-2xl bg-[#f4f2ff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f55e5]">Proxima renovacion</p><p className="mt-2 text-lg font-bold text-[#2c2a54]">{formatDate(data.plan.renewsAt)}</p><p className="mt-1">Monto por ciclo: S/ {data.plan.price}</p></div><Button variant="outline" className="w-full rounded-2xl" asChild><Link href="/web-hosting">Comparar otros planes</Link></Button></CardContent></Card></div></TabsContent>

                <TabsContent value="account" className="mt-0"><div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]"><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Acceso tecnico</CardTitle></CardHeader><CardContent className="space-y-4">{[['Panel', data.account.technicalAccess.panelUrl], ['Usuario', data.account.technicalAccess.username || (data.account.technicalAccess.managedByPlia ? 'Gestionado por PLIA' : 'No disponible')], ['Contrasena', data.account.technicalAccess.password || (data.account.technicalAccess.managedByPlia ? 'Gestionado por PLIA desde este dashboard' : 'Solo disponible en el correo de activacion')]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#ece8ff] px-4 py-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b78a6]">{label}</p><p className="mt-2 text-base font-semibold text-[#2c2a54]">{value}</p></div>)}<Button variant="cta" className="w-full rounded-2xl" asChild><Link href={data.account.technicalAccess.panelUrl} target="_blank"><KeyRound className="mr-2 h-4 w-4" />Abrir panel tecnico</Link></Button></CardContent></Card><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Cuenta</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-[#7b78a6]"><p>Estado: <strong className="text-[#2c2a54]">{data.account.status}</strong></p><p>Paquete real: <strong className="text-[#2c2a54]">{data.account.packageName}</strong></p><p>Usa este panel PLIA para crear sitios y publicar tu web sin meterte al panel tecnico para lo basico.</p>{data.account.technicalAccess.managedByPlia && <p>La gestion tecnica avanzada de esta cuenta esta resguardada por PLIA mientras el aprovisionamiento directo de usuarios en CyberPanel no este disponible en tu servidor.</p>}</CardContent></Card></div></TabsContent>

                <TabsContent value="support" className="mt-0"><div className="grid gap-6 xl:grid-cols-2"><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Ayuda rapida</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-[#7b78a6]"><p>1. Crea el sitio desde Mis Sitios.</p><p>2. Entra a Administrar.</p><p>3. Sube la carpeta exportada de tu web con index.html.</p><p>4. Abre la URL publica y revisa.</p></CardContent></Card><Card className="rounded-[32px] border-white/80 shadow-[0_18px_80px_rgba(101,84,210,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#2c2a54]">Contacto</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-[#7b78a6]"><p>Si necesitas ayuda con dominios, DNS, SSL o publicacion, escribenos y te orientamos.</p><Button variant="cta" className="w-full rounded-2xl" asChild><Link href="/contacto">Hablar con soporte</Link></Button></CardContent></Card></div></TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(currentSite)} onOpenChange={(open) => !open && setManageSiteId(null)}>
        <DialogContent className="max-w-3xl rounded-[30px]">
          <DialogHeader><DialogTitle>Administrar sitio</DialogTitle><DialogDescription>Sube la carpeta exportada completa de tu web. El deploy reemplazara el contenido actual.</DialogDescription></DialogHeader>
          {currentSite && <div className="grid gap-6 py-2 lg:grid-cols-[1fr_0.9fr]"><div className="space-y-4"><div className="rounded-2xl border border-[#ece8ff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b78a6]">Dominio</p><p className="mt-2 text-lg font-bold text-[#2c2a54]">{currentSite.domain}</p></div><div className="rounded-2xl border border-dashed border-[#d7d0ff] bg-[#faf9ff] p-5"><p className="text-base font-semibold text-[#2c2a54]">Subir carpeta del sitio</p><p className="mt-2 text-sm text-[#7b78a6]">Selecciona la carpeta exportada. Debe contener index.html en la raiz final del deploy.</p><input ref={uploadInputRef} type="file" multiple className="mt-4 block w-full text-sm text-[#5b5885]" onChange={(e) => uploadFolder(e.target.files)} /><Button variant="cta" className="mt-4 rounded-2xl" onClick={() => uploadInputRef.current?.click()} disabled={busy}><Upload className="mr-2 h-4 w-4" />{busy ? 'Publicando...' : 'Seleccionar carpeta y publicar'}</Button></div></div><div className="space-y-4"><div className="rounded-2xl border border-[#ece8ff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b78a6]">Estado</p><p className="mt-2 text-base font-semibold text-[#2c2a54]">{currentSite.status}</p><p className="mt-1 text-sm text-[#7b78a6]">SSL: {currentSite.sslStatus}</p></div><div className="rounded-2xl border border-[#ece8ff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b78a6]">Ultima publicacion</p><p className="mt-2 text-base font-semibold text-[#2c2a54]">{formatDate(currentSite.lastDeployedAt)}</p><p className="mt-1 text-sm text-[#7b78a6]">{currentSite.uploadCount} publicaciones realizadas</p></div><Button variant="outline" className="w-full rounded-2xl" asChild><Link href={currentSite.publicUrl} target="_blank">Abrir sitio publicado</Link></Button></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setManageSiteId(null)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
