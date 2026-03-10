'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  User as UserIcon,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  Check,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  Music2,
  Clock,
  Hammer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import Image from "next/image";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE ?? 'plia.pe';

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
  subscription?: {
    id: number;
    endDate: string;
    status: string;
  };
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


const colorSchemes = [
  { id: 'azul', label: 'Azul Profesional', colors: ['#1f4fff', '#3b82f6', '#e2e8f0'] },
  { id: 'verde', label: 'Verde Natural', colors: ['#14532d', '#22c55e', '#dcfce7'] },
  { id: 'rojo', label: 'Rojo Energetico', colors: ['#ef4444', '#fb7185', '#ffe4e6'] },
  { id: 'morado', label: 'Morado Creativo', colors: ['#7c3aed', '#a78bfa', '#ede9fe'] },
  { id: 'naranja', label: 'Naranja Calido', colors: ['#f97316', '#fb923c', '#ffedd5'] },
  { id: 'negro', label: 'Negro Elegante', colors: ['#111827', '#4b5563', '#f3f4f6'] },
];

const visualStyles = [
  'Moderno y Minimalista',
  'Corporativo y Profesional',
  'Creativo y Colorido',
  'Elegante y Sofisticado',
  'Juvenil y Dinamico',
  'Clasico y Tradicional',
];

const featureOptions = [
  'Formulario de contacto',
  'Galeria de imagenes',
  'Testimonios de clientes',
  'Mapa de ubicacion',
  'Integracion con redes sociales',
  'Catalogo de productos/servicios',
  'Reservas/Citas online',
];


const statusMeta: Record<string, { label: string; icon: string }> = {
  WAITING_INFO: { label: 'Completar datos', icon: 'clock' },
  IN_PROGRESS: { label: 'En progreso', icon: 'hammer' },
  READY: { label: 'Listo', icon: 'check' },
  DELIVERED: { label: 'Publicado', icon: 'check' },
};

