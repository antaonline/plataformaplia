'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Trash2,
} from 'lucide-react';

import Image from "next/image";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE ?? 'plia.pe';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  billingName?: string;
  billingAddress?: string;
  billingDepartment?: string;
  billingEmail?: string;
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

// El backend guarda onboardingData como string JSON (columna LongText).
// La UI lo lee como objeto, asi que lo parseamos al recibir cada proyecto.
const normalizeProject = (p: any): Project => {
  if (!p) return p;
  let onboardingData = p.onboardingData;
  if (typeof onboardingData === 'string') {
    try {
      onboardingData = JSON.parse(onboardingData || '{}');
    } catch {
      onboardingData = {};
    }
  }
  return { ...p, onboardingData: onboardingData || {} };
};

type BusinessIdentity = 'local-business' | 'professional' | 'digital-project';

type OptionGroup = {
  id: BusinessIdentity;
  label: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  options: string[];
};

type SmartSectionField = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

declare global {
  interface Window {
    Izipay?: any;
  }
}

const audienceOptions = [
  'Emprendedores',
  'Negocios locales',
  'Empresas B2B',
  'Clientes finales',
  'Turistas',
  'Estudiantes',
];

const identityOptions: OptionGroup[] = [
  {
    id: 'local-business',
    label: '1. Un negocio con local o atencion al publico',
    title: '1. Soy: un negocio con local o atencion al publico',
    description: 'Este grupo incluye negocios fisicos tradicionales y atencion directa al cliente.',
    searchPlaceholder: 'Buscar tipo de negocio...',
    options: [
      'Restaurante',
      'Polleria',
      'Cafeteria',
      'Bar',
      'Discoteca',
      'Panaderia',
      'Pasteleria',
      'Heladeria',
      'Pizzeria',
      'Comida rapida',
      'Food truck',
      'Cevicheria',
      'Jugueria',
      'Carniceria',
      'Minimarket',
      'Bodega',
      'Supermercado',
      'Licoreria',
      'Farmacia',
      'Veterinaria',
      'Pet shop',
      'Floristeria',
      'Ferreteria',
      'Libreria',
      'Jugueteria',
      'Tienda de ropa',
      'Boutique',
      'Zapateria',
      'Optica',
      'Tienda de celulares',
      'Tienda de tecnologia',
      'Tienda de cosmeticos',
      'Joyeria',
      'Salon de belleza',
      'Barberia',
      'Spa',
      'Centro estetico',
      'Gimnasio',
      'Estudio de yoga',
      'Academia',
      'Guarderia',
      'Lavanderia',
      'Taller mecanico',
      'Lavado de autos',
      'Concesionario',
      'Agencia de viajes',
      'Hotel',
      'Hostal',
      'Restobar',
      'Catering',
      'Salon de eventos',
      'Fotografia',
      'Imprenta',
      'Tienda de decoracion',
      'Tienda de muebles',
      'Tienda de colchones',
      'Tienda deportiva',
      'Tienda de instrumentos musicales',
    ],
  },
  {
    id: 'professional',
    label: '2. Un profesional, independiente u oficio',
    title: '2. Soy: profesional, independiente o con oficio',
    description: 'Aqui reunimos profesiones, consultorias, especialistas y oficios.',
    searchPlaceholder: 'Buscar profesion u oficio...',
    options: [
      'Abogado',
      'Contador',
      'Arquitecto',
      'Ingeniero civil',
      'Ingeniero industrial',
      'Ingeniero sistemas',
      'Medico',
      'Dentista',
      'Psicologo',
      'Psiquiatra',
      'Nutricionista',
      'Fisioterapeuta',
      'Coach',
      'Consultor',
      'Asesor financiero',
      'Agente inmobiliario',
      'Profesor',
      'Tutor',
      'Entrenador personal',
      'Instructor fitness',
      'Instructor yoga',
      'Chef',
      'Fotografo',
      'Videografo',
      'Disenador grafico',
      'Disenador web',
      'Programador',
      'Desarrollador software',
      'Especialista marketing digital',
      'Community manager',
      'Copywriter',
      'Traductor',
      'Editor de video',
      'Ilustrador',
      'Artista',
      'Musico',
      'Actor',
      'Locutor',
      'Electricista',
      'Gasfitero',
      'Carpintero',
      'Cerrajero',
      'Tecnico celulares',
      'Tecnico computadoras',
      'Tecnico aire acondicionado',
      'Mecanico',
      'Pintor',
      'Soldador',
      'Jardinero',
      'Decorador interiores',
      'Maquillador profesional',
      'Estilista',
      'Barbero independiente',
      'Masajista',
      'Terapeuta',
      'Tarotista',
      'Astrologo',
      'Consultor espiritual',
    ],
  },
  {
    id: 'digital-project',
    label: '3. Una empresa, marca o proyecto digital',
    title: '3. Soy: empresa, marca o proyecto digital',
    description: 'Pensado para startups, marcas, empresas B2B y productos digitales.',
    searchPlaceholder: 'Buscar empresa, marca o proyecto...',
    options: [
      'Startup tecnologica',
      'Agencia de marketing',
      'Agencia creativa',
      'Empresa de software',
      'Consultora empresarial',
      'Empresa de logistica',
      'Empresa de transporte',
      'Empresa de construccion',
      'Empresa inmobiliaria',
      'Empresa industrial',
      'Empresa importadora',
      'Empresa exportadora',
      'Empresa B2B',
      'Marca personal',
      'Influencer',
      'Creador de contenido',
      'Tienda online',
      'Marketplace',
      'Plataforma SaaS',
      'App movil',
      'Comunidad',
      'Blog',
      'Medio digital',
      'ONG',
      'Fundacion',
      'Proyecto educativo',
      'Proyecto cultural',
      'Podcast',
      'Productora audiovisual',
      'Estudio creativo',
    ],
  },
];

