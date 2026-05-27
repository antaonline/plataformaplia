'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  HardDriveDownload,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type BackupsData = {
  retention: number;
  sites: Array<{
    siteId: number;
    domain: string;
    name: string;
    backups: Array<{
      filename: string;
      sizeMb: number;
      createdAt: string;
    }>;
  }>;
};

export default function HostingBackupsPage() {
  const [data, setData] = useState<BackupsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSite, setCreatingSite] = useState<number | null>(null);

  const [restoreTarget, setRestoreTarget] = useState<{
    siteId: number;
    domain: string;
    filename: string;
  } | null>(null);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoring, setRestoring] = useState(false);

  const load = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/hosting/backups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = (await res.text()) || 'No se pudo cargar.';
        throw new Error(txt);
      }
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar los backups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBackupNow = async (siteId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setCreatingSite(siteId);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/hosting/backups/${siteId}/create-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const respData = await res.json();
      if (!res.ok) throw new Error(respData?.message || 'No se pudo crear el backup.');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear el backup.');
    } finally {
      setCreatingSite(null);
    }
  };

  const downloadBackup = (siteId: number, filename: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    // Generamos URL con token en query para descarga simple, o usamos fetch+blob.
    // Por seguridad usamos fetch + blob.
    fetch(`${apiBase}/hosting/backups/${siteId}/download/${filename}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => setError(err?.message ?? 'No se pudo descargar.'));
  };

  const submitRestore = async () => {
    if (!restoreTarget) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setRestoring(true);
    try {
      const res = await fetch(
        `${apiBase}/hosting/backups/${restoreTarget.siteId}/restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: restoreTarget.filename,
            confirmDomain: restoreInput.trim(),
          }),
        },
      );
      const respData = await res.json();
      if (!res.ok) throw new Error(respData?.message || 'No se pudo restaurar.');
      setRestoreTarget(null);
      setRestoreInput('');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo restaurar.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Cargando backups...</div>;
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
              <h1 className="text-2xl font-bold text-foreground">Backups automaticos</h1>
              <p className="text-sm text-muted-foreground">
                Se generan el dia 1 de cada mes. Retencion: {data?.retention ?? 3} backups por sitio.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!data?.sites.length ? (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center">
              <p className="text-sm text-muted-foreground">No tienes sitios para respaldar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {data.sites.map((site) => (
              <Card key={site.siteId} className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{site.domain}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {site.backups.length} backup{site.backups.length === 1 ? '' : 's'} disponibles
                    </p>
                  </div>
                  <Button
                    variant="cta"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => createBackupNow(site.siteId)}
                    disabled={creatingSite === site.siteId}
                  >
                    {creatingSite === site.siteId ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" /> Crear backup manual
                      </>
                    )}
                  </Button>
                </div>
                {site.backups.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <HardDriveDownload className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Aun no hay backups para este sitio.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {site.backups.map((b) => (
                      <div key={b.filename} className="px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-cta/10 flex items-center justify-center">
                            <HardDriveDownload className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(b.createdAt).toLocaleDateString('es-PE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {b.sizeMb} MB · {b.filename}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs"
                            onClick={() => downloadBackup(site.siteId, b.filename)}
                          >
                            Descargar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() =>
                              setRestoreTarget({
                                siteId: site.siteId,
                                domain: site.domain,
                                filename: b.filename,
                              })
                            }
                          >
                            Restaurar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal Restaurar */}
        <Dialog
          open={!!restoreTarget}
          onOpenChange={(open) => {
            if (!open) {
              setRestoreTarget(null);
              setRestoreInput('');
            }
          }}
        >
          <DialogContent className="rounded-[28px] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Restaurar backup
              </DialogTitle>
              <DialogDescription>
                Esto reemplazara todo el contenido actual de tu sitio con el del backup. La operacion es irreversible.
              </DialogDescription>
            </DialogHeader>
            {restoreTarget && (
              <div className="space-y-3 py-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sitio:</span>
                    <span className="font-bold">{restoreTarget.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Backup:</span>
                    <span className="font-mono text-xs">{restoreTarget.filename}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Escribe el dominio para confirmar
                  </label>
                  <Input
                    className="mt-1"
                    placeholder={restoreTarget.domain}
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={submitRestore}
                disabled={
                  restoring ||
                  restoreInput.trim().toLowerCase() !==
                    (restoreTarget?.domain.toLowerCase() || '')
                }
              >
                {restoring ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Restaurando...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" /> Restaurar definitivamente
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