const statusSteps = [
  'En diseño',
  'En desarrollo',
  'En revisión',
  'Publicado',
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [revisionSending, setRevisionSending] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewMethod, setRenewMethod] = useState<'card' | 'yape' | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [formData, setFormData] = useState({
    domainOption: 'subdomain',
    subdomain: '',
    colorScheme: '',
    visualStyle: '',
    features: [] as string[],
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
    tiktok: '',
    contactEmail: '',
    additionalInstructions: '',
    imageInstructions: '',
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

        const projectRes = await fetch(`${apiBase}/projects/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await projectRes.text();
        const data = text ? JSON.parse(text) : [];
        if (!projectRes.ok) throw new Error((data as any)?.message || 'No se pudo cargar el proyecto');
        const list = Array.isArray(data) ? data : [];
        setProjects(list);
        const current = list[0] ?? null;
        setProject(current);
        setSelectedProjectId(current?.id ?? null);
        if (current?.onboardingData?.subdomain) {
          setStep(Math.max(1, Math.min(6, current.onboardingStep ?? 1)));
        } else {
          setStep(1);
        }

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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      return;
    }
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const handleSelectProject = (proj: Project) => {
    setSelectedProjectId(proj.id);
    setProject(proj);
    if (proj?.onboardingData?.subdomain) {
      setStep(Math.max(1, Math.min(6, proj.onboardingStep ?? 1)));
    } else {
      setStep(1);
    }
  };

  const progressInfo = useMemo(() => {
    if (!project?.deadline) return null;
    const deadlineMs = new Date(project.deadline).getTime();
    const startedMs = project.startedAt ? new Date(project.startedAt).getTime() : null;
    const defaultTotal =
      project.type === 'LANDING' ? 48 * 60 * 60 * 1000 : 5 * 24 * 60 * 60 * 1000;
    const totalMs = startedMs ? Math.max(deadlineMs - startedMs, 1) : defaultTotal;
    const startMs = startedMs ?? deadlineMs - totalMs;
    const elapsed = Math.max(now - startMs, 0);
    const rawProgress = Math.min(elapsed / totalMs, 1);
    const isComplete = project.status === 'DELIVERED' || rawProgress >= 1;
    const progress = isComplete ? 1 : rawProgress;
    const step = isComplete ? 4 : Math.max(1, Math.min(4, Math.floor(progress * 4) + 1));
    const diff = Math.max(deadlineMs - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return {
      progressPercent: Math.round(progress * 100),
      currentStep: step,
      isComplete,
      timeRemaining: { days, hours },
      deadlineMs,
    };
  }, [project?.deadline, project?.startedAt, project?.status, project?.type, now]);

  const resolvedPublicUrl = useMemo(() => {
    if (!project) return '';
    const data = project.onboardingData || {};
    if (data.publicUrl) return data.publicUrl as string;
    if (data.publicDomain) return `https://${data.publicDomain}`;
    if (data.subdomain) return `https://${data.subdomain}.${domainBase}`;
    return '';
  }, [project, project?.onboardingData, domainBase]);


  const normalizeSubdomain = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.subdomain.trim()) {
        setFormError('Ingresa tu subdominio para continuar.');
        return;
      }
      if (formData.subdomain.length < 3) {
        setFormError('El subdominio debe tener al menos 3 caracteres.');
        return;
      }
    }
    if (step < 6) setStep(step + 1);
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

  const toggleFeature = (value: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(value);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((item) => item !== value)
          : [...prev.features, value],
      };
    });
  };

  const renderStatus = (status?: string) => {
    const meta = status ? statusMeta[status] : null;
    const label = meta?.label ?? status ?? 'Estado';
    const icon =
      meta?.icon === 'clock' ? <Clock size={14} /> :
      meta?.icon === 'hammer' ? <Hammer size={14} /> :
      meta?.icon === 'check' ? <CheckCircle2 size={14} /> :
      <AlertCircle size={14} />;

    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
    );
  };

  const submitOnboarding = async () => {
    if (!project) return;

    if (!formData.subdomain.trim()) {
      setFormError('Subdominio requerido.');
      return;
    }
    if (!formData.businessName || !formData.businessSector || !formData.city) {
      setFormError('Completa los datos basicos del negocio.');
      return;
    }
    if (!formData.baseText.trim()) {
      setFormError('Define tu negocio o proyecto.');
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
      let logoUrl = formData.hasLogo === 'si' ? formData.logoUrl : '';

      if (formData.hasLogo === 'si' && logoFile) {
        const form = new FormData();
        form.append('file', logoFile);
        const uploadRes = await fetch(`${apiBase}/projects/${project.id}/logo`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!uploadRes.ok) {
          throw new Error('No se pudo subir el logo.');
        }

        const uploadData = await uploadRes.json().catch(() => ({}));
        logoUrl = uploadData?.onboardingData?.logoUrl ?? uploadData?.logoUrl ?? logoUrl;
      }


      let uploadedImages: string[] = [];
      if (imageFiles.length) {
        const form = new FormData();
        imageFiles.forEach((file) => form.append('files', file));
        const mediaRes = await fetch(`${apiBase}/projects/${project.id}/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!mediaRes.ok) {
          const text = await mediaRes.text();
          const data = text ? JSON.parse(text) : null;
          throw new Error(data?.message || 'No se pudieron subir las imagenes.');
        }

        const mediaData = await mediaRes.json().catch(() => ({}));
        uploadedImages = mediaData?.onboardingData?.images ?? mediaData?.images ?? uploadedImages;
      }

      const res = await fetch(`${apiBase}/projects/${project.id}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step: 6,
          completed: true,
          data: {
            ...formData,
            logoUrl,
            images: uploadedImages,
            imageInstructions: formData.imageInstructions,
          },
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

  const handleViewProgress = () => {
    const url = resolvedPublicUrl;
    if (!url) {
      window.alert('Tu web aun no tiene una URL publica.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submitRevisionRequest = async () => {
    if (!project) return;
    const message = revisionMessage.trim();
    if (!message) {
      setRevisionError('Escribe los cambios que necesitas.');
      return;
    }
    setRevisionSending(true);
    setRevisionError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/projects/${project.id}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo enviar los cambios.');
      }
      setProject(data);
      setRevisionMessage('');
      setRevisionOpen(false);
    } catch (err: any) {
      setRevisionError(err.message ?? 'No se pudo enviar los cambios.');
    } finally {
      setRevisionSending(false);
    }
  };

  const renewalEligible = useMemo(() => {
    if (!project?.subscription?.endDate) return false;
    const end = new Date(project.subscription.endDate).getTime();
    const eligibleAt = end - 30 * 24 * 60 * 60 * 1000;
    return now >= eligibleAt;
  }, [project?.subscription?.endDate, now]);

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
  const revisionsAllowed =
    project?.onboardingData?.revisionsAllowed ??
    (project?.type === 'LANDING' ? 1 : 2);
  const revisionsUsed = Array.isArray(project?.onboardingData?.revisionRequests)
    ? project?.onboardingData?.revisionRequests.length
    : 0;
  const revisionsLeft = Math.max(revisionsAllowed - revisionsUsed, 0);
  const revisionWindowEndsAt = project?.onboardingData?.revisionWindowEndsAt
    ? new Date(project.onboardingData.revisionWindowEndsAt).getTime()
    : project?.onboardingData?.publishedAt
      ? new Date(project.onboardingData.publishedAt).getTime() + 48 * 60 * 60 * 1000
      : null;
  const revisionTimeLeftMs = revisionWindowEndsAt ? Math.max(revisionWindowEndsAt - now, 0) : null;
  const revisionTimeLeft = revisionTimeLeftMs !== null
    ? {
        days: Math.floor(revisionTimeLeftMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((revisionTimeLeftMs / (1000 * 60 * 60)) % 24),
      }
    : null;
  const canRequestRevision =
    !!project?.onboardingData?.publishedAt &&
    !!revisionTimeLeftMs &&
    revisionTimeLeftMs > 0 &&
    revisionsLeft > 0;
  
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col border-r border-border bg-white/80 backdrop-blur-sm min-h-screen px-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image
                src="/iconplia.svg"
                alt="Icono PLIA"
                width={44}
                height={44}
                className="w-10 h-10 sm:w-11 sm:h-11"
              />
            </div>
            <div>
              <div className="font-semibold">Tu Web Fácil</div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-muted text-foreground">Dashboard</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Mi proyecto</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Soporte</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Facturacion</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted">Configuracion</button>
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted"
              onClick={() => setAdvancedOpen(true)}
            >
              Configuracion avanzada
            </button>
          </div>

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            <p>Soporte 24/7</p>
            <p>soporte@plia.pe</p>
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

          <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuracion avanzada</DialogTitle>
                <DialogDescription>
                  Esta seccion es para ajustes tecnicos. Si cambias algo sin conocerlo, tu web o el
                  servidor podrian dejar de funcionar. Entra solo si estas seguro.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAdvancedOpen(false)}>
                  Entendido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                        {renderStatus(proj.status)}
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
                    <p className="text-sm text-muted-foreground">Paso {step} de 6</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                      {[
                        { label: 'Dominio', active: step === 1 },
                        { label: 'Negocio', active: step === 2 || step === 3 },
                        { label: 'Estilo', active: step === 4 || step === 5 },
                        { label: 'Generar', active: step === 6 },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                            item.active
                              ? 'border-cta bg-cta/10 text-foreground'
                              : 'border-border bg-white'
                          }`}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>

                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold">Elige tu dominio</h3>
                          <p className="text-xs text-muted-foreground">
                            Decide como accederan los usuarios a tu sitio web.
                          </p>
                        </div>

                        <button
                          type="button"
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            formData.domainOption === 'subdomain'
                              ? 'border-cta bg-cta/10'
                              : 'border-border bg-white'
                          }`}
                          onClick={() => setFormData({ ...formData, domainOption: 'subdomain' })}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Subdominio gratuito</p>
                              <p className="text-xs text-muted-foreground">
                                Tu web estara en tudominio.plia.pe
                              </p>
                            </div>
                            <span className="text-xs rounded-full bg-cta/10 text-cta px-2 py-1">Gratis</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Input
                              placeholder="miempresa"
                              value={formData.subdomain}
                              onChange={(e) =>
                                setFormData({ ...formData, subdomain: normalizeSubdomain(e.target.value) })
                              }
                            />
                            <span className="text-sm text-muted-foreground">.plia.pe</span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Solo letras, numeros y guion. Minimo 3, maximo 30.
                          </p>
                        </button>

                        <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-4 text-left opacity-70">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Comprar dominio</p>
                              <p className="text-xs text-muted-foreground">
                                Proximamente podras conectar tu propio dominio.
                              </p>
                            </div>
                            <span className="text-xs rounded-full bg-muted px-2 py-1">Proximamente</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
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
                        <div>
                          <label className="text-sm font-medium">Referencias de webs (opcional)</label>
                          <Input
                            value={formData.references}
                            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                            placeholder="Ej: https://ejemplo.com, https://otraweb.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Tiene local fisico?</span>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { label: 'Si', value: 'si' },
                              { label: 'No', value: 'no' },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`h-10 rounded-full border px-4 text-sm transition ${
                                  formData.hasLocal === opt.value
                                    ? 'border-cta bg-cta/10 text-foreground'
                                    : 'border-border bg-white text-muted-foreground'
                                }`}
                                onClick={() => setFormData({ ...formData, hasLocal: opt.value })}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
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
                          <div className="mt-3 flex flex-wrap gap-2">
                            {audienceOptions.map((option) => {
                              const active = formData.audience.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                                    active
                                      ? 'border-cta bg-cta/10 text-foreground'
                                      : 'border-border bg-white text-muted-foreground'
                                  }`}
                                  onClick={() => toggleAudience(option)}
                                >
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                      active ? 'border-cta bg-cta text-cta-foreground' : 'border-border'
                                    }`}
                                  >
                                    {active && <Check size={10} />}
                                  </span>
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium">Esquema de colores</label>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {colorSchemes.map((scheme) => {
                              const active = formData.colorScheme === scheme.id;
                              return (
                                <button
                                  key={scheme.id}
                                  type="button"
                                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                    active
                                      ? 'border-cta bg-cta/10'
                                      : 'border-border bg-white'
                                  }`}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      colorScheme: scheme.id,
                                      colors: scheme.label,
                                    })
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      {scheme.colors.map((color) => (
                                        <span
                                          key={color}
                                          className="h-6 w-6 rounded-full border border-white/40"
                                          style={{ background: color }}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-semibold">{scheme.label}</span>
                                  </div>
                                  {active && (
                                    <span className="text-xs rounded-full bg-cta text-cta-foreground px-2 py-1">Seleccionado</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        <div className="mt-4">
                          <label className="text-sm font-medium">Otros colores en especifico:</label>
                          <Input
                            value={formData.colors}
                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                            placeholder="Ej: Beige, dorado, azul marino"
                          />
                        </div>

                        </div>

                        <div>
                          <label className="text-sm font-medium">Estilo visual</label>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {visualStyles.map((style) => {
                              const active = formData.visualStyle === style;
                              return (
                                <button
                                  key={style}
                                  type="button"
                                  className={`rounded-full border px-4 py-2 text-sm transition ${
                                    active
                                      ? 'border-cta bg-cta/10 text-foreground'
                                      : 'border-border bg-white text-muted-foreground'
                                  }`}
                                  onClick={() => setFormData({ ...formData, visualStyle: style })}
                                >
                                  {style}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Caracteristicas a incluir</label>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {featureOptions.map((feature) => {
                              const active = formData.features.includes(feature);
                              return (
                                <button
                                  key={feature}
                                  type="button"
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                                    active
                                      ? 'border-cta bg-cta/10 text-foreground'
                                      : 'border-border bg-white text-muted-foreground'
                                  }`}
                                  onClick={() => toggleFeature(feature)}
                                >
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                      active ? 'border-cta bg-cta text-cta-foreground' : 'border-border'
                                    }`}
                                  >
                                    {active && <Check size={10} />}
                                  </span>
                                  {feature}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Tiene logo?</label>
                          <select
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                            value={formData.hasLogo}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                hasLogo: value,
                                logoUrl: value === 'no' ? '' : prev.logoUrl,
                              }));
                              if (value === 'no') {
                                setLogoFile(null);
                              }
                            }}
                          >
                            <option value="no">No tengo logo</option>
                            <option value="si">Si tengo logo</option>
                          </select>
                        </div>
                        {formData.hasLogo === 'si' && (
                          <div>
                            <label className="text-sm font-medium">Sube tu logo</label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setLogoFile(file);
                                if (!file) {
                                  setFormData({ ...formData, logoUrl: '' });
                                }
                              }}
                            />
                            {logoPreview && (
                              <div className="mt-3 flex items-center gap-3">
                                <img
                                  src={logoPreview}
                                  alt="Preview logo"
                                  className="h-12 w-12 rounded-md border border-border object-contain bg-white"
                                />
                                <button
                                  type="button"
                                  className="text-xs text-muted-foreground underline"
                                  onClick={() => setLogoFile(null)}
                                >
                                  Quitar logo
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Define tu negocio o proyecto</label>
                          <Textarea
                            value={formData.baseText}
                            onChange={(e) => setFormData({ ...formData, baseText: e.target.value })}
                            placeholder="Escribe todo lo relevante de tu negocio y todo lo que la gente deberia saber"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Instagram</label>
                          <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              value={formData.instagram}
                              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                              placeholder="@tuinstagram"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Facebook</label>
                          <div className="relative">
                            <Facebook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              value={formData.facebook}
                              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                              placeholder="facebook.com/tuempresa"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">TikTok</label>
                          <div className="relative">
                            <Music2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              value={formData.tiktok}
                              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                              placeholder="@tiktok"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">WhatsApp</label>
                          <div className="relative">
                            <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              value={formData.whatsapp}
                              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                              placeholder="+51 999 999 999"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Correo</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              value={formData.contactEmail}
                              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                              placeholder="contacto@tuempresa.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 6 && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                          Revisa los datos antes de enviar. Una vez enviado iniciaremos tu proyecto.
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div><strong>Subdominio:</strong> {formData.subdomain ? `${formData.subdomain}.plia.pe` : '-'}</div>
                          <div><strong>Empresa:</strong> {formData.businessName || '-'}</div>
                          <div><strong>Rubro:</strong> {formData.businessSector || '-'}</div>
                          <div><strong>Ciudad:</strong> {formData.city || '-'}</div>
                          <div><strong>Referencias:</strong> {formData.references || '-'}</div>
                          <div><strong>Objetivo:</strong> {formData.goal || '-'}</div>
                          <div><strong>Publico:</strong> {formData.audience.join(', ') || '-'}</div>
                          <div><strong>Esquema:</strong> {formData.colors || formData.colorScheme || '-'}</div>
                          <div><strong>Estilo:</strong> {formData.visualStyle || '-'}</div>
                          <div><strong>Caracteristicas:</strong> {formData.features.join(', ') || '-'}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">¿Alguna otra instruccion adicional que quieres que haga tu web?</label>
                          <Textarea
                            value={formData.additionalInstructions}
                            onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                            placeholder="Ej: Agrega una seccion de testimonios, incluye un boton de WhatsApp, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Imagenes que deseas incluir en tu web</label>
                          <p className="text-xs text-muted-foreground">Maximo 5 imagenes, 3MB cada una.</p>
                          <div
                            className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
                              const total = imageFiles.length + files.length;
                              if (total > 5) {
                                setFormError('Solo puedes subir hasta 5 imagenes.');
                                return;
                              }
                              const tooLarge = files.find((file) => file.size > 3 * 1024 * 1024);
                              if (tooLarge) {
                                setFormError('Cada imagen debe pesar menos de 3MB.');
                                return;
                              }
                              setFormError(null);
                              setImageFiles([...imageFiles, ...files]);
                            }}
                          >
                            Arrastra tus imagenes aqui o
                            <label className="ml-1 cursor-pointer text-cta underline">
                              selecciona archivos
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files ?? []);
                                  const total = imageFiles.length + files.length;
                                  if (total > 5) {
                                    setFormError('Solo puedes subir hasta 5 imagenes.');
                                    return;
                                  }
                                  const tooLarge = files.find((file) => file.size > 3 * 1024 * 1024);
                                  if (tooLarge) {
                                    setFormError('Cada imagen debe pesar menos de 3MB.');
                                    return;
                                  }
                                  setFormError(null);
                                  setImageFiles([...imageFiles, ...files]);
                                }}
                              />
                            </label>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">{imageFiles.length}/5 imagenes seleccionadas</div>
                          {imagePreviews.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                              {imagePreviews.map((src, index) => (
                                <div key={src} className="relative overflow-hidden rounded-xl border border-border">
                                  <img src={src} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs"
                                    onClick={() => {
                                      const nextFiles = imageFiles.filter((_, i) => i != index);
                                      setImageFiles(nextFiles);
                                    }}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {imageFiles.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Instrucciones para las imagenes</label>
                            <Textarea
                              value={formData.imageInstructions}
                              onChange={(e) => setFormData({ ...formData, imageInstructions: e.target.value })}
                              placeholder="Indica como deseas que utilicemos cada imagen que subiste dentro de tu pagina web."
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                            formData.confirm
                              ? 'border-cta bg-cta/10 text-foreground'
                              : 'border-border bg-white text-muted-foreground'
                          }`}
                          onClick={() => setFormData({ ...formData, confirm: !formData.confirm })}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              formData.confirm ? 'border-cta bg-cta text-cta-foreground' : 'border-border'
                            }`}
                          >
                            {formData.confirm && <Check size={10} />}
                          </span>
                          Confirmo que esta informacion es correcta
                        </button>
                      </div>
                    )}

                    {formError && <p className="text-sm text-destructive">{formError}</p>}

                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={handleBack} disabled={step === 1}>Atras</Button>
                      {step < 6 && <Button variant="cta" onClick={handleNext}>Continuar</Button>}
                      {step === 6 && (
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
                          {project?.type === 'LANDING' ? '48 horas' : '5 dias'}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">
                        Apenas completes el formulario empezaremos a trabajar en tu web.
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Proyectos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {projects.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aun no tienes proyectos.</p>
                      )}
                      {projects.map((proj) => {
                        const deadlineMs = proj.deadline ? new Date(proj.deadline).getTime() : null;
                        const startedMs = proj.startedAt ? new Date(proj.startedAt).getTime() : null;
                        const totalMs = deadlineMs && startedMs ? Math.max(deadlineMs - startedMs, 1) : null;
                        const elapsed = totalMs ? Math.max(Date.now() - (startedMs ?? 0), 0) : 0;
                        const progress = totalMs ? Math.min(elapsed / totalMs, 1) : 0;
                        return (
                          <div key={proj.id} className="rounded-xl border border-border bg-white p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">{proj.name}</p>
                                <p className="text-xs text-muted-foreground">{proj.order?.plan?.name ?? proj.type}</p>
                              </div>
                              {renderStatus(proj.status)}
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full plia-progress-animated"
                                style={{ width: `${Math.round(progress * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
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
                <div className="space-y-6">
                  {projects.length > 1 && (
                    <Card className="rounded-lg">
                      <CardHeader>
                        <CardTitle>Mis proyectos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {projects.map((proj) => {
                          const isSelected = proj.id === selectedProjectId;
                          const canView = proj.status === 'READY' || proj.status === 'DELIVERED';
                          return (
                            <div
                              key={proj.id}
                              role="button"
                              tabIndex={0}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                                isSelected ? 'border-cta bg-cta/10' : 'border-border bg-white hover:bg-muted/40'
                              }`}
                              onClick={() => handleSelectProject(proj)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectProject(proj);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{proj.name}</p>
                                  <p className="text-xs text-muted-foreground">{proj.order?.plan?.name ?? proj.type}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderStatus(proj.status)}
                                  {canView ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      asChild
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Link href={`/dashboard/detalles-proyecto/${proj.id}`}>Ver proyecto</Link>
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled onClick={(e) => e.stopPropagation()}>
                                      Ver proyecto
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Estado del proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="font-semibold">{project.order?.plan?.name ?? project.type}</span>
                      </div>
                      <div className="space-y-4">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={
                              progressInfo?.isComplete
                                ? 'h-full bg-emerald-500 transition-all duration-700'
                                : 'h-full plia-progress-animated transition-all duration-700'
                            }
                            style={{ width: `${progressInfo?.progressPercent ?? 0}%` }}
                          />
                        </div>
                        {progressInfo?.isComplete ? (
                          <p className="text-xs text-emerald-600">Completado</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Avanzando segun el plazo de tu plan.
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {statusSteps.map((item, index) => {
                            const stepNumber = index + 1;
                            const isActive = (progressInfo?.currentStep ?? 1) >= stepNumber;
                            return (
                              <div key={item} className="flex items-center gap-2">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                                    isActive
                                      ? 'border-cta bg-cta text-cta-foreground'
                                      : 'border-border bg-white text-muted-foreground'
                                  }`}
                                >
                                  {stepNumber}
                                </div>
                                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {progressInfo?.timeRemaining && !progressInfo.isComplete && (
                          <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Tiempo restante</p>
                              <p className="text-xl font-semibold">
                                {progressInfo.timeRemaining.days}d {progressInfo.timeRemaining.hours}h
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">Entrega estimada</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Solicitar nuevo proyecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Elige el tipo de sitio web que deseas.</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button variant="outline" asChild>
                          <Link href="/checkout?plan=landing">Landing</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/checkout?plan=web">Web institucional</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Tu web</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Tu web estara online aqui:</p>
                      <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm">
                        {resolvedPublicUrl || 'https://tu-negocio.plia.pe'}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleViewProgress}
                        disabled={!resolvedPublicUrl}
                      >
                        Ver avance
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/dashboard/detalles-proyecto/${project.id}`}>Ver proyecto</Link>
                      </Button>
                      <Button variant="cta" className="w-full">Comprar dominio propio</Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg">
                    <CardHeader>
                      <CardTitle>Acciones rapidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {renewalEligible && project?.subscription?.id && (
                        <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
                          <DialogTrigger asChild>
                            <Button variant="cta" className="w-full">
                              Renovar Hosting
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Renovar Hosting</DialogTitle>
                              <DialogDescription>
                                Elige como quieres renovar tu hosting anual.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                className={`h-20 rounded-xl border text-left px-4 py-3 ${
                                  renewMethod === 'yape'
                                    ? 'border-cta bg-cta/10'
                                    : 'border-border bg-white'
                                }`}
                                onClick={() => setRenewMethod('yape')}
                              >
                                <p className="text-xs text-muted-foreground">Pago con</p>
                                <p className="font-semibold">Yape</p>
                              </button>
                              <button
                                type="button"
                                className={`h-20 rounded-xl border text-left px-4 py-3 ${
                                  renewMethod === 'card'
                                    ? 'border-cta bg-cta/10'
                                    : 'border-border bg-white'
                                }`}
                                onClick={() => setRenewMethod('card')}
                              >
                                <p className="text-xs text-muted-foreground">Pago con</p>
                                <p className="font-semibold">Tarjeta</p>
                              </button>
                            </div>
                            {renewError && <p className="text-xs text-destructive">{renewError}</p>}
                            <DialogFooter>
                              <Button
                                variant="cta"
                                disabled={renewLoading || !renewMethod}
                                onClick={async () => {
                                  if (!project?.subscription?.id) return;
                                  if (!renewMethod) {
                                    setRenewError('Selecciona una forma de pago.');
                                    return;
                                  }
                                  setRenewLoading(true);
                                  setRenewError(null);
                                  try {
                                    const token = localStorage.getItem('access_token');
                                    const sessionRes = await fetch(`${apiBase}/subscriptions/renew/session`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({ subscriptionId: project.subscription.id }),
                                    });
                                    if (!sessionRes.ok) {
                                      const txt = await sessionRes.text();
                                      throw new Error(txt || 'No se pudo iniciar la renovacion');
                                    }
                                    const data = await sessionRes.json();
                                    const session = data.session ?? data;
                                    const tokenSession = session.token ?? session.tokenSession ?? session.token_session;
                                    const keyRSA = session.keyRSA ?? session.publicKey ?? session.public_key;
                                    const merchantCode = session.merchantCode ?? session.merchantId ?? process.env.NEXT_PUBLIC_IZIPAY_MERCHANT_CODE;
                                    const orderNumber = session.orderNumber ?? `R-${data.renewalId}`;
                                    const transactionId = session.transactionId ?? `REN-${Date.now()}`;
                                    const amount = session.amount ?? data.amount;
                                    const currency = session.currency ?? 'PEN';

                                    if (!window.Izipay) throw new Error('SDK de Izipay no cargado.');

                                    const iziConfig: any = {
                                      merchantCode,
                                      order: {
                                        orderNumber,
                                        currency,
                                        amount,
                                        processType: 'AT',
                                        merchantBuyerId: `REN-${data.renewalId}`,
                                        dateTimeTransaction: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
                                        ...(renewMethod === 'yape' ? { payMethod: 'YAPE_CODE' } : {}),
                                      },
                                      billing: {
                                        firstName: user?.name?.split(' ')[0] ?? 'Cliente',
                                        lastName: user?.name?.split(' ').slice(1).join(' ') || '-',
                                        email: user?.email ?? '',
                                        address: '-',
                                        city: 'Lima',
                                        country: 'PE',
                                        phoneNumber: '000000000',
                                        documentType: 'DNI',
                                        document: '00000000',
                                      },
                                      render: {
                                        typeForm: 'pop-up',
                                      },
                                      action: renewMethod === 'yape' ? 'pay' : 'pay_register',
                                    };

                                    const izi = new window.Izipay({ config: iziConfig });
                                    izi.LoadForm({
                                      authorization: tokenSession,
                                      keyRSA,
                                      callbackResponse: async (response: any) => {
                                        const confirmRes = await fetch(`${apiBase}/subscriptions/renew/confirm`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify(response),
                                        });
                                        if (!confirmRes.ok) {
                                          throw new Error('No se pudo confirmar la renovacion.');
                                        }
                                        setRenewOpen(false);
                                      },
                                    });
                                  } catch (err: any) {
                                    setRenewError(err.message ?? 'Error al renovar');
                                  } finally {
                                    setRenewLoading(false);
                                  }
                                }}
                              >
                                {renewLoading ? 'Procesando...' : 'Pagar renovacion'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={!canRequestRevision}
                          >
                            Enviar cambios
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Solicitar cambios</DialogTitle>
                            <DialogDescription>
                              Detalla los ajustes que necesitas y la IA aplicara los cambios.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Textarea
                              value={revisionMessage}
                              onChange={(e) => setRevisionMessage(e.target.value)}
                              placeholder="Ej: Cambiar el titulo principal y agregar una seccion de testimonios."
                            />
                            {revisionError && (
                              <p className="text-xs text-destructive">{revisionError}</p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="cta"
                              onClick={submitRevisionRequest}
                              disabled={revisionSending}
                            >
                              {revisionSending ? 'Enviando...' : 'Enviar cambios'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground">
                        Revisiones disponibles: {revisionsLeft}/{revisionsAllowed}
                        {revisionTimeLeft && (
                          <span className="block mt-1">
                            Tiempo para cambios: {revisionTimeLeft.days}d {revisionTimeLeft.hours}h
                          </span>
                        )}
                        {!revisionTimeLeft && (
                          <span className="block mt-1">
                            El periodo de cambios se habilita al publicar tu web.
                          </span>
                        )}
                        {revisionTimeLeftMs === 0 && (
                          <span className="block mt-1 text-destructive">
                            Periodo de cambios finalizado.
                          </span>
                        )}
                      </div>
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
