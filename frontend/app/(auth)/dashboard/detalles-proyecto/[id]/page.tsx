'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type Project = {
  id: number;
  name: string;
  type: 'LANDING' | 'WEB';
  status: string;
  onboardingData: any;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order?: {
    plan?: {
      id: number;
      name: string;
      price: number;
    };
  };
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/admin/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.message || 'No se pudo cargar el proyecto');
        setProject(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar el proyecto');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) load();
  }, [projectId]);

  const updateOnboarding = (patch: Record<string, any>) => {
    if (!project) return;
    setProject({
      ...project,
      onboardingData: {
        ...(project.onboardingData || {}),
        ...patch,
      },
    });
  };

  const publishProject = async () => {
    if (!project) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setSaving(true);
    try {
      await fetch(`${apiBase}/admin/projects/${project.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publicUrl: project.onboardingData?.publicUrl || '' }),
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDbConfig = async () => {
    if (!project) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setDbSaving(true);
    try {
      await fetch(`${apiBase}/admin/projects/${project.id}/db-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dbName: project.onboardingData?.dbName || '',
          dbUser: project.onboardingData?.dbUser || '',
          dbPassword: project.onboardingData?.dbPassword || '',
        }),
      });
    } finally {
      setDbSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section-container py-16">
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-container py-16">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col border-r border-border bg-white/80 backdrop-blur-sm min-h-screen px-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-cta rounded-xl flex items-center justify-center">
              <span className="font-black text-cta-foreground text-lg">P</span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">PLIA</div>
              <div className="font-semibold">Tu Web Facil</div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <Link className="block w-full px-3 py-2 rounded-lg hover:bg-muted" href="/dashboard">Dashboard</Link>
            <Link className="block w-full px-3 py-2 rounded-lg bg-muted text-foreground" href="#">Detalle del proyecto</Link>
            <Link className="block w-full px-3 py-2 rounded-lg hover:bg-muted" href="/contacto">Soporte</Link>
          </div>

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            <p>Soporte 24/7</p>
            <p>help@plia.pe</p>
          </div>
        </aside>

        <main className="min-h-screen">
          <header className="bg-white/80 border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Detalle del proyecto</h1>
              <p className="text-sm text-muted-foreground">Revisa la informacion enviada por el cliente.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Volver</Link>
              </Button>
            </div>
          </header>

          <div className="px-6 py-8 space-y-6">
            <Card className="rounded-lg border-border/60">
              <CardHeader>
                <CardTitle>Resumen del cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{project.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{project.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{project.order?.plan?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-semibold">{project.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{project.type}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Brief del cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                <div><strong>Empresa:</strong> {project.onboardingData?.businessName || '-'}</div>
                <div><strong>Rubro:</strong> {project.onboardingData?.businessSector || '-'}</div>
                <div><strong>Ciudad:</strong> {project.onboardingData?.city || '-'}</div>
                <div><strong>Objetivo:</strong> {project.onboardingData?.goal || '-'}</div>
                <div><strong>Publico:</strong> {(project.onboardingData?.audience || []).join(', ') || '-'}</div>
                <div><strong>Colores:</strong> {project.onboardingData?.colors || '-'}</div>
                <div><strong>Referencias:</strong> {project.onboardingData?.references || '-'}</div>
                <div><strong>Logo:</strong> {project.onboardingData?.logoUrl || 'No'}</div>
                <div><strong>Instagram:</strong> {project.onboardingData?.instagram || '-'}</div>
                <div><strong>Facebook:</strong> {project.onboardingData?.facebook || '-'}</div>
                <div><strong>WhatsApp:</strong> {project.onboardingData?.whatsapp || '-'}</div>
                <div><strong>Correo:</strong> {project.onboardingData?.contactEmail || '-'}</div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle>Publicar proyecto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="text-xs text-muted-foreground">URL publica</label>
                  <Input
                    value={project.onboardingData?.publicUrl || ''}
                    onChange={(e) => updateOnboarding({ publicUrl: e.target.value })}
                  />
                  <Button variant="cta" className="w-full" onClick={publishProject} disabled={saving}>
                    {saving ? 'Guardando...' : 'Marcar como publicado'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle>Configurar base de datos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Nombre de DB"
                    value={project.onboardingData?.dbName || ''}
                    onChange={(e) => updateOnboarding({ dbName: e.target.value })}
                  />
                  <Input
                    placeholder="Usuario DB"
                    value={project.onboardingData?.dbUser || ''}
                    onChange={(e) => updateOnboarding({ dbUser: e.target.value })}
                  />
                  <Input
                    placeholder="Password DB"
                    value={project.onboardingData?.dbPassword || ''}
                    onChange={(e) => updateOnboarding({ dbPassword: e.target.value })}
                  />
                  <Button variant="outline" className="w-full" onClick={saveDbConfig} disabled={dbSaving}>
                    {dbSaving ? 'Guardando...' : 'Guardar configuracion DB'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
