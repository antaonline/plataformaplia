'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Globe,
  HardDrive,
  HardDriveDownload,
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
  FileCode,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  plan: { name: string; slug: string | null; billingCycleMonths: number; renewsAt: string | null; price: number };
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
    appType: 'EMPTY' | 'STATIC_UPLOAD' | 'WORDPRESS';
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
  billingName?: string;
  billingAddress?: string;
  billingDepartment?: string;
  billingEmail?: string;
};

const tabs = [
  { id: 'overview', label: 'Mis Sitios', icon: Globe },
  { id: 'plan', label: 'Mi Plan', icon: BarChart3 },
  { id: 'billing', label: 'Facturacion', icon: CreditCard },
  { id: 'account', label: 'Mi Cuenta', icon: KeyRound },
  { id: 'support', label: 'Soporte', icon: Headphones },
] as const;

const formatStorage = (value: number) => (value >= 1024 ? `${(value / 1024).toFixed(1)} GB` : `${value} MB`);
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

export default function HostingDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [upgradePreview, setUpgradePreview] = useState<any>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const [upgradeBusy, setUpgradeBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [useSavedCardUpgrade, setUseSavedCardUpgrade] = useState(true);

  const [manageSiteId, setManageSiteId] = useState<number | null>(null);
  const [renewSslId, setRenewSslId] = useState<number | null>(null);
  const [backupsSite, setBackupsSite] = useState<{ id: number; domain: string } | null>(null);
  const [backupsShowPass, setBackupsShowPass] = useState(false);
  const [backupsCopied, setBackupsCopied] = useState<string | null>(null);
  const [emailActivateSite, setEmailActivateSite] = useState<{ id: number; domain: string } | null>(null);
  const [emailActivateStep, setEmailActivateStep] = useState<'intro' | 'activating' | 'records' | 'verifying' | 'failed' | 'success'>('intro');
  const [emailDns, setEmailDns] = useState<any>(null);
  const [emailVerify, setEmailVerify] = useState<any>(null);
  const [emailCopied, setEmailCopied] = useState<string | null>(null);
  const [emailStatuses, setEmailStatuses] = useState<Record<number, { isCustomDomain: boolean; activated: boolean }>>({});
  const [subdomainSite, setSubdomainSite] = useState<{ id: number; domain: string } | null>(null);
  const [subdomainList, setSubdomainList] = useState<Array<{ domain: string; state: string }>>([]);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [subdomainBusy, setSubdomainBusy] = useState(false);
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [manageMode, setManageMode] = useState<'choose' | 'upload' | 'wordpress' | 'wordpress_success' | 'upsell'>('choose');
  const [wpForm, setWpForm] = useState({
    blogTitle: '',
    wpUser: 'admin',
    wpPass: '',
    wpEmail: '',
    installPath: '',
  });
  const [wpProgress, setWpProgress] = useState(0);
  const [wpSuccessCreds, setWpSuccessCreds] = useState<{user: string, pass: string} | null>(null);
  const [showWpPass, setShowWpPass] = useState(false);

  useEffect(() => {
    if (manageMode === 'wordpress' && user?.email && !wpForm.wpEmail) {
      setWpForm(prev => ({ ...prev, wpEmail: user.email }));
    }
  }, [manageMode, user?.email]);

  const [wpBusy, setWpBusy] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    mode: 'subdomain' as 'subdomain' | 'custom',
    subdomain: '',
    domain: '',
  });
  const [busy, setBusy] = useState(false);
  const [customStep, setCustomStep] = useState<'form' | 'records' | 'verifying' | 'failed'>('form');
  const [dnsCheck, setDnsCheck] = useState<any>(null);
  const [dnsGuideOpen, setDnsGuideOpen] = useState<string | null>(null);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewMethod, setRenewMethod] = useState<'card' | 'yape' | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    billingName: '',
    billingAddress: '',
    billingDepartment: 'Lima',
    billingEmail: '',
  });

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
        const u = await meRes.json();
        setUser(u);
        setProfileForm({
          billingName: u.billingName || '',
          billingAddress: u.billingAddress || '',
          billingDepartment: u.billingDepartment || 'Lima',
          billingEmail: u.billingEmail || '',
        });
      }

      // Cargar datos de hosting
      const res = await fetch(`${apiBase}/hosting/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo cargar el dashboard de hosting.');
      const dashboardData = await res.json();
      setData(dashboardData);
      // estado de emails por sitio (custom domain vs subdomain, activado vs no)
      fetchEmailStatuses(dashboardData.sites || []);

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

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${apiBase}/hosting/public/plans`);
      if (res.ok) setPlans(await res.json());
    } catch (err) {
      console.error('Error fetching plans', err);
    }
  };

  const fetchUpgradePreview = async (slug: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setUpgradeTarget(slug);
    setUpgradeBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/upgrade/preview/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setUpgradePreview(await res.json());
      setUpgradeOpen(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo obtener la vista previa de mejora.');
    } finally {
      setUpgradeBusy(false);
    }
  };

  const processUpgrade = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !upgradeTarget) return;
    setUpgradeBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/upgrade/${upgradeTarget}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ useSavedCard: useSavedCardUpgrade }),
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.message || 'Error al procesar la mejora.');

      if (resData.requiresManualPayment) {
        // Iniciar pago con Izipay (Nueva tarjeta)
        if (!window.Izipay) throw new Error('SDK de Izipay no cargado.');
        const { session, upgradeData } = resData;
        
        const tokenSession = session.token || session.tokenSession || session.token_session;
        const keyRSA = session.keyRSA || session.publicKey || session.public_key;

        const iziConfig: any = {
          merchantCode: process.env.NEXT_PUBLIC_IZIPAY_MERCHANT_CODE,
          order: {
            orderNumber: session.orderId || `UPG-${Date.now()}`,
            currency: 'PEN',
            amount: upgradeData.cost,
            processType: 'AT',
          },
          billing: {
            firstName: user?.name?.split(' ')[0] ?? 'Cliente',
            lastName: user?.name?.split(' ').slice(1).join(' ') || '-',
            email: user?.email ?? '',
            address: user?.billingAddress || '-',
            city: user?.billingDepartment || 'Lima',
            country: 'PE',
          },
          render: { typeForm: 'pop-up' },
        };

        const izi = new window.Izipay({ config: iziConfig });
        izi.LoadForm({
          authorization: tokenSession,
          keyRSA,
          callbackResponse: async (response: any) => {
            const confirmRes = await fetch(`${apiBase}/hosting/upgrade/${upgradeTarget}/confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(response),
            });
            if (!confirmRes.ok) throw new Error('No se pudo confirmar la mejora.');
            setUpgradeOpen(false);
            await load();
            setTab('overview');
          },
        });
        return;
      }

      // Si no requiere pago manual (fue tokenizado con exito)
      setUpgradeOpen(false);
      await load();
      setTab('overview');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la mejora.');
    } finally {
      setUpgradeBusy(false);
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
      await load();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setProfileBusy(false);
    }
  };

  useEffect(() => {
    load();
    fetchPlans();
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
  const subdomainsAllowed = useMemo(() => {
    const slug = (data?.plan.slug || '').toLowerCase().replace(/^hosting-/, '').split('-')[0];
    return slug === 'premium' || slug === 'agencia';
  }, [data?.plan.slug]);

  const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP || '142.171.227.112';

  const resetCreateForm = () => {
    setCreateForm({ name: '', mode: 'subdomain', subdomain: '', domain: '' });
    setCustomStep('form');
    setDnsCheck(null);
    setDnsGuideOpen(null);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    resetCreateForm();
  };

  const verifyCustomDomain = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setBusy(true);
    setError(null);
    setCustomStep('verifying');
    try {
      const res = await fetch(`${apiBase}/hosting/domain/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: createForm.domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo verificar.');
      setDnsCheck(data);
      if (data.ready) {
        // crear sitio inmediatamente
        const createRes = await fetch(`${apiBase}/hosting/sites/custom-domain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: createForm.name || createForm.domain,
            domain: createForm.domain.trim(),
          }),
        });
        const created = await createRes.json();
        if (!createRes.ok) {
          throw new Error(created?.message || 'No se pudo crear el sitio.');
        }
        await load();
        closeCreate();
        return;
      }
      setCustomStep('failed');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo verificar el dominio.');
      setCustomStep('failed');
    } finally {
      setBusy(false);
    }
  };

  const createSite = async () => {
    setError(null);
    if (!createForm.name.trim()) {
      setError('Indica un nombre para tu sitio.');
      return;
    }
    if (createForm.mode === 'subdomain') {
      const sub = createForm.subdomain.trim();
      if (!sub || sub.length < 3) {
        setError('El subdominio debe tener al menos 3 caracteres.');
        return;
      }
      const token = localStorage.getItem('access_token');
      if (!token) return;
      setBusy(true);
      try {
        const res = await fetch(`${apiBase}/hosting/sites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: createForm.name.trim(),
            mode: 'subdomain',
            subdomain: sub,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'No se pudo crear el sitio.');
        await load();
        closeCreate();
      } catch (err: any) {
        setError(err?.message ?? 'No se pudo crear el sitio.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // Custom domain: avanzamos al paso de records.
    const domain = createForm.domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      setError('Indica un dominio valido (ej. mimarca.com).');
      return;
    }
    setCreateForm((f) => ({ ...f, domain }));
    setCustomStep('records');
  };

  const copyDnsValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedDns(key);
      setTimeout(() => setCopiedDns(null), 1500);
    });
  };

  const installWordPress = async () => {
    if (!manageSiteId) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setWpBusy(true);
    setWpProgress(5);
    const progressInterval = setInterval(() => {
      setWpProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 1500);

    try {
      const res = await fetch(`${apiBase}/hosting/sites/${manageSiteId}/install-wordpress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(wpForm),
      });
      clearInterval(progressInterval);
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo instalar WordPress.');
      setWpProgress(100);
      await load();
      setTimeout(() => {
        setWpBusy(false);
        setWpSuccessCreds({ user: wpForm.wpUser, pass: wpForm.wpPass });
        setManageMode('wordpress_success');
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err?.message ?? 'No se pudo instalar WordPress.');
      setWpBusy(false);
      setWpProgress(0);
    }
  };

  const fetchEmailStatuses = async (sites: Array<{ id: number; domain: string }>) => {
    const token = localStorage.getItem('access_token');
    if (!token || !sites.length) return;
    try {
      const results = await Promise.all(
        sites.map((s) =>
          fetch(`${apiBase}/hosting/sites/${s.id}/email-status`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ),
      );
      const map: Record<number, any> = {};
      sites.forEach((s, i) => {
        if (results[i]) {
          map[s.id] = {
            isCustomDomain: results[i].isCustomDomain,
            activated: results[i].activated,
          };
        }
      });
      setEmailStatuses(map);
    } catch {
      // silent
    }
  };

  const openEmailActivate = (site: { id: number; domain: string }) => {
    setEmailActivateSite(site);
    setEmailActivateStep('intro');
    setEmailDns(null);
    setEmailVerify(null);
  };

  const runEmailActivate = async () => {
    if (!emailActivateSite) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setEmailActivateStep('activating');
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${emailActivateSite.id}/email/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo activar.');
      setEmailDns(data);
      setEmailActivateStep('records');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo activar.');
      setEmailActivateStep('intro');
    }
  };

  const runEmailVerify = async () => {
    if (!emailActivateSite) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setEmailActivateStep('verifying');
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${emailActivateSite.id}/email/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo verificar.');
      setEmailVerify(data);
      if (data.allPassed) {
        setEmailActivateStep('success');
        await fetchEmailStatuses(data?.sites ?? []);
      } else {
        setEmailActivateStep('failed');
      }
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo verificar.');
      setEmailActivateStep('failed');
    }
  };

  const openSubdomains = async (site: { id: number; domain: string }) => {
    setSubdomainSite(site);
    setSubdomainInput('');
    setSubdomainList([]);
    setSubdomainLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${site.id}/subdomains`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubdomainList(data.subdomains || []);
      }
    } catch {
      // silent
    } finally {
      setSubdomainLoading(false);
    }
  };

  const createSubdomainAction = async () => {
    if (!subdomainSite || !subdomainInput.trim()) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setSubdomainBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${subdomainSite.id}/subdomains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subdomain: subdomainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo crear el subdominio.');
      setSubdomainInput('');
      await openSubdomains(subdomainSite);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear el subdominio.');
    } finally {
      setSubdomainBusy(false);
    }
  };

  const deleteSubdomainAction = async (fullDomain: string) => {
    if (!subdomainSite) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    if (!confirm(`Eliminar ${fullDomain}? Esta accion no se puede deshacer.`)) return;
    setSubdomainBusy(true);
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${subdomainSite.id}/subdomains`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: fullDomain }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo eliminar.');
      await openSubdomains(subdomainSite);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo eliminar el subdominio.');
    } finally {
      setSubdomainBusy(false);
    }
  };

  const renewSSL = async (siteId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setRenewSslId(siteId);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/hosting/sites/${siteId}/renew-ssl`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo emitir el SSL.');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo emitir el SSL.');
    } finally {
      setRenewSslId(null);
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
                    {data && data.usage.websites.used >= data.usage.websites.max ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>Has llegado al limite de tu plan</DialogTitle>
                          <DialogDescription>
                            Tu plan <strong>{data.plan.name}</strong> incluye {data.usage.websites.max} sitio{data.usage.websites.max === 1 ? '' : 's'}, y ya los estas usando todos.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="rounded-2xl border border-cta/30 bg-cta/5 p-5">
                            <p className="text-xs font-bold uppercase tracking-widest text-cta-foreground/70">
                              Sigue creciendo
                            </p>
                            <p className="mt-2 text-base font-bold text-foreground leading-snug">
                              Mejora tu plan y crea mas sitios sin perder nada de lo que ya tienes.
                            </p>
                            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                              <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                Pago prorrateado: solo la diferencia hasta tu renovacion.
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                Tus sitios actuales no se ven afectados.
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                Aumento de almacenamiento, correos y sitios.
                              </li>
                            </ul>
                          </div>
                          <Button
                            variant="cta"
                            className="w-full rounded-xl py-6 text-base font-bold"
                            onClick={() => {
                              setCreateOpen(false);
                              setTab('plan');
                            }}
                          >
                            Ver planes y mejorar
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-xs text-muted-foreground"
                            onClick={() => setCreateOpen(false)}
                          >
                            Quizas despues
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {customStep === 'form' && (
                          <>
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
                              <Button variant="outline" onClick={closeCreate}>
                                Cancelar
                              </Button>
                              <Button variant="cta" onClick={createSite} disabled={busy}>
                                {busy
                                  ? 'Creando...'
                                  : createForm.mode === 'custom'
                                    ? 'Siguiente'
                                    : 'Crear sitio'}
                              </Button>
                            </DialogFooter>
                          </>
                        )}

                        {customStep === 'records' && (
                          <>
                            <DialogHeader>
                              <DialogTitle>Apunta {createForm.domain} a PLIA</DialogTitle>
                              <DialogDescription>
                                Ve a la zona DNS de tu proveedor y agrega estos 2 registros.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
                                <div className="grid grid-cols-[60px_80px_1fr_60px] text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted/40 px-3 py-2 border-b border-border">
                                  <div>Tipo</div>
                                  <div>Nombre</div>
                                  <div>Valor</div>
                                  <div className="text-right">Accion</div>
                                </div>
                                {[
                                  { type: 'A', name: '@', value: SERVER_IP, key: 'apex' },
                                  { type: 'A', name: 'www', value: SERVER_IP, key: 'www' },
                                ].map((rec) => (
                                  <div key={rec.key} className="grid grid-cols-[60px_80px_1fr_60px] items-center px-3 py-3 border-b border-border last:border-b-0 text-sm">
                                    <div className="font-mono font-bold text-foreground">{rec.type}</div>
                                    <div className="font-mono text-foreground">{rec.name}</div>
                                    <div className="font-mono text-foreground text-xs truncate">{rec.value}</div>
                                    <div className="text-right">
                                      <button
                                        type="button"
                                        className="text-xs text-cta-foreground hover:underline"
                                        onClick={() => copyDnsValue(rec.value, rec.key)}
                                      >
                                        {copiedDns === rec.key ? (
                                          <Check className="h-3.5 w-3.5 inline" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5 inline" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                                {[
                                  { id: 'yachay', label: '¿Compraste tu dominio en Yachay?', steps: ['Ingresa a clientes.yachay.cloud y entra a tu dominio.', 'Ve a la pestana "DNS" o "Zona DNS".', 'Crea los 2 registros A de arriba apuntando a la IP.'] },
                                  { id: 'godaddy', label: '¿En GoDaddy?', steps: ['Entra a tu cuenta y abre "Mis productos".', 'En tu dominio, haz clic en "DNS".', 'Anade los 2 registros A.'] },
                                  { id: 'namecheap', label: '¿En Namecheap?', steps: ['Entra a "Domain List" y haz clic en "Manage".', 'Ve a "Advanced DNS" y agrega los 2 registros A.'] },
                                  { id: 'cloudflare', label: '¿En Cloudflare?', steps: ['En el panel de tu dominio ve a "DNS > Records".', 'Agrega los 2 registros A.', 'IMPORTANTE: desactiva el proxy (nube naranja → gris) para que SSL se emita correctamente.'] },
                                  { id: 'otro', label: '¿En otro proveedor?', steps: ['Busca "Zona DNS" o "DNS Management" en tu panel.', 'Crea registros tipo A para @ y www con la IP de PLIA.'] },
                                ].map((guide) => (
                                  <div key={guide.id}>
                                    <button
                                      type="button"
                                      className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 flex items-center justify-between"
                                      onClick={() => setDnsGuideOpen(dnsGuideOpen === guide.id ? null : guide.id)}
                                    >
                                      {guide.label}
                                      <ChevronRight className={cn('h-4 w-4 transition-transform', dnsGuideOpen === guide.id && 'rotate-90')} />
                                    </button>
                                    {dnsGuideOpen === guide.id && (
                                      <div className="px-4 pb-3 text-[12px] text-muted-foreground">
                                        <ol className="space-y-1 list-decimal list-inside">
                                          {guide.steps.map((s, i) => <li key={i}>{s}</li>)}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <p className="text-[11px] text-muted-foreground text-center">
                                Los cambios DNS pueden tardar entre 5 minutos y 24 horas en propagarse.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCustomStep('form')}>
                                Atras
                              </Button>
                              <Button variant="cta" onClick={verifyCustomDomain} disabled={busy}>
                                Ya lo configure, verificar
                              </Button>
                            </DialogFooter>
                          </>
                        )}

                        {customStep === 'verifying' && (
                          <>
                            <DialogHeader>
                              <DialogTitle>Verificando {createForm.domain}...</DialogTitle>
                              <DialogDescription>
                                Estamos comprobando que tu DNS apunte a nuestro servidor.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-10 flex items-center justify-center">
                              <div className="h-12 w-12 rounded-full border-4 border-cta border-t-transparent animate-spin" />
                            </div>
                          </>
                        )}

                        {customStep === 'failed' && (
                          <>
                            <DialogHeader>
                              <DialogTitle>Aun no propaga</DialogTitle>
                              <DialogDescription>
                                Tu dominio todavia no apunta a nuestro servidor.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                              {dnsCheck && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold">IP esperada</span>
                                    <span className="font-mono">{dnsCheck.expectedIp}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>@ ({createForm.domain})</span>
                                    <span className="font-mono">
                                      {dnsCheck.apex.records.length ? dnsCheck.apex.records.join(', ') : 'sin registro'}
                                      {' '}{dnsCheck.apex.ok ? '✅' : '❌'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>www.{createForm.domain}</span>
                                    <span className="font-mono">
                                      {dnsCheck.www.records.length ? dnsCheck.www.records.join(', ') : 'sin registro'}
                                      {' '}{dnsCheck.www.ok ? '✅' : '⚠️'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Los cambios DNS pueden tardar de 5 minutos a 24 horas. Espera un poco y reintenta.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCustomStep('records')}>
                                Volver a los registros
                              </Button>
                              <Button variant="cta" onClick={verifyCustomDomain} disabled={busy}>
                                Reintentar
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </>
                    )}
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

          <Dialog
            open={!!emailActivateSite}
            onOpenChange={(open) => {
              if (!open) {
                setEmailActivateSite(null);
                setEmailActivateStep('intro');
                setEmailDns(null);
                setEmailVerify(null);
              }
            }}
          >
            <DialogContent className="rounded-[28px] max-w-2xl">
              {emailActivateStep === 'intro' && emailActivateSite && (
                <>
                  <DialogHeader>
                    <DialogTitle>Activar correos en {emailActivateSite.domain}</DialogTitle>
                    <DialogDescription>
                      En tres pasos podras enviar y recibir correos como contacto@{emailActivateSite.domain}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>Configuramos el servidor para tu dominio (lo hacemos nosotros).</li>
                        <li>Te damos los registros DNS que debes copiar en tu proveedor.</li>
                        <li>Verificamos que todo este correcto y listo.</li>
                      </ol>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailActivateSite(null)}>
                      Cancelar
                    </Button>
                    <Button variant="cta" onClick={runEmailActivate}>
                      Empezar
                    </Button>
                  </DialogFooter>
                </>
              )}

              {emailActivateStep === 'activating' && (
                <>
                  <DialogHeader>
                    <DialogTitle>Configurando servidor...</DialogTitle>
                    <DialogDescription>
                      Generando claves DKIM para tu dominio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-10 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-cta border-t-transparent animate-spin" />
                  </div>
                </>
              )}

              {emailActivateStep === 'records' && emailDns && emailActivateSite && (
                <>
                  <DialogHeader>
                    <DialogTitle>Agrega estos registros en tu DNS</DialogTitle>
                    <DialogDescription>
                      En el panel DNS de tu proveedor, copia y pega cada valor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-2xl border border-border overflow-hidden">
                      <div className="grid grid-cols-[55px_140px_1fr_50px] text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted/40 px-3 py-2 border-b border-border">
                        <div>Tipo</div>
                        <div>Nombre</div>
                        <div>Valor</div>
                        <div></div>
                      </div>
                      {emailDns.records.map((r: any, i: number) => (
                        <div key={i} className="grid grid-cols-[55px_140px_1fr_50px] items-center px-3 py-3 border-b border-border last:border-b-0 text-sm">
                          <div className="font-mono font-bold text-foreground">{r.type}</div>
                          <div className="font-mono text-foreground text-xs">{r.name}</div>
                          <div className="font-mono text-foreground text-[11px] break-all">
                            {r.priority ? `${r.value} (prio ${r.priority})` : r.value}
                          </div>
                          <div className="text-right">
                            <button
                              type="button"
                              className="text-xs text-cta-foreground hover:underline"
                              onClick={() => {
                                navigator.clipboard.writeText(r.value);
                                setEmailCopied(`r-${i}`);
                                setTimeout(() => setEmailCopied(null), 1500);
                              }}
                            >
                              {emailCopied === `r-${i}` ? <Check className="h-3.5 w-3.5 inline" /> : <Copy className="h-3.5 w-3.5 inline" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Los cambios DNS pueden tardar entre 5 minutos y 24 horas en propagarse.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailActivateStep('intro')}>
                      Atras
                    </Button>
                    <Button variant="cta" onClick={runEmailVerify}>
                      Ya lo configure, verificar
                    </Button>
                  </DialogFooter>
                </>
              )}

              {emailActivateStep === 'verifying' && (
                <>
                  <DialogHeader>
                    <DialogTitle>Verificando registros DNS...</DialogTitle>
                  </DialogHeader>
                  <div className="py-10 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-cta border-t-transparent animate-spin" />
                  </div>
                </>
              )}

              {emailActivateStep === 'failed' && emailVerify && (
                <>
                  <DialogHeader>
                    <DialogTitle>Aun faltan registros</DialogTitle>
                    <DialogDescription>
                      Algunos registros no se ven todavia. Reintenta en unos minutos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm space-y-1.5">
                    {[
                      { k: 'mx', label: 'MX (servidor de correo)' },
                      { k: 'mailA', label: 'A mail (apunta a nuestra IP)' },
                      { k: 'spf', label: 'SPF (autoriza envios)' },
                      { k: 'dkim', label: 'DKIM (firma digital)' },
                      { k: 'dmarc', label: 'DMARC (politica)' },
                    ].map((c) => (
                      <div key={c.k} className="flex items-center justify-between">
                        <span>{c.label}</span>
                        <span>{emailVerify.checks[c.k] ? '✅' : '❌'}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailActivateStep('records')}>
                      Volver a los registros
                    </Button>
                    <Button variant="cta" onClick={runEmailVerify}>
                      Reintentar
                    </Button>
                  </DialogFooter>
                </>
              )}

              {emailActivateStep === 'success' && emailActivateSite && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-emerald-700" />
                      </span>
                      Correos activos
                    </DialogTitle>
                    <DialogDescription>
                      Tu dominio {emailActivateSite.domain} ya esta listo para enviar y recibir correos.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="cta"
                      className="w-full rounded-xl"
                      onClick={() => {
                        setEmailActivateSite(null);
                        setEmailActivateStep('intro');
                        window.location.href = '/dashboard/hosting/emails';
                      }}
                    >
                      Crear mi primer correo
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!subdomainSite} onOpenChange={(open) => !open && setSubdomainSite(null)}>
            <DialogContent className="rounded-[28px] max-w-lg">
              <DialogHeader>
                <DialogTitle>Subdominios de {subdomainSite?.domain}</DialogTitle>
                <DialogDescription>
                  Crea subdominios como <code className="text-xs bg-muted px-1.5 py-0.5 rounded">blog.{subdomainSite?.domain}</code> con SSL automatico.
                </DialogDescription>
              </DialogHeader>
              {subdomainSite && (
                <div className="space-y-4 py-2">
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 flex items-center rounded-xl border border-input bg-background overflow-hidden">
                      <input
                        value={subdomainInput}
                        onChange={(e) =>
                          setSubdomainInput(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          )
                        }
                        className="h-11 flex-1 px-3 bg-transparent outline-none text-sm"
                        placeholder="blog"
                      />
                      <span className="h-11 flex items-center px-3 text-sm text-muted-foreground bg-muted/30 border-l border-input">
                        .{subdomainSite.domain}
                      </span>
                    </div>
                    <Button
                      variant="cta"
                      className="h-11 rounded-xl"
                      onClick={createSubdomainAction}
                      disabled={subdomainBusy || !subdomainInput.trim()}
                    >
                      {subdomainBusy ? 'Creando...' : 'Crear'}
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden">
                    {subdomainLoading ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        Cargando...
                      </div>
                    ) : subdomainList.length === 0 ? (
                      <div className="p-8 text-center">
                        <Globe className="h-8 w-8 mx-auto text-muted-foreground/40" />
                        <p className="mt-3 text-sm text-muted-foreground">
                          Aun no has creado subdominios.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {subdomainList.map((s) => (
                          <div key={s.domain} className="px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{s.domain}</p>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                {s.state}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
                                <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" /> Abrir
                                </a>
                              </Button>
                              <button
                                type="button"
                                className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center"
                                onClick={() => deleteSubdomainAction(s.domain)}
                                disabled={subdomainBusy}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Para que los subdominios funcionen, tu dominio debe tener un registro DNS comodin
                    (<code className="text-[10px] bg-muted px-1 py-0.5 rounded">* A {process.env.NEXT_PUBLIC_SERVER_IP || '142.171.227.112'}</code>) o un registro A por cada subdominio.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!backupsSite} onOpenChange={(open) => !open && setBackupsSite(null)}>
            <DialogContent className="rounded-[28px] max-w-lg">
              <DialogHeader>
                <DialogTitle>Backups de {backupsSite?.domain}</DialogTitle>
                <DialogDescription>
                  Tu plan permite crear copias de seguridad manualmente desde el panel tecnico.
                </DialogDescription>
              </DialogHeader>
              {backupsSite && data && (
                <div className="space-y-4 py-2">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      Paso 1 · Tus credenciales del panel
                    </p>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Usuario</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground">
                          {data.account.technicalAccess.username || 'admin'}
                        </p>
                        <button
                          type="button"
                          className="text-xs text-cta-foreground hover:underline flex items-center gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              data.account.technicalAccess.username || 'admin',
                            );
                            setBackupsCopied('user');
                            setTimeout(() => setBackupsCopied(null), 1500);
                          }}
                        >
                          {backupsCopied === 'user' ? (
                            <><Check className="h-3 w-3" /> Copiado</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copiar</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Contrasena</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground">
                          {backupsShowPass
                            ? data.account.technicalAccess.password || '••••••••'
                            : '••••••••••••'}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            onClick={() => setBackupsShowPass((v) => !v)}
                          >
                            {backupsShowPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {backupsShowPass ? 'Ocultar' : 'Mostrar'}
                          </button>
                          <button
                            type="button"
                            className="text-xs text-cta-foreground hover:underline flex items-center gap-1"
                            onClick={() => {
                              if (data.account.technicalAccess.password) {
                                navigator.clipboard.writeText(data.account.technicalAccess.password);
                                setBackupsCopied('pass');
                                setTimeout(() => setBackupsCopied(null), 1500);
                              }
                            }}
                          >
                            {backupsCopied === 'pass' ? (
                              <><Check className="h-3 w-3" /> Copiado</>
                            ) : (
                              <><Copy className="h-3 w-3" /> Copiar</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="cta"
                      className="w-full rounded-xl"
                      onClick={() => {
                        window.open(
                          data.account.technicalAccess.panelUrl || 'https://142.171.227.112:8090/',
                          '_blank',
                          'noopener,noreferrer',
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Abrir CyberPanel
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      Paso 2 · Crea tu backup
                    </p>
                    <ol className="mt-3 space-y-2 text-sm text-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold text-cta-foreground">1.</span>
                        Una vez dentro, en el menu lateral ve a <strong>Backup → Create Backup</strong>.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-cta-foreground">2.</span>
                        Selecciona <strong>{backupsSite.domain}</strong> y haz clic en <strong>Create Backup</strong>.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-cta-foreground">3.</span>
                        Cuando termine, podras descargar el archivo <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.tar.gz</code> con todo tu sitio.
                      </li>
                    </ol>
                  </div>

                  {!(data.plan.slug || '').toLowerCase().includes('agencia') && (
                    <div className="rounded-2xl bg-cta/5 border border-cta/20 p-4">
                      <p className="text-xs font-bold text-foreground">
                        ¿Quieres backups automaticos sin tocar nada?
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        El plan <strong>Agencia</strong> los crea cada mes automaticamente y te permite restaurar tu sitio con un solo clic.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-lg text-xs"
                        onClick={() => {
                          setBackupsSite(null);
                          setTab('plan');
                        }}
                      >
                        Ver plan Agencia
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
                      {stats.slice(0, 3).map((stat) => {
                        const isEmails = stat.key === 'emails';
                        const cardInner = (
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border text-foreground group-hover:bg-cta group-hover:text-cta-foreground group-hover:border-cta transition-colors">
                                <stat.icon className="h-5 w-5" />
                              </div>
                              {isEmails && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cta-foreground/70 group-hover:text-foreground transition-colors flex items-center gap-1">
                                  Gestionar <ChevronRight className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                            <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                            <Progress value={stat.progress} className="mt-5 h-1.5" />
                            <p className="mt-3 text-[11px] text-muted-foreground">{stat.detail}</p>
                          </>
                        );
                        if (isEmails) {
                          return (
                            <Link
                              key={stat.key}
                              href="/dashboard/hosting/emails"
                              className="rounded-2xl border border-border bg-muted/30 p-5 group hover:border-cta hover:bg-cta/5 transition-colors cursor-pointer block"
                            >
                              {cardInner}
                            </Link>
                          );
                        }
                        return (
                          <div key={stat.key} className="rounded-2xl border border-border bg-muted/30 p-5 group hover:border-cta/50 transition-colors">
                            {cardInner}
                          </div>
                        );
                      })}
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
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    title="Backups"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                                    onClick={() => {
                                      const isAgencia = (data?.plan.slug || '')
                                        .toLowerCase()
                                        .replace(/^hosting-/, '')
                                        .split('-')[0] === 'agencia';
                                      if (isAgencia) {
                                        window.location.href = '/dashboard/hosting/backups';
                                      } else {
                                        setBackupsSite({ id: site.id, domain: site.domain });
                                      }
                                    }}
                                  >
                                    <HardDriveDownload className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Subir archivos"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                                    onClick={() => setManageSiteId(site.id)}
                                  >
                                    <Upload className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-6 flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <span>{formatStorage(site.storageUsedMb)} usado</span>
                                  <span>·</span>
                                  <span>{site.uploadCount} deploys</span>
                                </div>
                                <span className="text-muted-foreground">Creado {site.createdAgo}</span>
                              </div>
                              {!sslActive && (
                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 flex items-center justify-between">
                                  <p className="text-[11px] text-amber-800 leading-tight">
                                    Tu sitio aun no tiene candado seguro (HTTPS).
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 rounded-lg text-[11px] border-amber-300 hover:bg-amber-100"
                                    disabled={renewSslId === site.id}
                                    onClick={() => renewSSL(site.id)}
                                  >
                                    {renewSslId === site.id ? 'Emitiendo...' : 'Renovar SSL'}
                                  </Button>
                                </div>
                              )}
                              {sslActive &&
                                emailStatuses[site.id]?.isCustomDomain &&
                                !emailStatuses[site.id]?.activated && (
                                  <div className="mt-3 rounded-xl border border-cta/30 bg-cta/5 px-3 py-2 flex items-center justify-between">
                                    <p className="text-[11px] text-foreground leading-tight">
                                      <Mail className="inline h-3 w-3 mr-1" />
                                      ¿Quieres correos @{site.domain}?
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 rounded-lg text-[11px] border-cta/40 hover:bg-cta/10"
                                      onClick={() => openEmailActivate({ id: site.id, domain: site.domain })}
                                    >
                                      Activar
                                    </Button>
                                  </div>
                                )}
                            </div>
                            <div className="bg-muted/30 px-5 py-3 border-t border-border flex items-center justify-between">
                              <Button variant="link" className="h-auto p-0 text-cta text-xs font-bold" asChild>
                                <Link href={site.publicUrl} target="_blank">
                                  Ver sitio <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                              <div className="flex items-center gap-3">
                                {subdomainsAllowed && (
                                  <Button
                                    variant="ghost"
                                    className="h-auto p-0 text-muted-foreground text-xs font-medium"
                                    onClick={() => openSubdomains({ id: site.id, domain: site.domain })}
                                  >
                                    Subdominios
                                  </Button>
                                )}
                                <Button variant="ghost" className="h-auto p-0 text-muted-foreground text-xs font-medium" onClick={() => setManageSiteId(site.id)}>
                                  Administrar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="plan" className="mt-0 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Plan Actual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-cta/10 p-5 border border-cta/20">
                        <p className="text-lg font-bold text-foreground">{data.plan.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Suscripcion {data.plan.billingCycleMonths === 12 ? 'Anual' : `${data.plan.billingCycleMonths} meses`}</p>
                        <div className="mt-4 pt-4 border-t border-cta/20 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-cta-foreground/70 tracking-wider">Renovacion</span>
                          <span className="text-sm font-bold">{formatDate(data.plan.renewsAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Capacidad de Sitios</span>
                          <span className="font-bold">{data.usage.websites.max} sitios</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Almacenamiento</span>
                          <span className="font-bold">{formatStorage(data.usage.storage.maxMb)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">¿Necesitas mas potencia?</CardTitle>
                      <CardDescription>Mejora tu plan hoy y solo paga la diferencia prorrateada.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-xs text-muted-foreground">
                        Al upgradear, tus limites se actualizan al instante y tu fecha de renovacion se mantiene igual.
                      </p>
                      <div className="grid gap-3">
                        {(() => {
                          const hierarchy = ['profesional', 'premium', 'agencia'];
                          
                          // Normalizar slug actual: quitar 'hosting-' y cualquier sufijo (-anual, -mensual, etc)
                          const rawCurrentSlug = (data.plan.slug || '').toLowerCase();
                          const currentSlug = rawCurrentSlug.replace(/^hosting-/, '').split('-')[0];
                          const currentIndex = hierarchy.indexOf(currentSlug);
                          
                          // Normalizar nombre actual para comparacion robusta
                          const currentNameClean = data.plan.name.toLowerCase().replace(/^hosting\s+/i, '').trim();
                          
                          return plans.map((p) => {
                            const pSlugRaw = p.slug.toLowerCase();
                            const pSlugBase = pSlugRaw.replace(/^hosting-/, '').split('-')[0];
                            const pIndex = hierarchy.indexOf(pSlugBase);
                            
                            const pNameClean = p.name.toLowerCase().replace(/^hosting\s+/i, '').trim();
                            
                            // Un plan es el actual si los slugs base coinciden O si los nombres normalizados coinciden
                            const isCurrent = pSlugBase === currentSlug || pNameClean === currentNameClean;
                            
                            // Si es un plan inferior (segun el indice en la jerarquia), lo ocultamos
                            // Si no encontramos el indice actual, comparamos por capacidad de sitios como fallback
                            const isLower = currentIndex !== -1 && pIndex !== -1 
                              ? pIndex < currentIndex 
                              : p.maxSites < data.usage.websites.max;

                            if (isLower && !isCurrent) return null;

                            return (
                              <div key={p.slug} className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition",
                                isCurrent ? "border-cta/30 bg-cta/5 opacity-80" : "border-border bg-muted/20 hover:bg-muted/30"
                              )}>
                                <div>
                                  <p className="font-bold text-sm">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">{p.maxSites} sitios · {formatStorage(p.storageMb)}</p>
                                </div>
                                {isCurrent ? (
                                  <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-wider">Plan Actual</Badge>
                                ) : (
                                  <Button 
                                    variant="cta" 
                                    size="sm" 
                                    className="h-8 rounded-lg text-xs" 
                                    onClick={() => fetchUpgradePreview(p.slug)} 
                                    disabled={upgradeBusy}
                                  >
                                    Upgrade
                                  </Button>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
                  <DialogContent className="rounded-[30px] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Mejorar Plan de Hosting</DialogTitle>
                      <DialogDescription>
                        Estas por cambiar tu plan a <strong>{upgradePreview?.targetPlan}</strong>.
                      </DialogDescription>
                    </DialogHeader>
                    {upgradePreview && (
                      <div className="space-y-6 py-4">
                        <div className="rounded-2xl bg-muted/50 p-5 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Dias restantes de suscripcion</span>
                            <span className="font-bold text-foreground">{upgradePreview.remainingDays} dias</span>
                          </div>
                          <div className="flex items-center justify-between text-sm border-t border-muted-foreground/10 pt-3">
                            <span className="text-muted-foreground">Diferencia a pagar</span>
                            <span className="text-xl font-black text-foreground">S/ {upgradePreview.upgradeCost}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metodo de pago</p>
                          <div className="grid gap-2">
                            {upgradePreview.hasSavedCard && (
                              <button
                                type="button"
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-xl border transition text-left",
                                  useSavedCardUpgrade ? "border-cta bg-cta/10 shadow-sm shadow-cta/5" : "border-border bg-white"
                                )}
                                onClick={() => setUseSavedCardUpgrade(true)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", useSavedCardUpgrade ? "border-cta bg-cta text-white" : "border-border")}>
                                    {useSavedCardUpgrade && <Check className="h-2 w-2" />}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold">Usar tarjeta guardada</p>
                                    <p className="text-[10px] text-muted-foreground">Cobro automatico seguro</p>
                                  </div>
                                </div>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                            <button
                              type="button"
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition text-left",
                                !useSavedCardUpgrade ? "border-cta bg-cta/10 shadow-sm shadow-cta/5" : "border-border bg-white"
                              )}
                              onClick={() => setUseSavedCardUpgrade(false)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", !useSavedCardUpgrade ? "border-cta bg-cta text-white" : "border-border")}>
                                  {!useSavedCardUpgrade && <Check className="h-2 w-2" />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold">Pagar con otra tarjeta</p>
                                  <p className="text-[10px] text-muted-foreground">Se abrira el portal de Izipay</p>
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 flex gap-3">
                          <Rocket className="h-4 w-4 shrink-0" />
                          <p>Tu capacidad de sitios y almacenamiento aumentara inmediatamente despues del pago.</p>
                        </div>

                        <Button variant="cta" className="w-full py-6 rounded-2xl font-bold text-base shadow-lg shadow-cta/20" onClick={processUpgrade} disabled={upgradeBusy}>
                          {upgradeBusy ? 'Procesando mejora...' : `Pagar S/ ${upgradePreview.upgradeCost} y Mejorar`}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
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
                <div className="grid gap-6 md:grid-cols-[1fr_0.7fr]">
                  <Card className="rounded-2xl border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Datos de Facturación</CardTitle>
                      <CardDescription>Esta información se usará automáticamente en tus próximos pagos.</CardDescription>
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
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <CardTitle className="text-xl font-bold">Acceso técnico</CardTitle>
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
                      </CardContent>
                    </Card>
                  </div>
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

      <Dialog
        open={Boolean(currentSite)}
        onOpenChange={(open) => {
          if (!open) {
            setManageSiteId(null);
            setManageMode('choose');
          }
        }}
      >
        <DialogContent className="max-w-4xl rounded-[30px] overflow-hidden p-0">
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-4">
                {manageMode !== 'choose' && (
                  <Button variant="ghost" size="icon" onClick={() => setManageMode('choose')} className="rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <DialogTitle className="text-xl">
                    {manageMode === 'choose'
                      ? currentSite?.appType === 'WORDPRESS' ? 'Administrar WordPress' : 'Elige como crear tu web'
                      : manageMode === 'upload'
                        ? 'Subir archivos HTML'
                        : manageMode === 'wordpress'
                          ? 'Instalar WordPress'
                          : manageMode === 'wordpress_success'
                            ? '¡Instalacion Exitosa!'
                            : 'Desarrollo Profesional'}
                  </DialogTitle>
                  <DialogDescription>{currentSite?.domain}</DialogDescription>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {manageMode === 'choose' && currentSite?.appType !== 'WORDPRESS' && (
                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    onClick={() => setManageMode('upload')}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border bg-white hover:border-cta hover:bg-cta/5 transition group"
                  >
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-cta group-hover:text-cta-foreground transition">
                      <FileCode className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-sm mb-2">Tengo mi web lista</h4>
                    <p className="text-xs text-muted-foreground">Sube tus archivos HTML y CSS en un clic.</p>
                    <Badge variant="outline" className="mt-4 text-[10px] uppercase font-bold tracking-wider">
                      Estatico
                    </Badge>
                  </button>

                  <button
                    onClick={() => setManageMode('wordpress')}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border bg-white hover:border-cta hover:bg-cta/5 transition group"
                  >
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-cta group-hover:text-cta-foreground transition">
                      <LayoutDashboard className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-sm mb-2">Usar WordPress</h4>
                    <p className="text-xs text-muted-foreground">Instala WordPress automaticamente en segundos.</p>
                    <Badge
                      variant="outline"
                      className="mt-4 text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Recomendado
                    </Badge>
                  </button>

                  <button
                    onClick={() => setManageMode('upsell')}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border bg-white hover:border-cta hover:bg-cta/5 transition group"
                  >
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-cta group-hover:text-cta-foreground transition">
                      <Monitor className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-sm mb-2">PLIA lo hace por mi</h4>
                    <p className="text-xs text-muted-foreground">Deja que nuestros expertos diseñen tu web profesional.</p>
                    <Badge variant="cta" className="mt-4 text-[10px] uppercase font-bold tracking-wider">
                      Alta Conversion
                    </Badge>
                  </button>
                </div>
              )}

              {manageMode === 'choose' && currentSite?.appType === 'WORDPRESS' && (
                <div className="max-w-md mx-auto space-y-6 py-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-[#0073AA]/10 mx-auto flex items-center justify-center">
                    <img src="https://s.w.org/style/images/about/WordPress-logotype-standard.png" className="w-12 h-12 object-contain opacity-80" alt="WordPress" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">WordPress Activo</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tu sitio {currentSite.domain} esta ejecutando WordPress de forma nativa.
                    </p>
                  </div>
                  
                  <div className="grid gap-3 pt-2">
                    <Button variant="cta" className="w-full py-6 rounded-xl font-bold text-base shadow-lg shadow-cta/20" asChild>
                      <Link href={`https://${currentSite.domain}/wp-admin`} target="_blank">
                        <LayoutDashboard className="mr-2 h-5 w-5" /> Ir a mi panel de WordPress
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full py-6 rounded-xl bg-white" asChild>
                      <Link href={`https://${currentSite.domain}`} target="_blank">
                        <Globe className="mr-2 h-5 w-5" /> Ver mi sitio en vivo <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-8 border-t border-border pt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">¿Prefieres algo mas facil?</p>
                    <Button variant="outline" className="w-full h-auto py-4 rounded-xl flex items-center gap-4 text-left group" onClick={() => setManageMode('upsell')}>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-cta/10 group-hover:text-cta transition-colors">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">PLIA lo hace por mi</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Si WordPres es muy dificil, contrata el diseño web profesional y optimizado.</p>
                      </div>
                    </Button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl mt-4 text-left">
                    <p><strong>Nota:</strong> Si recien instalaste WordPress y no cargó inmediatamente, por favor espera unos minutos. Los servidores pueden tardar un poco en propagar los cambios.</p>
                  </div>
                </div>
              )}

              {manageMode === 'upload' && (
                <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-4 text-sm">
                    <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-10 flex flex-col items-center text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-bold text-foreground">Sube la carpeta de tu sitio</p>
                      <p className="mt-2 text-xs text-muted-foreground max-w-[200px]">
                        Tu carpeta debe contener un archivo <strong>index.html</strong> en la raiz.
                      </p>
                      <input
                        ref={uploadInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadFolder(e.target.files)}
                      />
                      <Button
                        variant="cta"
                        className="mt-8 px-8 rounded-xl"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={busy}
                      >
                        {busy ? 'Publicando...' : 'Seleccionar Carpeta'}
                      </Button>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                      <strong>Nota:</strong> Al subir una nueva carpeta, se reemplazara todo el contenido actual del sitio.
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Card className="rounded-2xl border-muted/50">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">App Type</span>
                          <Badge variant="outline">{currentSite?.appType}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Ultimo Deploy</span>
                          <span className="text-xs font-medium">{formatDate(currentSite?.lastDeployedAt || null)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Archivos</span>
                          <span className="text-xs font-medium">{currentSite?.uploadCount} cargas</span>
                        </div>
                        <Button variant="outline" className="w-full h-9 text-xs rounded-xl" asChild>
                          <Link href={currentSite?.publicUrl || '#'} target="_blank">
                            Abrir sitio
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {manageMode === 'wordpress' && (
                <div className="max-w-xl mx-auto space-y-6 py-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Titulo del Sitio</label>
                      <Input
                        placeholder="Mi Increible Blog"
                        value={wpForm.blogTitle}
                        onChange={(e) => setWpForm((prev) => ({ ...prev, blogTitle: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Usuario Admin</label>
                        <Input
                          placeholder="admin"
                          value={wpForm.wpUser}
                          onChange={(e) => setWpForm((prev) => ({ ...prev, wpUser: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Contraseña</label>
                        <Input
                          type="password"
                          placeholder="Min. 8 caracteres"
                          value={wpForm.wpPass}
                          onChange={(e) => setWpForm((prev) => ({ ...prev, wpPass: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Email del Administrador</label>
                      <Input
                        type="email"
                        placeholder="admin@tu-correo.com"
                        value={wpForm.wpEmail}
                        onChange={(e) => setWpForm((prev) => ({ ...prev, wpEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Ruta de Instalacion (opcional)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{currentSite?.domain}/</span>
                        <Input
                          placeholder="blog (opcional)"
                          value={wpForm.installPath}
                          onChange={(e) => setWpForm((prev) => ({ ...prev, installPath: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Dejalo vacio para instalar en la raiz.</p>
                    </div>
                  </div>

                  {wpBusy ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cta/10">
                        <Clock className="h-10 w-10 text-cta animate-spin-slow" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Instalando WordPress...</h4>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                          Estamos configurando la base de datos y desplegando los archivos en tu servidor.
                        </p>
                      </div>
                      <div className="max-w-xs mx-auto space-y-2">
                        <Progress value={wpProgress} className="h-3" />
                        <p className="text-xs font-bold text-muted-foreground text-right">{wpProgress}%</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-cta/5 rounded-xl border border-cta/20 text-xs text-cta-foreground">
                        <div className="flex gap-3">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-bold">Instalaremos la ultima version de WordPress.</p>
                            <p className="mt-1 opacity-80">Este proceso puede tardar un poco mientras configuramos tu base de datos y archivos.</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="cta" className="w-full py-6 rounded-2xl font-bold text-base shadow-lg shadow-cta/20" onClick={installWordPress} disabled={wpBusy}>
                        Comenzar Instalacion
                      </Button>
                    </>
                  )}
                </div>
              )}

              {manageMode === 'wordpress_success' && (
                <div className="max-w-md mx-auto space-y-6 py-6 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-2">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">¡Tu WordPress ya esta instalado!</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ya puedes ingresar a tu nuevo panel de administracion. Por favor, guarda tus credenciales en un lugar seguro.
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 border border-border rounded-2xl p-5 text-left space-y-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b border-border/50 pb-2">Tus Credenciales</p>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Usuario:</span>
                      <span className="text-sm font-bold bg-white px-2 py-1 rounded border inline-block w-full">{wpSuccessCreds?.user}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Contraseña:</span>
                      <div className="relative">
                        <input
                          type={showWpPass ? 'text' : 'password'}
                          readOnly
                          value={wpSuccessCreds?.pass}
                          className="text-sm font-bold bg-white px-2 py-1 rounded border w-full pr-10 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWpPass(!showWpPass)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showWpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button variant="cta" className="w-full py-6 rounded-2xl font-bold text-base shadow-lg shadow-cta/20 mt-4" asChild>
                    <Link href={`https://${currentSite?.domain}/wp-admin`} target="_blank">
                      <LayoutDashboard className="mr-2 h-5 w-5" /> Ir a tu nuevo sitio (wp-admin)
                    </Link>
                  </Button>
                </div>
              )}

              {manageMode === 'upsell' && (
                <div className="max-w-2xl mx-auto space-y-8 py-4 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">¿Quieres que PLIA desarrolle tu web?</h3>
                    <p className="text-sm text-muted-foreground">Ahorra tiempo y obtén un resultado profesional optimizado para vender.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="rounded-[24px] border-border hover:border-cta transition text-left overflow-hidden">
                      <div className="p-6">
                        <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-widest text-[9px] font-bold">
                          Más Popular
                        </Badge>
                        <h4 className="text-lg font-bold mb-1">Plan Landing</h4>
                        <p className="text-xs text-muted-foreground mb-4">Ideal para campañas de venta directa y conversiones rápidas.</p>
                        <div className="text-2xl font-black mb-6">
                          S/ 390 <span className="text-xs font-normal text-muted-foreground">pago unico</span>
                        </div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Diseño en 24 horas
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Optimizado para móviles
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Redaccion Persuasiva (Copy)
                          </li>
                        </ul>
                        <Button variant="cta" className="w-full rounded-xl" asChild>
                          <Link href={`/checkout?plan=landing&domain=${currentSite?.domain}`}>Contratar Landing</Link>
                        </Button>
                      </div>
                    </Card>

                    <Card className="rounded-[24px] border-border hover:border-cta transition text-left overflow-hidden">
                      <div className="p-6">
                        <Badge variant="outline" className="mb-4 uppercase tracking-widest text-[9px] font-bold">
                          Corporativo
                        </Badge>
                        <h4 className="text-lg font-bold mb-1">Web Institucional</h4>
                        <p className="text-xs text-muted-foreground mb-4">Una web completa con múltiples secciones para tu empresa.</p>
                        <div className="text-2xl font-black mb-6">
                          S/ 690 <span className="text-xs font-normal text-muted-foreground">pago unico</span>
                        </div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Entrega en 2-4 días
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Hasta 5 secciones
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-cta" /> Panel Auto-gestionable
                          </li>
                        </ul>
                        <Button variant="outline" className="w-full rounded-xl" asChild>
                          <Link href={`/checkout?plan=web&domain=${currentSite?.domain}`}>Contratar Web</Link>
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    * Al contratar un plan de desarrollo, este sitio ({currentSite?.domain}) sera utilizado para publicar tu nueva web.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 border-t bg-muted/20 sm:justify-between">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Soporte disponible 24/7 si necesitas ayuda.
              </div>
              <Button variant="outline" className="rounded-xl px-8" onClick={() => setManageSiteId(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
