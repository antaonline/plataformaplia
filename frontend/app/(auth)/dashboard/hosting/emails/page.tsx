'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type MailboxData = {
  webmailUrl: string;
  maxMailboxes: number;
  sites: Array<{
    id: number;
    domain: string;
    name: string;
    mailboxesPerSite: number;
    mailboxes: Array<{
      id: number;
      email: string;
      status: string;
      createdAt: string;
    }>;
  }>;
};

const buildStrongPassword = (length = 14) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  let value =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)];
  while (value.length < length) value += all[Math.floor(Math.random() * all.length)];
  return value
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

export default function HostingMailboxesPage() {
  const [data, setData] = useState<MailboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSiteId, setCreateSiteId] = useState<number | null>(null);
  const [localPart, setLocalPart] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  const [successCreds, setSuccessCreds] = useState<{
    email: string;
    password: string;
    webmailUrl: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; email: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/hosting/mailboxes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo cargar.');
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar los correos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalMailboxes = useMemo(
    () => (data ? data.sites.reduce((acc, s) => acc + s.mailboxes.length, 0) : 0),
    [data],
  );

  const openCreate = (siteId?: number) => {
    if (!data) return;
    setCreateSiteId(siteId ?? data.sites[0]?.id ?? null);
    setLocalPart('');
    setPassword(buildStrongPassword());
    setShowPass(false);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!createSiteId || !localPart.trim() || !password.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch(`${apiBase}/hosting/mailboxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteId: createSiteId,
          localPart: localPart.trim(),
          password,
        }),
      });
      const respData = await res.json();
      if (!res.ok) throw new Error(respData?.message || 'No se pudo crear el correo.');
      setSuccessCreds({
        email: respData.email,
        password,
        webmailUrl: respData.webmailUrl,
      });
      setCreateOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear el correo.');
    } finally {
      setCreating(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/hosting/mailboxes/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo eliminar.');
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo eliminar el correo.');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Cargando correos...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link href="/dashboard/hosting">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tus correos</h1>
              <p className="text-sm text-muted-foreground">
                {totalMailboxes} de {data?.maxMailboxes ?? 0} cuentas en uso
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="cta" onClick={() => openCreate()} disabled={!data?.sites.length}>
              <Plus className="mr-2 h-4 w-4" /> Crear correo
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!data?.sites.length ? (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Necesitas crear un sitio web antes de configurar correos.
              </p>
              <Button variant="cta" className="mt-4" asChild>
                <Link href="/dashboard/hosting">Ir a mis sitios</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {data.sites.map((site) => (
              <Card key={site.id} className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{site.domain}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {site.mailboxes.length} de {site.mailboxesPerSite} cuentas usadas
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openCreate(site.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Crear
                  </Button>
                </div>
                {site.mailboxes.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Mail className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Aun no hay correos para este dominio.
                    </p>
                    <Button
                      variant="cta"
                      size="sm"
                      className="mt-4"
                      onClick={() => openCreate(site.id)}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Crear primer correo
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {site.mailboxes.map((m) => (
                      <div key={m.id} className="px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-cta/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{m.email}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Activo · creado{' '}
                              {new Date(m.createdAt).toLocaleDateString('es-PE', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs"
                            asChild
                          >
                            <a
                              href={data.webmailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> Webmail
                            </a>
                          </Button>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center"
                            onClick={() =>
                              setDeleteTarget({ id: m.id, email: m.email })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal Crear */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="rounded-[28px] max-w-md">
            <DialogHeader>
              <DialogTitle>Crear cuenta de correo</DialogTitle>
              <DialogDescription>
                Tu nuevo correo estara disponible inmediatamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Direccion
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-input bg-background overflow-hidden">
                  <input
                    value={localPart}
                    onChange={(e) =>
                      setLocalPart(
                        e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''),
                      )
                    }
                    className="h-11 flex-1 px-3 bg-transparent outline-none text-sm"
                    placeholder="contacto"
                    autoFocus
                  />
                  {data && data.sites.length > 1 ? (
                    <select
                      value={createSiteId ?? ''}
                      onChange={(e) => setCreateSiteId(Number(e.target.value))}
                      className="h-11 bg-muted/30 px-3 text-sm border-l border-input outline-none"
                    >
                      {data.sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          @{s.domain}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="h-11 flex items-center px-3 text-sm text-muted-foreground bg-muted/30 border-l border-input">
                      @{data?.sites.find((s) => s.id === createSiteId)?.domain ?? '...'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Contrasena
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="flex-1 flex items-center rounded-xl border border-input bg-background overflow-hidden">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 flex-1 px-3 bg-transparent outline-none text-sm"
                    />
                    <button
                      type="button"
                      className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl text-xs"
                    onClick={() => {
                      setPassword(buildStrongPassword());
                      setShowPass(true);
                    }}
                  >
                    Generar segura
                  </Button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Minimo 8 caracteres. Te la mostraremos una sola vez al terminar.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button variant="cta" onClick={submitCreate} disabled={creating}>
                {creating ? 'Creando...' : 'Crear correo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Exito con credenciales */}
        <Dialog open={!!successCreds} onOpenChange={(open) => !open && setSuccessCreds(null)}>
          <DialogContent className="rounded-[28px] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-700" />
                </span>
                Correo creado
              </DialogTitle>
              <DialogDescription>
                Guarda estas credenciales. La contrasena no se mostrara de nuevo.
              </DialogDescription>
            </DialogHeader>
            {successCreds && (
              <div className="space-y-3 py-2">
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Direccion
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {successCreds.email}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-cta-foreground hover:underline flex items-center gap-1 shrink-0"
                        onClick={() => copyToClipboard(successCreds.email, 'email')}
                      >
                        {copiedField === 'email' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedField === 'email' ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Contrasena
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {successCreds.password}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-cta-foreground hover:underline flex items-center gap-1 shrink-0"
                        onClick={() => copyToClipboard(successCreds.password, 'password')}
                      >
                        {copiedField === 'password' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedField === 'password' ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="cta"
                  className="w-full rounded-xl"
                  onClick={() =>
                    copyToClipboard(
                      `${successCreds.email}\n${successCreds.password}`,
                      'both',
                    )
                  }
                >
                  {copiedField === 'both' ? (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Credenciales copiadas
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" /> Copiar credenciales
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <a
                    href={successCreds.webmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Abrir webmail
                  </a>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Eliminar */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent className="rounded-[28px] max-w-sm">
            <DialogHeader>
              <DialogTitle>Eliminar cuenta de correo</DialogTitle>
              <DialogDescription>
                Esta accion no se puede deshacer. Los correos almacenados en
                esta cuenta se perderan.
              </DialogDescription>
            </DialogHeader>
            {deleteTarget && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-foreground">
                {deleteTarget.email}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={submitDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