const localSalesTypes = ['Solo en local', 'Local + delivery', 'Solo delivery', 'Local + reservas'];
const localNeeds = [
  'Mostrar menu o catalogo',
  'Recibir pedidos',
  'Reservas',
  'Mostrar ubicacion',
  'Promociones',
  'Galeria de fotos',
  'Agenda de citas',
];
const professionalWorkModes = ['Consultorio / oficina', 'Atencion a domicilio', 'Online', 'Mixto'];
const professionalGoals = ['Conseguir clientes', 'Reservar citas', 'Mostrar portafolio', 'Vender cursos', 'Mostrar servicios'];
const digitalBusinessModels = ['Servicios', 'Productos', 'Suscripcion', 'Marketplace', 'Contenido'];
const digitalNeeds = ['Captar clientes', 'Mostrar portafolio', 'Explicar el producto', 'Landing de ventas', 'Registro de usuarios'];
const smartNeedSectionMap: Record<string, string[]> = {
  'Mostrar menu o catalogo': ['menu'],
  'Recibir pedidos': ['delivery'],
  Reservas: ['reservas'],
  'Mostrar ubicacion': ['ubicacion'],
  Promociones: ['promociones'],
  'Galeria de fotos': ['galeria'],
  'Agenda de citas': ['agenda'],
  'Captar clientes': ['cta'],
  'Mostrar portafolio': ['portafolio'],
  'Explicar el producto': ['producto'],
  'Landing de ventas': ['beneficios', 'cta'],
  'Registro de usuarios': ['registro'],
};

const inferredSectionsMap: Record<string, string[]> = {
  restaurante: ['menu', 'reservas', 'galeria', 'ubicacion', 'testimonios'],
  polleria: ['menu', 'promociones', 'delivery', 'ubicacion'],
  cafeteria: ['menu', 'galeria', 'ubicacion', 'promociones'],
  abogado: ['especialidades', 'experiencia', 'casos', 'contacto'],
  psicologo: ['servicios', 'metodologia', 'agenda', 'contacto'],
  dentista: ['tratamientos', 'equipo', 'casos', 'reservas'],
  fotografo: ['portafolio', 'paquetes', 'testimonios', 'contacto'],
  'marca personal': ['sobre mi', 'servicios', 'contenido', 'contacto'],
  'startup tecnologica': ['problema', 'solucion', 'beneficios', 'cta'],
  'plataforma saas': ['producto', 'planes', 'faq', 'registro'],
};

