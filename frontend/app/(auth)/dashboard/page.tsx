'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { User as UserIcon, Settings, CreditCard, LifeBuoy, LogOut } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

type Project = {
  id: number;
  name: string;
  type: 'LANDING' | 'WEB';
  status: string;
  onboardingStep: number;
  onboardingData: any;
  startedAt: string | null;
  deadline: string | null;
  order?: {
    plan?: {
      id: number;
      name: string;
      price: number;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

const audienceOptions = [
  'Emprendedores',
  'Negocios locales',
  'Empresas B2B',
  'Clientes finales',
  'Turistas',
  'Estudiantes',
];

const statusSteps = [
  'En diseño',
  'En desarrollo',
  'En revisión',
  'Publicado',
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessSector: '',
    city: '',
    hasLocal: 'no',
    goal: '',
    audience: [] as string[],
    colors: '',
    references: '',
    hasLogo: 'no',
    logoUrl: '',
    baseText: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    contactEmail: '',
    confirm: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch(`${apiBase}/auth/me`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const meText = await meRes.text();
        const meData = meText ? JSON.parse(meText) : null;
        if (!meRes.ok) throw new Error(meData?.message || 'No se pudo cargar el usuario');
        setUser(meData);

        const projectRes = await fetch(`${apiBase}/projects/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await projectRes.text();
        const data = text ? JSON.parse(text) : null;
        if (!projectRes.ok) throw new Error(data?.message || 'No se pudo cargar el proyecto');
        setProject(data);
        if (data?.onboardingStep) setStep(Math.max(1, data.onboardingStep));

        if (meData?.role === 'ADMIN') {
          const listRes = await fetch(`${apiBase}/admin/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const listText = await listRes.text();
          const listData = listText ? JSON.parse(listText) : [];
          if (listRes.ok) {
            setAdminProjects(Array.isArray(listData) ? listData : []);
          }
        }
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const timeRemaining = useMemo(() => {
    if (!project?.deadline) return null;
    const deadline = new Date(project.deadline).getTime();
    const now = Date.now();
    const diff = Math.max(deadline - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return { days, hours };
  }, [project?.deadline]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleAudience = (value: string) => {
    setFormData((prev) => {
      const exists = prev.audience.includes(value);
      return {
        ...prev,
        audience: exists
          ? prev.audience.filter((item) => item !== value)
          : [...prev.audience, value],
      };
    });
  };

  const submitOnboarding = async () => {
    if (!project) return;

    if (!formData.businessName || !formData.businessSector || !formData.city) {
      setFormError('Completa los datos basicos del negocio.');
      return;
    }
    if (!formData.goal) {
      setFormError('Selecciona el objetivo de tu web.');
      return;
    }
    if (!formData.confirm) {
      setFormError('Debes confirmar que la informacion es correcta.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/projects/${project.id}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step: 5,
          completed: true,
          data: formData,
        }),
      });

      if (!res.ok) throw new Error('No se pudo guardar la informacion');
      const updated = await res.json();
      setProject(updated);
    } catch (err: any) {
      setFormError(err.message ?? 'Error al enviar la informacion');
    } finally {
      setSubmitting(false);
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
  if (loading) {
    return (
      <div className="section-container py-16">
        <p className="text-muted-foreground">Cargando dashboard...</p>
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

  const isWaitingInfo = project?.status === 'WAITING_INFO';
  const isAdmin = user?.role === 'ADMIN';
  const planName = project?.order?.plan?.name ?? project?.type ?? 'Plan';
  
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
            <button className="w-full text-left px-3 py-2 rounded-lg bg-muted text-foreground">Dashboard</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Mi proyecto</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Soporte</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Facturacion</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Configuracion</button>
          </div>

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            <p>Soporte 24/7</p>
            <p>help@plia.pe</p>
          </div>
        </aside>

        <main className="min-h-screen">
          <header className="bg-white/80 border-b border-border px-6 py-4 flex items-center justify-between">
  <div>
    <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
    <p className="text-sm text-muted-foreground">
      {isWaitingInfo
        ? 'Completa el formulario para iniciar tu proyecto.'
        : 'Seguimiento en tiempo real de tu web.'}
    </p>
  </div>
  <div className="hidden md:flex items-center gap-3">
    <Button variant="outline" asChild>
      <Link href="/contacto">Soporte</Link>
    </Button>
    <Button variant="cta" asChild>
      <Link href="/planes">Ver planes</Link>
    </Button>
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
          <Link href="/dashboard/plan" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
            <CreditCard className="w-4 h-4" /> Mi plan
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
            <Settings className="w-4 h-4" /> Configuracion
          </Link>
          <Link href="/contacto" className="flex items-center gap-2 px-3 py-2 hover:bg-muted">
            <LifeBuoy className="w-4 h-4" /> Soporte
          </Link>
          <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Cerrar sesion
          </button>
        </div>
      )}
    </div>
  </div>
</header>

          <div className="px-6 py-8 space-y-6">
                        {isAdmin && (
              <Card className="rounded-lg border-border/60">
                <CardHeader>
                  <CardTitle>Proyectos solicitados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay proyectos por revisar.</p>
                  )}
                  {adminProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{proj.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {proj.user?.name} - {proj.order?.plan?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{proj.status}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/detalles-proyecto/${proj.id}`}>Ver proyecto</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {!isAdmin && isWaitingInfo && (
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <Card className="rounded-lg border-border/60">
                  <CardHeader>
                    <CardTitle>Bienvenido, configuremos tu web</CardTitle>
                    <p className="text-sm text-muted-foreground">Paso {step} de 5</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {step === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre de la empresa</label>
                          <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rubro</label>
                          <Input value={formData.businessSector} onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pais / ciudad</label>
                          <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-sm font-medium">Tiene local fisico?</span>
                          <label className="text-sm"><input type="radio" checked={formData.hasLocal === 'si'} onChange={() => setFormData({ ...formData, hasLocal: 'si' })} /> Si</label>
                          <label className="text-sm"><input type="radio" checked={formData.hasLocal === 'no'} onChange={() => setFormData({ ...formData, hasLocal: 'no' })} /> No</label>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Objetivo de la web</label>
                          <select
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                          >
                            <option value="">Selecciona</option>
                            <option value="vender">Vender</option>
                            <option value="leads">Conseguir leads</option>
                            <option value="informacion">Mostrar informacion</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Publico objetivo</label>
                          <div className="grid md:grid-cols-2 gap-2 mt-2">
                            {audienceOptions.map((option) => (
                              <label key={option} className="text-sm flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={formData.audience.includes(option)}
                                  onChange={() => toggleAudience(option)}
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Colores preferidos</label>
                          <Input value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Ejemplos de webs (links)</label>
                          <Input value={formData.references} onChange={(e) => setFormData({ ...formData, references: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Tiene logo?</label>
                          <select
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                            value={formData.hasLogo}
                            onChange={(e) => setFormData({ ...formData, hasLogo: e.target.value })}
                          >
                            <option value="no">No tengo logo</option>
                            <option value="si">Si tengo logo</option>
                          </select>
                        </div>
                        {formData.hasLogo === 'si' && (
                          <div>
                            <label className="text-sm font-medium">Link del logo</label>
                            <Input value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} />
                          </div>
                        )}
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Texto base (opcional)</label>
                          <Input value={formData.baseText} onChange={(e) => setFormData({ ...formData, baseText: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Instagram</label>
                          <Input value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Facebook</label>
                          <Input value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">WhatsApp</label>
                          <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Correo</label>
                          <Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                          Revisa los datos antes de enviar. Una vez enviado iniciaremos tu proyecto.
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div><strong>Empresa:</strong> {formData.businessName || '-'}</div>
                          <div><strong>Rubro:</strong> {formData.businessSector || '-'}</div>
                          <div><strong>Ciudad:</strong> {formData.city || '-'}</div>
                          <div><strong>Objetivo:</strong> {formData.goal || '-'}</div>
                          <div><strong>Publico:</strong> {formData.audience.join(', ') || '-'}</div>
                          <div><strong>Colores:</strong> {formData.colors || '-'}</div>
                        </div>
                        <label className="text-sm flex items-center gap-2">
                          <input type="checkbox" checked={formData.confirm} onChange={(e) => setFormData({ ...formData, confirm: e.target.checked })} />
                          Confirmo que esta informacion es correcta
                        </label>
                      </div>
                    )}

                    {formError && <p className="text-sm text-destructive">{formError}</p>}

                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={handleBack} disabled={step === 1}>Atras</Button>
                      {step < 5 && <Button variant="cta" onClick={handleNext}>Continuar</Button>}
                      {step === 5 && (
                        <Button variant="cta" onClick={submitOnboarding} disabled={submitting}>
                          {submitting ? 'Enviando...' : 'Enviar y comenzar proyecto'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Resumen del proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="text-sm font-semibold">{project?.order?.plan?.name ?? project?.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Entrega estimada</span>
                        <span className="text-sm font-semibold">
                          {project?.type === 'LANDING' ? '48 horas' : '5-7 dias habiles'}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">
                        Apenas completes el formulario empezaremos a trabajar en tu web.
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Necesitas ayuda?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full">Contactar soporte</Button>
                      <Button variant="outline" className="w-full">Agendar llamada</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {!isAdmin && !isWaitingInfo && project && (
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <Card className="rounded-lg">
                  <CardHeader>
                    <CardTitle>Estado del proyecto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <span className="font-semibold">{project.order?.plan?.name ?? project.type}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {statusSteps.map((item, index) => (
                        <div key={item} className="rounded-xl border border-border bg-white p-4">
                          <p className="text-xs text-muted-foreground">Paso {index + 1}</p>
                          <p className="font-semibold">{item}</p>
                        </div>
                      ))}
                    </div>
                    {timeRemaining && (
                      <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tiempo restante</p>
                          <p className="text-xl font-semibold">{timeRemaining.days}d {timeRemaining.hours}h</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Entrega estimada
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Tu web</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Tu web estara online aqui:</p>
                      <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm">
                        {project.onboardingData?.publicUrl || 'https://tu-negocio.plia.pe'}
                      </div>
                      <Button variant="outline" className="w-full">Ver avance</Button>
                      <Button variant="cta" className="w-full">Comprar dominio propio</Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Acciones rapidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full">Enviar cambios</Button>
                      <Button variant="outline" className="w-full">Subir contenido</Button>
                      <Button variant="outline" className="w-full">Soporte</Button>
                      <Button variant="outline" className="w-full">Configuracion basica</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}