'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  User as UserIcon,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE ?? 'plia.pe';

type DashboardData = {
  account: {
    status: string;
    packageName: string;
    technicalAccess: {
      panelUrl: string;
      username: string | null;
      password: string | null;
      managedByPlia?: boolean;
    };
  };
  plan: { name: string; billingCycleMonths: number; renewsAt: string | null; price: number };
  usage: {
    websites: { used: number; max: number };
    storage: { usedMb: number; maxMb: number };
    emails: { used: number; max: number };
    bandwidth: { usedMb: number; maxMb: number };
    wordpress: { used: number; max: number };
    ssl: { active: number; total: number };
  };
  sites: Array<{
    id: number;
    name: string;
    domain: string;
    publicUrl: string;
    status: string;
    sslStatus: string;
    storageUsedMb: number;
    storageLimitMb: number;
    uploadCount: number;
    lastDeployedAt: string | null;
    createdAgo: string;
  }>;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

const tabs = [
  { id: 'overview', label: 'Mis Sitios', icon: Globe },
  { id: 'plan', label: 'Mi Plan', icon: BarChart3 },
  { id: 'billing', label: 'Facturacion', icon: CreditCard },
  { id: 'account', label: 'Mi Cuenta', icon: KeyRound },
  { id: 'support', label: 'Soporte', icon: Headphones },
] as const;

const formatStorage = (value: number) => (value >= 1024 ? `${(value / 1024).toFixed(1)} GB` : `${value} MB`);
const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Sin fecha';

export default function HostingDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [manageSiteId, setManageSiteId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    mode: 'subdomain' as 'subdomain' | 'custom',
    subdomain: '',
    domain: '',
  });
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewMethod, setRenewMethod] = useState<'card' | 'yape' | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewals, setRenewals] = useState<any[]>([]);
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
      // Cargar datos de usuario
      const meRes = await fetch(`${apiBase}/auth/me`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        setUser(await meRes.json());
      }

      // Cargar datos de hosting
      const res = await fetch(`${apiBase}/hosting/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo cargar el dashboard de hosting.');
      setData(await res.json());

      // Cargar historial de renovaciones
      const renRes = await fetch(`${apiBase}/subscriptions/renewals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (renRes.ok) {
        setRenewals(await renRes.json());
      }
      
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar el dashboard de hosting.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const input = uploadInputRef.current as (HTMLInputElement & { webkitdirectory?: boolean }) | null;
    if (input) input.webkitdirectory = true;
  }, [manageSiteId]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'websites',
        icon: Globe,
        label: 'Websites',
        value: `${data.usage.websites.used}/${data.usage.websites.max}`,
        detail: `${data.usage.websites.max - data.usage.websites.used} espacios disponibles`,
        progress: data.usage.websites.max ? (data.usage.websites.used / data.usage.websites.max) * 100 : 0,
      },
      {
        key: 'storage',
        icon: HardDrive,
        label: 'Storage',
        value: `${data.usage.storage.usedMb}/${data.usage.storage.maxMb}`,
        detail: `${formatStorage(data.usage.storage.usedMb)} de ${formatStorage(data.usage.storage.maxMb)}`,
        progress: data.usage.storage.maxMb ? (data.usage.storage.usedMb / data.usage.storage.maxMb) * 100 : 0,
      },
      {
        key: 'emails',
        icon: Mail,
        label: 'Emails',
        value: `${data.usage.emails.used}/${data.usage.emails.max}`,
        detail: `${data.usage.emails.max - data.usage.emails.used} cuentas disponibles`,
        progress: data.usage.emails.max ? (data.usage.emails.used / data.usage.emails.max) * 100 : 0,
      },
      {
        key: 'bandwidth',
        icon: Rocket,
        label: 'Bandwidth',
        value: `${data.usage.bandwidth.usedMb}/${data.usage.bandwidth.maxMb}`,
        detail: `${formatStorage(data.usage.bandwidth.maxMb)} incluidos`,
        progress: data.usage.bandwidth.maxMb ? (data.usage.bandwidth.usedMb / data.usage.bandwidth.maxMb) * 100 : 0,
      },
      {
        key: 'ssl',
        icon: ShieldCheck,
        label: 'SSL',
        value: `${data.usage.ssl.active}/${data.usage.ssl.total}`,
        detail: 'Sitios con certificado activo',
        progress: data.usage.ssl.total ? (data.usage.ssl.active / data.usage.ssl.total) * 100 : 0,
      },
      {
        key: 'wordpress',
        icon: LayoutDashboard,
        label: 'WordPress',
        value: `${data.usage.wordpress.used}/${data.usage.websites.max}`,
        detail: 'Instalaciones WordPress operando',
        progress: data.usage.websites.max ? (data.usage.wordpress.used / data.usage.websites.max) * 100 : 0,
      },
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

  const handleLogout = async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('2fa_userId');
      window.location.href = '/login';
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Cargando dashboard de hosting...</div>;
  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>No hay una cuenta de hosting lista todavia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="cta" asChild>
              <Link href="/web-hosting">Ver planes de hosting</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col border-r border-border bg-white/80 backdrop-blur-sm min-h-screen px-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image src="/iconplia.svg" alt="Icono PLIA" width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11" />
            </div>
            <div>
              <div className="font-semibold">Tu Web Fácil</div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <button
              onClick={() => setTab('overview')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                tab === 'overview' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab('plan')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                tab === 'plan' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              Mi plan
            </button>
            <button
              onClick={() => setTab('account')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                tab === 'account' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              Mi cuenta
            </button>
            <button
              onClick={() => setTab('support')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                tab === 'support' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              Soporte
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground"
              onClick={() => setAdvancedOpen(true)}
            >
              Configuracion avanzada
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-cta/10 p-4 border border-cta/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cta-foreground/70">Plan Activo</p>
            <p className="mt-1 text-sm font-bold text-foreground">{data.plan.name}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Renueva el {formatDate(data.plan.renewsAt)}</p>
            <Button variant="outline" size="sm" className="mt-3 w-full h-8 text-[11px] rounded-lg" asChild>
              <Link href="/web-hosting">Ver planes</Link>
            </Button>
          </div>

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            <p>Soporte 24/7</p>
            <p>soporte@plia.pe</p>
          </div>
        </aside>

        <main className="min-h-screen">
          <header className="bg-white/80 border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {tab === 'overview' ? 'Mis Sitios' : tab === 'plan' ? 'Mi Plan' : tab === 'account' ? 'Mi Cuenta' : 'Soporte'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tab === 'overview'
                  ? 'Crea sitios, sube tu web y controla el estado de tu hosting.'
                  : tab === 'plan'
                    ? 'Revisa limites reales y renovacion.'
                    : tab === 'account'
                      ? 'Acceso tecnico y datos de cuenta.'
                      : 'Ayuda rapida para publicar y operar.'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/contacto">Soporte</Link>
              </Button>
              {tab === 'overview' && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="cta">
                      <Plus className="mr-2 h-4 w-4" /> Crear Nueva Web
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl rounded-[28px]">
                    <DialogHeader>
                      <DialogTitle>Crear nuevo sitio</DialogTitle>
                      <DialogDescription>Usa un subdominio de PLIA o tu propio dominio.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <Input
                        value={createForm.name}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre del sitio"
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          className={cn(
                            'rounded-2xl border px-4 py-4 text-left transition',
                            createForm.mode === 'subdomain' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted'
                          )}
                          onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'subdomain' }))}
                        >
                          <p className="font-semibold text-sm">Subdominio PLIA</p>
                          <p className="mt-1 text-xs text-muted-foreground">Ideal para salir rapido</p>
                        </button>
                        <button
                          type="button"
                          className={cn(
                            'rounded-2xl border px-4 py-4 text-left transition',
                            createForm.mode === 'custom' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted'
                          )}
                          onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'custom' }))}
                        >
                          <p className="font-semibold text-sm">Dominio propio</p>
                          <p className="mt-1 text-xs text-muted-foreground">Para marcas ya publicadas</p>
                        </button>
                      </div>
                      {createForm.mode === 'subdomain' ? (
                        <div className="flex items-center rounded-xl border border-input bg-background px-3">
                          <input
                            value={createForm.subdomain}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, subdomain: e.target.value }))}
                            className="h-11 flex-1 bg-transparent outline-none text-sm"
                            placeholder="mi-negocio"
                          />
                          <span className="text-sm text-muted-foreground">.{domainBase}</span>
                        </div>
                      ) : (
                        <Input
                          value={createForm.domain}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, domain: e.target.value }))}
                          placeholder="midominio.com"
                        />
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="cta" onClick={createSite} disabled={busy}>
                        {busy ? 'Creando...' : 'Crear sitio'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <div className="relative">
                <button
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-white"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <span className="text-sm font-medium">{user?.name || 'Usuario'}</span>
                  <span className="w-8 h-8 rounded-full bg-cta flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-cta-foreground" />
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-white shadow-md z-10 text-sm">
                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
                      <UserIcon className="w-4 h-4" /> Perfil
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted"
                      onClick={() => {
                        setTab('plan');
                        setMenuOpen(false);
                      }}
                    >
                      <CreditCard className="w-4 h-4" /> Mi plan
                    </button>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
                      <Settings className="w-4 h-4" /> Configuracion
                    </Link>
                    <Link href="/contacto" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
                      <LifeBuoy className="w-4 h-4" /> Soporte
                    </Link>
                    <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted text-destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" /> Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuracion avanzada</DialogTitle>
                <DialogDescription>
                  Esta seccion es para ajustes tecnicos. Si cambias algo sin conocerlo, tu web o el servidor podrian dejar de funcionar.
                  Entra solo si estas seguro.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvancedOpen(false);
                    window.open('https://142.171.227.112:8090/', '_blank', 'noopener,noreferrer');
                  }}
                >
                  Entendido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-8 space-y-8">
            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
              <TabsContent value="overview" className="mt-0 space-y-8">
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overview</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {stats.slice(0, 3).map((stat) => (
                        <div key={stat.key} className="rounded-2xl border border-border bg-muted/30 p-5 group hover:border-cta/50 transition-colors">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border text-foreground group-hover:bg-cta group-hover:text-cta-foreground group-hover:border-cta transition-colors">
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                          <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                          <Progress value={stat.progress} className="mt-5 h-1.5" />
                          <p className="mt-3 text-[11px] text-muted-foreground">{stat.detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Insights</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {stats.slice(3).map((stat) => (
                        <div key={stat.key} className="rounded-2xl border border-border bg-muted/30 p-5 group hover:border-cta/50 transition-colors">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border text-foreground group-hover:bg-cta group-hover:text-cta-foreground group-hover:border-cta transition-colors">
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                          <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                          <Progress value={stat.progress} className="mt-5 h-1.5" />
                          <p className="mt-3 text-[11px] text-muted-foreground">{stat.detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Tus sitios web</h2>
                    {data.sites.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo sitio
                      </Button>
                    )}
                  </div>

                  {data.sites.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
                      <p className="text-xl font-bold text-foreground">Todavia no tienes sitios creados</p>
                      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                        Crea tu primer sitio y luego sube la carpeta exportada de tu web.
                      </p>
                      <Button variant="cta" className="mt-6 px-8" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Crear mi primer sitio
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {data.sites.map((site) => {
                        const sslActive = site.sslStatus === 'ACTIVE';
                        return (
                          <Card key={site.id} className="rounded-2xl border-border/60 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="p-5">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground leading-none">{site.domain}</h3>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider',
                                        sslActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                      )}
                                    >
                                      {sslActive ? 'SSL Activo' : 'Sin SSL'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{site.name}</p>
                                </div>
                                <button
                                  type="button"
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                                  onClick={() => setManageSiteId(site.id)}
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-6 flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <span>{formatStorage(site.storageUsedMb)} usado</span>
                                  <span>·</span>
                                  <span>{site.uploadCount} deploys</span>
                                </div>
                                <span className="text-muted-foreground">Creado {site.createdAgo}</span>
                              </div>
                            </div>
                            <div className="bg-muted/30 px-5 py-3 border-t border-border flex items-center justify-between">
                              <Button variant="link" className="h-auto p-0 text-cta text-xs font-bold" asChild>
                                <Link href={site.publicUrl} target="_blank">
                                  Ver sitio <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                              <Button variant="ghost" className="h-auto p-0 text-muted-foreground text-xs font-medium" onClick={() => setManageSiteId(site.id)}>
                                Administrar
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="plan" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Capacidad del plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        ['Websites', `${data.usage.websites.used}/${data.usage.websites.max}`],
                        ['Storage', `${formatStorage(data.usage.storage.usedMb)} / ${formatStorage(data.usage.storage.maxMb)}`],
                        ['Emails', `${data.usage.emails.used}/${data.usage.emails.max}`],
                        ['Bandwidth', `${formatStorage(data.usage.bandwidth.maxMb)} incluidos`],
                        ['SSL', 'Incluido en todos los sitios'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                          <span className="text-sm font-bold text-foreground">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Renovacion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Tu plan actual es <strong className="text-foreground">{data.plan.name}</strong>.
                      </p>
                      <div className="rounded-2xl bg-muted/30 border border-border p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-cta-foreground/70">Proxima renovacion</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{formatDate(data.plan.renewsAt)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Monto por ciclo: S/ {data.plan.price}</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl" asChild>
                        <Link href="/web-hosting">Comparar otros planes</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Metodo de pago</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.plan.price > 0 ? (
                        <div className="rounded-2xl border border-border p-5 bg-white">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">Tarjeta de credito/debito</p>
                              <p className="text-xs text-muted-foreground">
                                {data.plan.price > 0 
                                  ? 'Cobro automatico activo para renovacion.' 
                                  : 'No hay tarjeta registrada.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                          <p className="text-sm text-muted-foreground">No tienes un metodo de pago guardado.</p>
                        </div>
                      )}
                      
                      <div className="rounded-2xl bg-cta/5 border border-cta/20 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-widest text-cta-foreground/70">Monto de renovacion</p>
                          <span className="text-lg font-bold text-foreground">S/ {data.plan.price}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">Suscripcion anual por hosting y dominio.</p>
                      </div>

                      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
                        <DialogTrigger asChild>
                          <Button variant="cta" className="w-full rounded-xl">
                            Renovar ahora (Pago manual)
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[28px]">
                          <DialogHeader>
                            <DialogTitle>Renovar Suscripcion</DialogTitle>
                            <DialogDescription>
                              Elige tu metodo de pago para renovar por un año mas.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-3 py-4">
                            <button
                              type="button"
                              className={cn(
                                'h-24 rounded-2xl border text-left px-4 py-3 transition',
                                renewMethod === 'yape' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted'
                              )}
                              onClick={() => setRenewMethod('yape')}
                            >
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">Pago con</p>
                              <p className="text-lg font-bold">Yape</p>
                            </button>
                            <button
                              type="button"
                              className={cn(
                                'h-24 rounded-2xl border text-left px-4 py-3 transition',
                                renewMethod === 'card' ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted'
                              )}
                              onClick={() => setRenewMethod('card')}
                            >
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">Pago con</p>
                              <p className="text-lg font-bold">Tarjeta</p>
                            </button>
                          </div>
                          {renewError && <p className="text-xs text-destructive text-center">{renewError}</p>}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setRenewOpen(false)}>Cancelar</Button>
                            <Button variant="cta" disabled={renewLoading || !renewMethod} onClick={() => {}}>
                              {renewLoading ? 'Procesando...' : 'Ir a pagar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Historial de pagos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 border-b border-border">
                            <tr>
                              <th className="px-4 py-2 text-left font-bold text-[10px] uppercase">Fecha</th>
                              <th className="px-4 py-2 text-left font-bold text-[10px] uppercase">Monto</th>
                              <th className="px-4 py-2 text-left font-bold text-[10px] uppercase">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/50">
                              <td className="px-4 py-3 text-xs">{formatDate(data.plan.renewsAt ? new Date(new Date(data.plan.renewsAt).setFullYear(new Date(data.plan.renewsAt).getFullYear() - 1)).toISOString() : null)}</td>
                              <td className="px-4 py-3 text-xs font-bold text-foreground">S/ {data.plan.price}</td>
                              <td className="px-4 py-3 text-xs">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-[10px]">Pagado</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center">
                        Solo se muestran los ultimos pagos realizados.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Acceso tecnico</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        ['Panel', data.account.technicalAccess.panelUrl],
                        [
                          'Usuario',
                          data.account.technicalAccess.username ||
                            (data.account.technicalAccess.managedByPlia ? 'Gestionado por PLIA' : 'No disponible'),
                        ],
                        [
                          'Contrasena',
                          data.account.technicalAccess.password ||
                            (data.account.technicalAccess.managedByPlia
                              ? 'Gestionado por PLIA desde este dashboard'
                              : 'Solo disponible en el correo de activacion'),
                        ],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-border px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                          <p className="mt-1 text-sm font-bold text-foreground break-all">{value}</p>
                        </div>
                      ))}
                      <Button variant="cta" className="w-full rounded-xl" asChild>
                        <Link href={data.account.technicalAccess.panelUrl} target="_blank">
                          <KeyRound className="mr-2 h-4 w-4" /> Abrir panel tecnico
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Estado</span>
                        <Badge variant="outline" className="bg-cta/10 text-cta-foreground border-cta/20 rounded-full">{data.account.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Paquete</span>
                        <span className="font-bold text-foreground">{data.account.packageName}</span>
                      </div>
                      <p className="pt-4 border-t border-border">
                        Usa este panel PLIA para crear sitios y publicar tu web sin meterte al panel tecnico para lo basico.
                      </p>
                      {data.account.technicalAccess.managedByPlia && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">
                          La gestion tecnica avanzada de esta cuenta esta resguardada por PLIA mientras el aprovisionamiento directo de usuarios en CyberPanel no este disponible en tu servidor.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Ayuda rapida</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        '1. Crea el sitio desde Mis Sitios.',
                        '2. Entra a Administrar.',
                        '3. Sube la carpeta exportada de tu web con index.html.',
                        '4. Abre la URL publica y revisa.',
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                          <span className="text-muted-foreground">{step.slice(3)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Si necesitas ayuda con dominios, DNS, SSL o publicacion, escribenos y te orientamos.
                      </p>
                      <Button variant="cta" className="w-full rounded-xl" asChild>
                        <Link href="/contacto">Hablar con soporte</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={Boolean(currentSite)} onOpenChange={(open) => !open && setManageSiteId(null)}>
        <DialogContent className="max-w-3xl rounded-[30px]">
          <DialogHeader>
            <DialogTitle>Administrar sitio</DialogTitle>
            <DialogDescription>
              Sube la carpeta exportada completa de tu web. El deploy reemplazara el contenido actual.
            </DialogDescription>
          </DialogHeader>
          {currentSite && (
            <div className="grid gap-6 py-2 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border p-4 bg-muted/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dominio</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{currentSite.domain}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-5">
                  <p className="text-sm font-bold text-foreground">Subir carpeta del sitio</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Selecciona la carpeta exportada. Debe contener index.html en la raiz.
                  </p>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadFolder(e.target.files)}
                  />
                  <Button variant="cta" className="mt-6 w-full rounded-xl" onClick={() => uploadInputRef.current?.click()} disabled={busy}>
                    <Upload className="mr-2 h-4 w-4" />
                    {busy ? 'Publicando...' : 'Seleccionar carpeta y publicar'}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{currentSite.status}</p>
                    <Badge variant="outline" className="text-[10px] font-bold">{currentSite.sslStatus}</Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ultima publicacion</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{formatDate(currentSite.lastDeployedAt)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{currentSite.uploadCount} publicaciones realizadas</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link href={currentSite.publicUrl} target="_blank">
                    Abrir sitio publicado
                  </Link>
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setManageSiteId(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