const smartSectionFieldMap: Record<string, SmartSectionField[]> = {
  menu: [
    {
      key: 'menuHighlights',
      label: 'Menu o catalogo destacado',
      placeholder: 'Describe los platos, productos o categorias principales que deben aparecer.',
      multiline: true,
    },
    {
      key: 'catalogPdfUrl',
      label: 'Catalogo o menu en PDF',
      placeholder: 'Sube tu PDF para que la IA tome los productos, precios o categorias.',
    },
  ],
  promociones: [
    {
      key: 'promotionsDetails',
      label: 'Promociones vigentes',
      placeholder: 'Ej: 2x1 los martes, combo familiar, descuento por primera compra.',
      multiline: true,
    },
  ],
  delivery: [
    {
      key: 'deliveryInfo',
      label: 'Cobertura y condiciones de delivery',
      placeholder: 'Indica zonas, horarios, pedidos minimos o apps que usas para delivery.',
      multiline: true,
    },
  ],
  ubicacion: [
    {
      key: 'locationAddress',
      label: 'Direccion del negocio',
      placeholder: 'Ej: Av. Primavera 123, San Borja, Lima.',
    },
    {
      key: 'mapReference',
      label: 'Referencia o enlace de mapa',
      placeholder: 'Ej: Frente al parque / enlace de Google Maps.',
    },
  ],
  reservas: [
    {
      key: 'reservationDetails',
      label: 'Como funcionan las reservas',
      placeholder: 'Indica horarios, aforo, si reservas por WhatsApp o formulario.',
      multiline: true,
    },
  ],
  galeria: [
    {
      key: 'galleryNotes',
      label: 'Que deberia mostrar la galeria',
      placeholder: 'Describe fotos clave: local, productos, equipo, clientes, etc.',
      multiline: true,
    },
  ],
  testimonios: [
    {
      key: 'testimonialsNotes',
      label: 'Testimonios o comentarios destacados',
      placeholder: 'Comparte frases, reseñas o ideas de testimonios que quieras mostrar.',
      multiline: true,
    },
  ],
  especialidades: [
    {
      key: 'specialtiesDetails',
      label: 'Especialidades o areas principales',
      placeholder: 'Lista tus especialidades o areas de experiencia.',
      multiline: true,
    },
  ],
  experiencia: [
    {
      key: 'experienceDetails',
      label: 'Experiencia profesional',
      placeholder: 'Resume años de experiencia, cargos, logros o trayectoria.',
      multiline: true,
    },
  ],
  casos: [
    {
      key: 'caseStudies',
      label: 'Casos, proyectos o resultados',
      placeholder: 'Comparte ejemplos de casos atendidos, resultados o proyectos relevantes.',
      multiline: true,
    },
  ],
  contacto: [
    {
      key: 'contactPrompt',
      label: 'Mensaje o llamada a la accion de contacto',
      placeholder: 'Ej: Agenda una consulta hoy mismo / Escríbenos por WhatsApp.',
      multiline: true,
    },
  ],
  servicios: [
    {
      key: 'servicesSummary',
      label: 'Servicios que deben resaltarse',
      placeholder: 'Describe los servicios principales que quieres destacar.',
      multiline: true,
    },
  ],
  metodologia: [
    {
      key: 'methodologyDetails',
      label: 'Metodologia o forma de trabajo',
      placeholder: 'Explica como trabajas, tus fases o tu enfoque.',
      multiline: true,
    },
  ],
  agenda: [
    {
      key: 'agendaDetails',
      label: 'Agenda o citas',
      placeholder: 'Indica si atiendes por cita, horarios o modalidad de agendamiento.',
      multiline: true,
    },
  ],
  tratamientos: [
    {
      key: 'treatmentsDetails',
      label: 'Tratamientos o soluciones destacadas',
      placeholder: 'Describe los tratamientos o soluciones que ofreceras.',
      multiline: true,
    },
  ],
  equipo: [
    {
      key: 'teamInfo',
      label: 'Equipo o profesionales',
      placeholder: 'Comparte informacion del equipo que debe aparecer en la web.',
      multiline: true,
    },
  ],
  portafolio: [
    {
      key: 'portfolioHighlights',
      label: 'Portafolio o trabajos destacados',
      placeholder: 'Describe los proyectos o piezas mas importantes para mostrar.',
      multiline: true,
    },
  ],
  paquetes: [
    {
      key: 'packageDetails',
      label: 'Paquetes o planes',
      placeholder: 'Resume tus paquetes, rangos o servicios agrupados.',
      multiline: true,
    },
  ],
  problema: [
    {
      key: 'problemStatement',
      label: 'Problema que resuelve tu producto',
      placeholder: 'Explica el dolor o necesidad que atacas.',
      multiline: true,
    },
  ],
  solucion: [
    {
      key: 'solutionDescription',
      label: 'Solucion que ofreces',
      placeholder: 'Describe como funciona tu solucion o propuesta de valor.',
      multiline: true,
    },
  ],
  beneficios: [
    {
      key: 'benefitsList',
      label: 'Beneficios principales',
      placeholder: 'Enumera beneficios claros para el cliente.',
      multiline: true,
    },
  ],
  cta: [
    {
      key: 'ctaText',
      label: 'Llamada a la accion principal',
      placeholder: 'Ej: Solicita una demo / Empieza hoy / Habla con un asesor.',
    },
  ],
  producto: [
    {
      key: 'productDescription',
      label: 'Producto o plataforma',
      placeholder: 'Describe el producto, plataforma o software que vendes.',
      multiline: true,
    },
  ],
  planes: [
    {
      key: 'planInformation',
      label: 'Planes o niveles',
      placeholder: 'Resume que planes existen o como deberian presentarse.',
      multiline: true,
    },
  ],
  faq: [
    {
      key: 'faqDetails',
      label: 'Preguntas frecuentes',
      placeholder: 'Escribe dudas comunes que deberian resolverse en la web.',
      multiline: true,
    },
  ],
  registro: [
    {
      key: 'registrationFlow',
      label: 'Registro o onboarding de usuarios',
      placeholder: 'Describe que datos pide el registro o como deberia funcionar.',
      multiline: true,
    },
  ],
};


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
  const { toast } = useToast();
  const heroActiveClass = 'border-cta bg-cta text-cta-foreground shadow-sm';
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
  const [tab, setTab] = useState<'projects' | 'billing' | 'account'>('projects');
  const [renewals, setRenewals] = useState<any[]>([]);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    billingName: '',
    billingAddress: '',
    billingDepartment: 'Lima',
    billingEmail: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [revisionSending, setRevisionSending] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [catalogPdfFile, setCatalogPdfFile] = useState<File | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewMethod, setRenewMethod] = useState<'card' | 'yape' | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  // Paginacion "Cargar mas": mostramos los 5 mas recientes por defecto.
  const PROJECTS_PAGE_SIZE = 5;
  const [visibleProjectsCount, setVisibleProjectsCount] =
    useState<number>(PROJECTS_PAGE_SIZE);

  const formatDate = (value: string | null) => {
    if (!value) return 'Sin fecha';
    const d = new Date(value);
    const day = d.getDate();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const month = monthNames[d.getMonth()];
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = hours.toString().padStart(2, '0') + ':' + minutes + ampm;
    return `${day} ${month} ${strTime}`;
  };

  const [formData, setFormData] = useState({
    domainOption: 'subdomain',
    subdomain: '',
    businessIdentity: '' as BusinessIdentity | '',
    businessTypeQuery: '',
    businessType: '',
    colorScheme: '',
    visualStyle: '',
    features: [] as string[],
    businessName: '',
    businessSector: '',
    city: '',
    shortDescription: '',
    salesType: '',
    workMode: '',
    professionalGoal: '',
    businessModel: '',
    smartNeeds: [] as string[],
    smartSectionContent: {} as Record<string, string>,
    primaryServices: [''] as string[],
    audience: [] as string[],
    colors: '',
    references: '',
    hasLogo: 'no',
    logoUrl: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    tiktok: '',
    contactEmail: '',
    additionalInstructions: '',
    imageInstructions: '',
    confirm: false,
  });

  const loadData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Necesitas iniciar sesion.');
      setLoading(false);
      return;
    }

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
      setProfileForm({
        billingName: meData.billingName || '',
        billingAddress: meData.billingAddress || '',
        billingDepartment: meData.billingDepartment || 'Lima',
        billingEmail: meData.billingEmail || '',
      });

      const projectRes = await fetch(`${apiBase}/projects/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await projectRes.text();
      const data = text ? JSON.parse(text) : [];
      if (!projectRes.ok) throw new Error((data as any)?.message || 'No se pudo cargar el proyecto');
      const list = Array.isArray(data) ? data : [];
      if (list.length === 0 && meData?.role !== 'ADMIN') {
        const hostingRes = await fetch(`${apiBase}/hosting/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hostingRes.ok) {
          window.location.href = '/dashboard/hosting';
          return;
        }
      }
      const normalizedList = list.map(normalizeProject);
      setProjects(normalizedList);
      const current = normalizedList[0] ?? null;
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
          setAdminProjects(
            (Array.isArray(listData) ? listData : []).map(normalizeProject),
          );
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    if (!project) return;
    const data = project.onboardingData || {};
    setFormData((prev) => ({
      ...prev,
      domainOption: data.domainOption ?? prev.domainOption,
      subdomain: data.subdomain ?? prev.subdomain,
      businessIdentity: data.businessIdentity ?? prev.businessIdentity,
      businessTypeQuery: data.businessType ?? data.businessTypeQuery ?? prev.businessTypeQuery,
      businessType: data.businessType ?? prev.businessType,
      colorScheme: data.colorScheme ?? prev.colorScheme,
      visualStyle: data.visualStyle ?? prev.visualStyle,
      features: Array.isArray(data.features) ? data.features : prev.features,
      businessName: data.businessName ?? prev.businessName,
      businessSector: data.businessSector ?? prev.businessSector,
      city: data.city ?? prev.city,
      shortDescription: data.shortDescription ?? prev.shortDescription,
      salesType: data.salesType ?? prev.salesType,
      workMode: data.workMode ?? prev.workMode,
      professionalGoal: data.professionalGoal ?? prev.professionalGoal,
      businessModel: data.businessModel ?? prev.businessModel,
      smartNeeds: Array.isArray(data.smartNeeds) ? data.smartNeeds : prev.smartNeeds,
      smartSectionContent:
        data.smartSectionContent && typeof data.smartSectionContent === 'object'
          ? data.smartSectionContent
          : prev.smartSectionContent,
      primaryServices:
        Array.isArray(data.primaryServices) && data.primaryServices.length
          ? data.primaryServices
          : prev.primaryServices,
      audience: Array.isArray(data.audience) ? data.audience : prev.audience,
      colors: data.colors ?? prev.colors,
      references: data.references ?? prev.references,
      hasLogo: data.hasLogo ?? prev.hasLogo,
      logoUrl: data.logoUrl ?? prev.logoUrl,
      instagram: data.instagram ?? prev.instagram,
      facebook: data.facebook ?? prev.facebook,
      whatsapp: data.whatsapp ?? prev.whatsapp,
      tiktok: data.tiktok ?? prev.tiktok,
      contactEmail: data.contactEmail ?? prev.contactEmail,
      additionalInstructions: data.additionalInstructions ?? prev.additionalInstructions,
      imageInstructions: data.imageInstructions ?? prev.imageInstructions,
      confirm: data.confirm ?? prev.confirm,
    }));
  }, [project]);

  const handleSelectProject = (proj: Project) => {
    const normalized = normalizeProject(proj);
    setSelectedProjectId(normalized.id);
    setProject(normalized);
    if (normalized?.onboardingData?.subdomain) {
      setStep(Math.max(1, Math.min(6, normalized.onboardingStep ?? 1)));
    } else {
      setStep(1);
    }
  };

  const progressInfo = useMemo(() => {
    if (!project?.deadline) return null;
    const deadlineMs = new Date(project.deadline).getTime();
    const startedMs = project.startedAt ? new Date(project.startedAt).getTime() : null;
    
    // Usar los nuevos tiempos: 24h para Landing, 48h para Web
    const defaultTotal =
      project.type === 'LANDING' ? 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000;
    
    const totalMs = startedMs ? Math.max(deadlineMs - startedMs, 1) : defaultTotal;
    const startMs = startedMs ?? deadlineMs - totalMs;
    const elapsed = Math.max(now - startMs, 0);
    const rawProgress = Math.min(elapsed / totalMs, 1);
    
    // Solo está completo si ya fue ENTREGADO (DELIVERED)
    const data = (project.onboardingData as any) || {};
    const aiGeneration = data.aiGeneration || {};
    const deadlinePassed = deadlineMs <= now;
    
    // Un proyecto esta "atascado" si paso el tiempo y no esta listo ni publicado
    const isStuck = project.status === 'IN_PROGRESS' && deadlinePassed && aiGeneration.status !== 'READY';
    const hasAiError = aiGeneration.status === 'FAILED' || isStuck;

    const isComplete = project.status === 'DELIVERED';
    const progress = isComplete ? 1 : Math.min(rawProgress, 0.95);
    const step = isComplete ? 4 : Math.max(1, Math.min(3, Math.floor(progress * 3) + 1));
    
    const diff = Math.max(deadlineMs - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    return {
      progressPercent: Math.round(progress * 100),
      currentStep: step,
      isComplete,
      hasAiError,
      aiErrorMsg: isStuck ? 'El plazo de entrega ha vencido y el sitio aun no esta listo. Esto puede deberse a un error en el servidor de IA.' : aiGeneration.error,
      timeRemaining: { days, hours },
      deadlineMs,
    };
  }, [project?.deadline, project?.startedAt, project?.status, project?.type, project?.onboardingData, now]);

  const resolvedPublicUrl = useMemo(() => {
    if (!project) return '';
    const data = project.onboardingData || {};
    const aiGeneration = data.aiGeneration || {};

    // Si ya está entregado, mostrar URL final del subdominio
    if (project.status === 'DELIVERED') {
      if (data.publicUrl) return data.publicUrl as string;
      if (data.publicDomain) return `https://${data.publicDomain}`;
    }

    // Durante la espera de 24h: mostrar la landing temporal con countdown
    if (data.tempLandingUrl) return data.tempLandingUrl as string;

    // Compatibilidad: proyectos viejos sin tempLandingUrl
    if (aiGeneration.status === 'READY' && aiGeneration.previewUrl) {
      return aiGeneration.previewUrl as string;
    }

    if (data.subdomain) {
      return `https://${data.subdomain}.${domainBase}`;
    }

    return '';
  }, [project, project?.onboardingData, domainBase]);


  const normalizeSubdomain = (value: string) => {
    let raw = value.trim().toLowerCase();
    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (raw.endsWith(`.${domainBase.toLowerCase()}`)) {
      raw = raw.slice(0, -(`.${domainBase.toLowerCase()}`.length));
    }

    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);
  };

  const normalizeSearchValue = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const selectedIdentity = identityOptions.find((item) => item.id === formData.businessIdentity) ?? null;
  const filteredBusinessOptions = useMemo(() => {
    if (!selectedIdentity) return [];
    const query = normalizeSearchValue(formData.businessTypeQuery);
    if (!query) return selectedIdentity.options;
    return selectedIdentity.options.filter((option) => normalizeSearchValue(option).includes(query));
  }, [selectedIdentity, formData.businessTypeQuery]);

  const inferredSections = useMemo(() => {
    const key = normalizeSearchValue(formData.businessType);
    return inferredSectionsMap[key] ?? [];
  }, [formData.businessType]);

  const manualSections = useMemo(
    () => formData.smartNeeds.flatMap((need) => smartNeedSectionMap[need] ?? []),
    [formData.smartNeeds],
  );

  const effectiveSections = useMemo(
    () => Array.from(new Set([...inferredSections, ...manualSections])),
    [inferredSections, manualSections],
  );

  const smartSectionFields = useMemo(
    () =>
      effectiveSections
        .flatMap((section) => smartSectionFieldMap[section] ?? [])
        .filter((field, index, all) => all.findIndex((item) => item.key === field.key) === index),
    [effectiveSections],
  );
  useEffect(() => {
    if (!effectiveSections.includes('menu')) {
      setCatalogPdfFile(null);
    }
  }, [effectiveSections]);
  const smartSectionFieldLabels = useMemo(
    () =>
      smartSectionFields.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = field.label;
        return acc;
      }, {}),
    [smartSectionFields],
  );

  const updatePrimaryService = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.primaryServices];
      next[index] = value;
      return { ...prev, primaryServices: next };
    });
  };

  const addPrimaryService = () => {
    setFormData((prev) => {
      if (prev.primaryServices.length >= 5) return prev;
      return { ...prev, primaryServices: [...prev.primaryServices, ''] };
    });
  };

  const removePrimaryService = (index: number) => {
    setFormData((prev) => {
      if (prev.primaryServices.length === 1) {
        return { ...prev, primaryServices: [''] };
      }
      return {
        ...prev,
        primaryServices: prev.primaryServices.filter((_, serviceIndex) => serviceIndex !== index),
      };
    });
  };

  const toggleSmartNeed = (value: string) => {
    setFormData((prev) => {
      const exists = prev.smartNeeds.includes(value);
      return {
        ...prev,
        smartNeeds: exists
          ? prev.smartNeeds.filter((item) => item !== value)
          : [...prev.smartNeeds, value],
      };
    });
  };

  const selectBusinessIdentity = (identity: BusinessIdentity) => {
    setCatalogPdfFile(null);
    setFormData((prev) => ({
      ...prev,
      businessIdentity: identity,
      businessTypeQuery: '',
      businessType: '',
      businessSector: '',
      salesType: '',
      workMode: '',
      professionalGoal: '',
      businessModel: '',
      smartNeeds: [],
      smartSectionContent: {},
      primaryServices: [''],
    }));
  };

  const selectBusinessType = (value: string) => {
    setCatalogPdfFile(null);
    setFormData((prev) => ({
      ...prev,
      businessType: value,
      businessTypeQuery: value,
      businessSector: value,
      smartSectionContent: {},
    }));
  };

  const updateSmartSectionContent = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      smartSectionContent: {
        ...prev.smartSectionContent,
        [key]: value,
      },
    }));
  };

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
    if (step === 2) {
      if (!formData.businessIdentity) {
        setFormError('Selecciona que tipo de cliente eres.');
        return;
      }
      if (!formData.businessType) {
        setFormError('Selecciona tu tipo de negocio, profesion o proyecto.');
        return;
      }
      if (formData.businessIdentity === 'local-business') {
        if (!formData.salesType) {
          setFormError('Selecciona como vendes o atiendes.');
          return;
        }
        if (!formData.smartNeeds.length) {
          setFormError('Selecciona que necesitas en tu web.');
          return;
        }
      }
      if (formData.businessIdentity === 'professional') {
        if (!formData.workMode) {
          setFormError('Selecciona como trabajas.');
          return;
        }
        if (!formData.professionalGoal) {
          setFormError('Selecciona el objetivo principal de tu web.');
          return;
        }
        if (!formData.primaryServices.some((item) => item.trim())) {
          setFormError('Agrega al menos un servicio principal.');
          return;
        }
      }
      if (formData.businessIdentity === 'digital-project') {
        if (!formData.businessModel) {
          setFormError('Selecciona tu modelo de negocio.');
          return;
        }
        if (!formData.smartNeeds.length) {
          setFormError('Selecciona lo que necesita tu web.');
          return;
        }
      }
    }
    if (step === 3) {
      if (!formData.businessName.trim() || !formData.city.trim()) {
        setFormError('Completa el nombre del proyecto y la ciudad.');
        return;
      }
      if (!formData.shortDescription.trim()) {
        setFormError('Agrega una descripcion corta para orientar mejor la web.');
        return;
      }
      if (!formData.audience.length) {
        setFormError('Selecciona al menos un publico objetivo.');
        return;
      }
    }
    setFormError(null);
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
    if (!formData.businessIdentity || !formData.businessType) {
      setFormError('Completa el perfil inteligente de tu proyecto.');
      return;
    }
    if (!formData.businessName.trim() || !formData.city.trim()) {
      setFormError('Completa los datos basicos del negocio.');
      return;
    }
    if (!formData.shortDescription.trim()) {
      setFormError('Agrega una descripcion corta.');
      return;
    }
    if (!formData.audience.length) {
      setFormError('Selecciona al menos un publico objetivo.');
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
      let catalogPdfUrl = formData.smartSectionContent.catalogPdfUrl ?? '';

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

      if (effectiveSections.includes('menu') && catalogPdfFile) {
        if (catalogPdfFile.type !== 'application/pdf') {
          throw new Error('El catalogo debe estar en formato PDF.');
        }
        if (catalogPdfFile.size > 5 * 1024 * 1024) {
          throw new Error('El PDF del catalogo no puede pesar mas de 5MB.');
        }

        const form = new FormData();
        form.append('file', catalogPdfFile);
        form.append('fieldKey', 'catalogPdfUrl');
        const documentRes = await fetch(`${apiBase}/projects/${project.id}/document`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!documentRes.ok) {
          const text = await documentRes.text();
          const data = text ? JSON.parse(text) : null;
          throw new Error(data?.message || 'No se pudo subir el PDF del catalogo.');
        }

        const documentData = await documentRes.json().catch(() => ({}));
        catalogPdfUrl =
          documentData?.onboardingData?.catalogPdfUrl ??
          documentData?.catalogPdfUrl ??
          catalogPdfUrl;
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
            businessSector: formData.businessSector || formData.businessType,
            smartSectionContent: {
              ...formData.smartSectionContent,
              ...(catalogPdfUrl ? { catalogPdfUrl } : {}),
            },
            effectiveSections,
            inferredSections,
            logoUrl,
            images: uploadedImages,
            imageInstructions: formData.imageInstructions,
          },
        }),
      });

      const submitText = await res.text();
      const submitData = submitText ? JSON.parse(submitText) : null;
      if (!res.ok) {
        throw new Error(
          submitData?.message ||
            submitData?.error_message ||
            'No se pudo guardar la informacion',
        );
      }
      const updated = normalizeProject(submitData);
      setProject(updated);
    } catch (err: any) {
      setFormError(err.message ?? 'Error al enviar la informacion');
    } finally {
      setSubmitting(false);
    }
  };

  const updateProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setProfileBusy(true);
    setProfileSuccess(false);
    try {
      const res = await fetch(`${apiBase}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error(await res.text());
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      
      const meRes = await fetch(`${apiBase}/auth/me`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        setUser(await meRes.json());
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setProfileBusy(false);
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
      setProject(normalizeProject(data));
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

  const handleRetryAi = async () => {
    if (!project) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/projects/${project.id}/generate-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast({
        title: 'Generación reiniciada',
        description: 'La IA esta trabajando de nuevo en tu sitio web.',
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error al reiniciar',
        description: err.message || 'No se pudo contactar con el servicio de IA.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiBase}/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        let message = 'No se pudo eliminar el proyecto.';
        try {
          message = (text ? JSON.parse(text) : null)?.message || message;
        } catch {
          /* respuesta no-JSON */
        }
        throw new Error(message);
      }
      toast({
        title: 'Proyecto eliminado',
        description: `"${projectToDelete.name}" se eliminó de la plataforma y de CyberPanel.`,
      });
      setProjectToDelete(null);
      setDeleteConfirmText('');
      await loadData();
    } catch (err: any) {
      toast({
        title: 'Error al eliminar',
        description: err?.message || 'No se pudo eliminar el proyecto.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
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
            <button 
              onClick={() => setTab('projects')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors",
                tab === 'projects' ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground"
              )}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setTab('billing')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors",
                tab === 'billing' ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground"
              )}
            >
              Facturacion
            </button>
            <button 
              onClick={() => setTab('account')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors",
                tab === 'account' ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground"
              )}
            >
              Mi cuenta
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground"
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

          <div className="px-6 py-8 space-y-6">
            {tab === 'account' && (
              <div className="grid gap-6 md:grid-cols-[1fr_0.7fr]">
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Datos de Facturación</CardTitle>
                    <CardDescription>Información persistente para tus comprobantes de pago.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nombre Completo o Razón Social</label>
                        <Input
                          placeholder="Ej. Juan Perez"
                          value={profileForm.billingName}
                          onChange={(e) => setProfileForm(p => ({ ...p, billingName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Dirección de Facturación</label>
                        <Input
                          placeholder="Av. Principal 123, Int 4"
                          value={profileForm.billingAddress}
                          onChange={(e) => setProfileForm(p => ({ ...p, billingAddress: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Departamento</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={profileForm.billingDepartment}
                            onChange={(e) => setProfileForm(p => ({ ...p, billingDepartment: e.target.value }))}
                          >
                            <option value="Lima">Lima</option>
                            <option value="Amazonas">Amazonas</option>
                            <option value="Áncash">Áncash</option>
                            <option value="Apurímac">Apurímac</option>
                            <option value="Arequipa">Arequipa</option>
                            <option value="Ayacucho">Ayacucho</option>
                            <option value="Cajamarca">Cajamarca</option>
                            <option value="Callao">Callao</option>
                            <option value="Cusco">Cusco</option>
                            <option value="Huancavelica">Huancavelica</option>
                            <option value="Huánuco">Huánuco</option>
                            <option value="Ica">Ica</option>
                            <option value="Junín">Junín</option>
                            <option value="La Libertad">La Libertad</option>
                            <option value="Lambayeque">Lambayeque</option>
                            <option value="Loreto">Loreto</option>
                            <option value="Madre de Dios">Madre de Dios</option>
                            <option value="Moquegua">Moquegua</option>
                            <option value="Pasco">Pasco</option>
                            <option value="Piura">Piura</option>
                            <option value="Puno">Puno</option>
                            <option value="San Martín">San Martín</option>
                            <option value="Tacna">Tacna</option>
                            <option value="Tumbes">Tumbes</option>
                            <option value="Ucayali">Ucayali</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Email de Facturación</label>
                          <Input
                            type="email"
                            placeholder="factura@tuempresa.com"
                            value={profileForm.billingEmail}
                            onChange={(e) => setProfileForm(p => ({ ...p, billingEmail: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {profileSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Datos guardados correctamente.
                      </div>
                    )}

                    <Button variant="cta" className="w-full rounded-xl" onClick={updateProfile} disabled={profileBusy}>
                      {profileBusy ? 'Guardando...' : 'Guardar Información'}
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Perfil de Usuario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-xl border border-border px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nombre</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{user?.name}</p>
                      </div>
                      <div className="rounded-xl border border-border px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{user?.email}</p>
                      </div>
                      <div className="rounded-xl border border-border px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rol</p>
                        <Badge variant="outline" className="mt-1">{user?.role}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {tab === 'billing' && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Metodo de pago</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border p-5 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Tarjeta de credito/debito</p>
                          <p className="text-xs text-muted-foreground">
                            Cobro automatico activo para renovacion anual.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl bg-cta/5 border border-cta/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-cta-foreground/70">Proxima renovacion</p>
                        <span className="text-lg font-bold text-foreground">S/ {project?.order?.plan?.price === 390 ? 135 : 165}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">Costo anual por hosting y dominio.</p>
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
                          {renewals.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-xs text-muted-foreground">
                                Tu primer año esta incluido. No hay renovaciones todavia.
                              </td>
                            </tr>
                          ) : (
                            renewals.map((ren) => (
                              <tr key={ren.id} className="border-b border-border/50">
                                <td className="px-4 py-3 text-xs">{formatDate(ren.createdAt)}</td>
                                <td className="px-4 py-3 text-xs font-bold text-foreground">S/ {ren.amount}</td>
                                <td className="px-4 py-3 text-xs">
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-[10px]">Pagado</Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Solo se muestran los ultimos pagos realizados.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'projects' && isAdmin && (
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar proyecto"
                          onClick={() => {
                            setDeleteConfirmText('');
                            setProjectToDelete(proj);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {!isAdmin && !project && tab === 'projects' && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">🌐</div>
                <h2 className="text-xl font-bold">Aún no tienes un proyecto</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Contrata un plan para comenzar a construir tu presencia en línea con PLIA.
                </p>
                <a href="/planes" className="inline-flex items-center gap-2 rounded-full bg-[#D9FF00] text-black font-semibold px-6 py-2 hover:opacity-90 transition">
                  Ver planes
                </a>
              </div>
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
                        { label: 'Perfil', active: step === 2 },
                        { label: 'Negocio', active: step === 3 },
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

                        <div
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            formData.domainOption === 'subdomain'
                              ? 'border-cta bg-cta/10'
                              : 'border-border bg-white'
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, domainOption: 'subdomain' }))
                          }
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
                                setFormData((prev) => ({
                                  ...prev,
                                  subdomain: normalizeSubdomain(e.target.value),
                                }))
                              }
                            />
                            <span className="text-sm text-muted-foreground">.plia.pe</span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Solo letras, numeros y guion. Minimo 3, maximo 30.
                          </p>
                        </div>

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
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            SOY:
                          </p>
                          <div className="grid gap-3 md:grid-cols-3">
                            {identityOptions.map((option) => {
                              const active = formData.businessIdentity === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  className={`min-h-32 rounded-3xl border p-5 text-left transition ${
                                    active
                                      ? heroActiveClass
                                      : 'border-border bg-white hover:border-foreground/20'
                                  }`}
                                  onClick={() => selectBusinessIdentity(option.id)}
                                >
                                  <p className="text-base font-semibold leading-snug">{option.label}</p>
                                  <p className="mt-2 text-xs text-muted-foreground">{option.description}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedIdentity && (
                          <div className="rounded-3xl border border-border bg-white p-5">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">{selectedIdentity.title}</h3>
                              <p className="text-sm text-muted-foreground">{selectedIdentity.description}</p>
                            </div>

                            <div className="mt-5 space-y-3">
                              <label className="text-sm font-medium">Buscador</label>
                              <Input
                                placeholder={selectedIdentity.searchPlaceholder}
                                value={formData.businessTypeQuery}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    businessTypeQuery: e.target.value,
                                  }))
                                }
                              />
                              <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-border/70 bg-muted/20 p-3">
                                {filteredBusinessOptions.length > 0 ? (
                                  filteredBusinessOptions.map((option) => {
                                    const active = formData.businessType === option;
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                                          active
                                            ? 'bg-cta text-cta-foreground'
                                            : 'bg-white text-foreground hover:bg-muted'
                                        }`}
                                        onClick={() => selectBusinessType(option)}
                                      >
                                        <span>{option}</span>
                                        {active && <Check size={14} />}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-5 text-sm text-muted-foreground">
                                    No hay coincidencias con esa busqueda. Prueba con otra palabra o rubro.
                                  </div>
                                )}
                              </div>
                            </div>

                            {formData.businessType && (
                              <div className="mt-5 space-y-5">
                                {formData.businessIdentity === 'local-business' && (
                                  <>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Tipo de venta</label>
                                      <div className="flex flex-wrap gap-2">
                                        {localSalesTypes.map((option) => {
                                          const active = formData.salesType === option;
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => setFormData((prev) => ({ ...prev, salesType: option }))}
                                            >
                                              {option}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Que quiere en su web</label>
                                      <div className="flex flex-wrap gap-2">
                                        {localNeeds.map((need) => {
                                          const active = formData.smartNeeds.includes(need);
                                          return (
                                            <button
                                              key={need}
                                              type="button"
                                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => toggleSmartNeed(need)}
                                            >
                                              <span
                                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                                  active ? 'border-cta bg-cta text-cta-foreground' : 'border-border'
                                                }`}
                                              >
                                                {active && <Check size={10} />}
                                              </span>
                                              {need}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {formData.businessIdentity === 'professional' && (
                                  <>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Como trabaja</label>
                                      <div className="flex flex-wrap gap-2">
                                        {professionalWorkModes.map((option) => {
                                          const active = formData.workMode === option;
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => setFormData((prev) => ({ ...prev, workMode: option }))}
                                            >
                                              {option}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Objetivo de la web</label>
                                      <div className="flex flex-wrap gap-2">
                                        {professionalGoals.map((option) => {
                                          const active = formData.professionalGoal === option;
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => setFormData((prev) => ({ ...prev, professionalGoal: option }))}
                                            >
                                              {option}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Servicios principales</label>
                                      <div className="space-y-3">
                                        {formData.primaryServices.map((service, index) => (
                                          <div key={index} className="flex items-center gap-3">
                                            <Input
                                              value={service}
                                              onChange={(e) => updatePrimaryService(index, e.target.value)}
                                              placeholder={`Servicio ${index + 1}`}
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => removePrimaryService(index)}
                                              disabled={formData.primaryServices.length === 1 && !service.trim()}
                                            >
                                              Quitar
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addPrimaryService}
                                        disabled={formData.primaryServices.length >= 5}
                                      >
                                        Anadir servicio
                                      </Button>
                                      <p className="text-xs text-muted-foreground">
                                        Puedes agregar hasta 5 servicios principales.
                                      </p>
                                    </div>
                                  </>
                                )}

                                {formData.businessIdentity === 'digital-project' && (
                                  <>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Modelo de negocio</label>
                                      <div className="flex flex-wrap gap-2">
                                        {digitalBusinessModels.map((option) => {
                                          const active = formData.businessModel === option;
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => setFormData((prev) => ({ ...prev, businessModel: option }))}
                                            >
                                              {option}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Que necesita la web</label>
                                      <div className="flex flex-wrap gap-2">
                                        {digitalNeeds.map((need) => {
                                          const active = formData.smartNeeds.includes(need);
                                          return (
                                            <button
                                              key={need}
                                              type="button"
                                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                                                active
                                                  ? 'border-cta bg-cta/10 text-foreground'
                                                  : 'border-border bg-white text-muted-foreground'
                                              }`}
                                              onClick={() => toggleSmartNeed(need)}
                                            >
                                              <span
                                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                                  active ? 'border-cta bg-cta text-cta-foreground' : 'border-border'
                                                }`}
                                              >
                                                {active && <Check size={10} />}
                                              </span>
                                              {need}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {inferredSections.length > 0 && (
                                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-sm font-semibold text-emerald-900">
                                      Secciones sugeridas automaticamente para tu web
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {inferredSections.map((section) => (
                                        <span
                                          key={section}
                                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-900"
                                        >
                                          {section}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre de la empresa o proyecto</label>
                          <Input
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rubro o actividad</label>
                          <Input
                            value={formData.businessSector}
                            onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                            placeholder={formData.businessType || 'Ej: Restaurante, Estudio contable, SaaS'}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pais / ciudad</label>
                          <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descripcion corta</label>
                          <Textarea
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            placeholder="Resume en pocas lineas que haces, que vendes o como ayudas a tus clientes."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Referencias de webs (opcional)</label>
                          <Input
                            value={formData.references}
                            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                            placeholder="Ej: https://ejemplo.com, https://otraweb.com"
                          />
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
                            <p className="mt-1 text-xs text-muted-foreground">
                              Formato recomendado: <span className="font-semibold">.png sin fondo</span> (transparente). Así la IA lo coloca limpio sobre cualquier color de fondo.
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              className="mt-2"
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
                        {smartSectionFields.length > 0 && (
                          <div className="space-y-4 rounded-3xl border border-border bg-white p-5">
                            <div>
                              <h3 className="text-base font-semibold">Campos inteligentes segun tu rubro</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Estos campos aparecieron segun las secciones sugeridas y las opciones que seleccionaste para tu web.
                              </p>
                            </div>
                            <div className="grid gap-4">
                              {smartSectionFields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                  <label className="text-sm font-medium">{field.label}</label>
                                  {field.key === 'catalogPdfUrl' ? (
                                    <div className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
                                      <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] ?? null;
                                          if (file && file.size > 5 * 1024 * 1024) {
                                            setFormError('El PDF del catalogo no puede pesar mas de 5MB.');
                                            setCatalogPdfFile(null);
                                            return;
                                          }
                                          setFormError(null);
                                          setCatalogPdfFile(file);
                                        }}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Sube un PDF de hasta 5MB con tu menu, catalogo o lista de productos.
                                      </p>
                                      {(catalogPdfFile || formData.smartSectionContent.catalogPdfUrl) && (
                                        <div className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-muted-foreground">
                                          {catalogPdfFile?.name || 'Ya existe un PDF cargado para este catalogo.'}
                                        </div>
                                      )}
                                    </div>
                                  ) : field.multiline ? (
                                    <Textarea
                                      value={formData.smartSectionContent[field.key] ?? ''}
                                      onChange={(e) => updateSmartSectionContent(field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                    />
                                  ) : (
                                    <Input
                                      value={formData.smartSectionContent[field.key] ?? ''}
                                      onChange={(e) => updateSmartSectionContent(field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                          <div><strong>Perfil:</strong> {selectedIdentity?.label || '-'}</div>
                          <div><strong>Tipo:</strong> {formData.businessType || '-'}</div>
                          <div><strong>Empresa:</strong> {formData.businessName || '-'}</div>
                          <div><strong>Rubro:</strong> {formData.businessSector || formData.businessType || '-'}</div>
                          <div><strong>Ciudad:</strong> {formData.city || '-'}</div>
                          <div><strong>Descripcion:</strong> {formData.shortDescription || '-'}</div>
                          <div><strong>Referencias:</strong> {formData.references || '-'}</div>
                          <div><strong>Publico:</strong> {formData.audience.join(', ') || '-'}</div>
                          {formData.salesType && <div><strong>Tipo de venta:</strong> {formData.salesType}</div>}
                          {formData.workMode && <div><strong>Como trabaja:</strong> {formData.workMode}</div>}
                          {formData.professionalGoal && <div><strong>Objetivo:</strong> {formData.professionalGoal}</div>}
                          {formData.businessModel && <div><strong>Modelo:</strong> {formData.businessModel}</div>}
                          {formData.primaryServices.some((item) => item.trim()) && (
                            <div><strong>Servicios:</strong> {formData.primaryServices.filter((item) => item.trim()).join(', ')}</div>
                          )}
                          {formData.smartNeeds.length > 0 && (
                            <div><strong>Necesidades:</strong> {formData.smartNeeds.join(', ')}</div>
                          )}
                          {effectiveSections.length > 0 && (
                            <div><strong>Secciones activas:</strong> {effectiveSections.join(', ')}</div>
                          )}
                          {Object.entries(formData.smartSectionContent)
                            .filter(([, value]) => value.trim())
                            .map(([key, value]) => (
                              <div key={key}>
                                <strong>{smartSectionFieldLabels[key] || key}:</strong> {value}
                              </div>
                            ))}
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
                          {(project?.type === 'LANDING' || project?.order?.plan?.name?.toLowerCase().includes('landing')) ? '1 día' : '2 días'}
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
                        {projects.slice(0, visibleProjectsCount).map((proj) => {
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
                                  {proj.status === 'DELIVERED' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      asChild
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <a
                                        href={
                                          proj.onboardingData?.publicUrl ||
                                          (proj.onboardingData?.publicDomain
                                            ? `https://${proj.onboardingData.publicDomain}`
                                            : '#')
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Ver sitio web
                                      </a>
                                    </Button>
                                  ) : canView ? (
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
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Eliminar proyecto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmText('');
                                      setProjectToDelete(proj);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {projects.length > visibleProjectsCount && (
                          <div className="flex flex-col items-center gap-2 pt-3">
                            <Button
                              variant="ctaOutline"
                              size="sm"
                              className="rounded-full px-6"
                              onClick={() =>
                                setVisibleProjectsCount((c) =>
                                  Math.min(c + PROJECTS_PAGE_SIZE, projects.length),
                                )
                              }
                            >
                              Cargar {Math.min(PROJECTS_PAGE_SIZE, projects.length - visibleProjectsCount)} más
                            </Button>
                            <p className="text-[11px] text-muted-foreground">
                              Mostrando {visibleProjectsCount} de {projects.length} proyectos
                            </p>
                          </div>
                        )}
                        {projects.length > PROJECTS_PAGE_SIZE && visibleProjectsCount >= projects.length && (
                          <div className="flex flex-col items-center gap-2 pt-3">
                            <button
                              type="button"
                              className="text-xs text-muted-foreground underline hover:text-foreground"
                              onClick={() => setVisibleProjectsCount(PROJECTS_PAGE_SIZE)}
                            >
                              Mostrar solo los {PROJECTS_PAGE_SIZE} más recientes
                            </button>
                          </div>
                        )}
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
                        {project.onboardingData?.aiGeneration?.status === 'FAILED' && (
                          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                            {project.onboardingData?.aiGeneration?.error ||
                              'La generacion automatica fallo. El equipo debe revisar este proyecto antes de publicarlo.'}
                          </div>
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

                        {progressInfo?.hasAiError ? (
                          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mt-4">
                            <p className="font-bold text-sm text-destructive flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" /> Error en la generación IA
                            </p>
                            <p className="text-xs mt-1 text-muted-foreground">{progressInfo.aiErrorMsg || 'Ocurrió un problema de conexión con OpenAI.'}</p>
                            <Button onClick={handleRetryAi} variant="outline" size="sm" className="mt-3 text-xs w-full">
                              Reintentar Generacion
                            </Button>
                          </div>
                        ) : progressInfo?.timeRemaining && !progressInfo.isComplete ? (
                          <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Tiempo restante</p>
                              <p className="text-xl font-semibold">
                                {progressInfo.timeRemaining.days}d {progressInfo.timeRemaining.hours}h
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">Entrega estimada</div>
                          </div>
                        ) : null}
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

      <Dialog
        open={!!projectToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setProjectToDelete(null);
            setDeleteConfirmText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Eliminar proyecto permanentemente
            </DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar
              {projectToDelete ? ` «${projectToDelete.name}»` : ' este proyecto'}{' '}
              de forma permanente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <p>Se borrará por completo y sin posibilidad de recuperación:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>El sitio web y todos sus archivos del servidor</li>
              <li>El dominio/subdominio en CyberPanel</li>
              <li>Todos los datos del proyecto en la plataforma</li>
            </ul>
            <p className="font-medium text-destructive">
              Esta acción NO se puede deshacer. Úsala solo como último recurso.
            </p>
            <div className="space-y-2 pt-1">
              <label className="block text-sm font-medium text-foreground">
                Escribe{' '}
                <span className="font-mono font-semibold">
                  {projectToDelete?.name}
                </span>{' '}
                para confirmar:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={projectToDelete?.name ?? ''}
                autoComplete="off"
                disabled={deleting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProjectToDelete(null);
                setDeleteConfirmText('');
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={
                deleting ||
                deleteConfirmText.trim() !== (projectToDelete?.name ?? '')
              }
            >
              {deleting ? 'Eliminando...' : 'Eliminar para siempre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
