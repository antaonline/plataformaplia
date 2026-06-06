"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Layout, 
  Globe, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut, 
  Clock, 
  ChevronRight,
  Sparkles,
  Zap,
  Rocket,
  MessageSquare,
  ArrowRight,
  X,
  Image as ImageIcon,
  ArrowUpRight,
  Figma,
  Github,
  Palette,
  CreditCard,
  ChevronUp,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit2,
  FolderOpen,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DeepParticleField } from "@/components/shared/DeepParticleField";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { UpsellModal } from "@/components/experimental/UpsellModal";
import {
  StudioCapabilities,
  OnboardingAnswers,
} from "@/components/experimental/OnboardingChat";
import {
  ConversationalOnboarding,
  ConversationalOnboardingHandle,
} from "@/components/experimental/ConversationalOnboarding";
import { AdminPlanSwitcher } from "@/components/experimental/AdminPlanSwitcher";



const PLACEHOLDER_EXAMPLES = [
  "una landing page para mi gimnasio",
  "una página para mi panadería artesanal",
  "un portafolio para un fotógrafo de bodas",
  "una web para mi clínica veterinaria moderna",
  "una tienda online de café orgánico"
];

export default function DashboardPage() {
  const router = useRouter();

  const [apiBase, setApiBase] = useState('/api');

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const envApi = process.env.NEXT_PUBLIC_API_URL;
    const base = envApi || (isLocal ? 'http://localhost:3002' : '');
    const finalBase = base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api';
    setApiBase(finalBase);
  }, []);

  const [projects, setProjects] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  // Placeholder Animation State
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // Paste Images State
  const [pastedImages, setPastedImages] = useState<string[]>([]);

  // Transición tipo Claudable al crear proyecto
  const [transitioning, setTransitioning] = useState(false);
  const [transitionPrompt, setTransitionPrompt] = useState('');
  // Para la nueva animación cinematográfica del onboarding al editor:
  // guardamos el businessName y el chatId que estamos creando para
  // poder mostrar el preview del layout y hacer el redirect cuando la
  // animación termina (~2200ms).
  const [transitionBusinessName, setTransitionBusinessName] = useState('');
  const [pendingChatId, setPendingChatId] = useState<number | null>(null);

  // Upsell (mejorar plan)
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [upsellReason, setUpsellReason] = useState<string | undefined>(undefined);

  // Vista de chat conversacional: cuando el cliente submitea el textarea
  // principal, la landing se TRANSFORMA in-place al layout chat+canvas
  // (sin cambio de URL). Las preguntas y respuestas del onboarding son
  // mensajes del chat. Cuando termina, se dispara la generación y los
  // mensajes de progreso aparecen como assistant messages en el mismo chat.
  // Solo al terminar de renderizar la web se hace router.push al /project.
  const [chatViewActive, setChatViewActive] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [studioCaps, setStudioCaps] = useState<StudioCapabilities | null>(null);
  const onboardingRef = useRef<ConversationalOnboardingHandle | null>(null);

  // Coordina el redirect final. Poll al CHAT (no al preview — el preview
  // recién arranca al entrar a /project). Cuando el chat tiene un mensaje
  // del assistant con archivos generados (la generación terminó), redirige
  // a /project/<id>. La página del editor arranca el preview de Vite.
  useEffect(() => {
    if (!chatViewActive || pendingChatId === null) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    let mounted = true;
    let attempts = 0;
    let announcedDesigning = false;
    const maxAttempts = 100; // ~5 min de poll (la gen puede tardar 2-4 min)
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(
          `${apiBase}/experimental/iachat/${pendingChatId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          const messages: any[] = Array.isArray(data.messages) ? data.messages : [];
          // ¿Hay un mensaje del assistant con [FILES]? = generación terminada.
          const assistantWithFiles = messages.find(
            (m) =>
              m.role === 'assistant' &&
              typeof m.content === 'string' &&
              m.content.includes('[FILES]'),
          );
          if (assistantWithFiles) {
            onboardingRef.current?.appendProgress?.(
              '¡Tu web está lista! Abriendo el editor…',
              { done: true },
            );
            setTimeout(() => {
              if (mounted) {
                router.push(`/experimental/iachatweb/project/${pendingChatId}`);
              }
            }, 900);
            return;
          }
          // Aún generando: un solo mensaje de "diseñando" para no spamear.
          if (!announcedDesigning && attempts >= 2) {
            announcedDesigning = true;
            onboardingRef.current?.appendProgress?.(
              'Estoy escribiendo el código de cada sección. Esto toma 1-3 minutos…',
            );
          }
        }
      } catch {
        /* reintento */
      }
      if (mounted && attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else if (mounted && attempts >= maxAttempts) {
        // Timeout de seguridad: si tardó demasiado, redirigimos igual —
        // la página del editor mostrará el estado real (sigue generando
        // o ya terminó).
        router.push(`/experimental/iachatweb/project/${pendingChatId}`);
      }
    };
    poll();
    return () => {
      mounted = false;
    };
  }, [chatViewActive, pendingChatId, apiBase, router]);

  const fetchHistory = async (token: string, customBase?: string) => {
    const base = customBase || apiBase;
    try {
      const res = await fetch(`${base}/experimental/iachat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error('Error fetching history', e);
    }
  };

  /**
   * Carga las capabilities del plan del usuario. El OnboardingChat las
   * necesita para mostrar/bloquear las opciones premium de complexity
   * (Premium 3D requiere Pro, Clean estilo Apple requiere plan pagado, etc.).
   * Si falla, el onboarding sigue funcionando con defaults (todo abierto).
   */
  const fetchStudioCaps = async (token: string, customBase?: string) => {
    const base = customBase || apiBase;
    try {
      const res = await fetch(`${base}/experimental/studio-plans/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudioCaps(data);
      }
    } catch (e) {
      console.error('Error fetching studio capabilities', e);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token || !confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return;
    
    try {
      const res = await fetch(`${apiBase}/experimental/iachat/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setActiveMenuId(null);
      }
    } catch (e) {
      console.error('Error deleting project', e);
    }
  };

  const handleRename = async (id: number) => {
    const newTitle = prompt('Nuevo nombre del proyecto:');
    if (!newTitle) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiBase}/experimental/iachat/${id}/rename`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
        setActiveMenuId(null);
      }
    } catch (e) {
      console.error('Error renaming project', e);
    }
  };

  const fetchCredits = async (token: string, customBase?: string) => {
    const base = customBase || apiBase;
    try {
      const res = await fetch(`${base}/experimental/iachat/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch (e) {
      console.error('Error fetching credits', e);
    }
  };

  const fetchUser = async (token: string, customBase?: string) => {
    const base = customBase || apiBase;
    try {
      console.log('Solicitando perfil de usuario a:', `${base}/auth/me`);
      const res = await fetch(`${base}/auth/me`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Respuesta perfil:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Datos de usuario recibidos:', data);
        setUser(data);
      } else if (res.status === 401) {
        console.warn('Token inválido o expirado');
        router.push('/experimental/iachatweb/login');
      }
    } catch (e) {
      console.error('Error de red al obtener usuario:', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Calcular base URL localmente para evitar problemas de estado inicial
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const envApi = process.env.NEXT_PUBLIC_API_URL;
      const base = envApi || (isLocal ? 'http://localhost:3002' : '');
      const currentApiBase = base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api';
      setApiBase(currentApiBase);

      // 1. Prioridad: Token en la URL (flujo Google)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      // Prompt diferido desde la landing /tu-web-con-ia: lo guardamos para
      // que sobreviva al redirect de login y se ejecute tras autenticar.
      const promptFromUrl = urlParams.get('prompt');
      if (promptFromUrl && promptFromUrl.trim()) {
        sessionStorage.setItem('plia_pending_prompt', promptFromUrl.trim());
      }

      if (tokenFromUrl) {
        console.log('Token de Google detectado en URL, guardando...');
        localStorage.setItem('access_token', tokenFromUrl);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (promptFromUrl) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No hay token, redirigiendo a login');
        router.push('/experimental/iachatweb/login');
        return;
      }

      console.log('Autenticación confirmada, cargando datos de:', currentApiBase);
      setAuthChecked(true);
      await fetchUser(token, currentApiBase);
      await fetchCredits(token, currentApiBase);
      await fetchHistory(token, currentApiBase);
      // Pre-cargamos capabilities al loguear para tener el dialog de
      // onboarding listo apenas el cliente submitee su primer prompt.
      fetchStudioCaps(token, currentApiBase);

      // Prompt diferido (venido de /tu-web-con-ia tras login). Antes
      // creabamos el chat directo. Ahora abrimos el onboarding con el
      // prompt como descripción inicial — el cliente decide ahí complexity,
      // tipo y assets antes de gastar tokens en una generación a ciegas.
      const pending = sessionStorage.getItem('plia_pending_prompt');
      if (pending && pending.trim()) {
        sessionStorage.removeItem('plia_pending_prompt');
        setChatInitialPrompt(pending.trim());
        setChatViewActive(true);
      }
    };

    initAuth();
  }, []);

  // Refresca créditos al volver a la pestaña (evita contador desactualizado
  // tras generar/editar en el Studio en otra pestaña).
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      const token = localStorage.getItem('access_token');
      if (token) {
        fetchCredits(token);
        fetchHistory(token);
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [apiBase]);

  // Placeholder Typewriter Logic
  useEffect(() => {
    const handleTyping = () => {
      const currentFullText = PLACEHOLDER_EXAMPLES[exampleIndex];
      
      if (!isDeleting) {
        setPlaceholder(currentFullText.substring(0, placeholder.length + 1));
        setTypingSpeed(100);
        
        if (placeholder === currentFullText) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setPlaceholder(currentFullText.substring(0, placeholder.length - 1));
        setTypingSpeed(50);
        
        if (placeholder === "") {
          setIsDeleting(false);
          setExampleIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, exampleIndex, typingSpeed]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  /**
   * Submit del textarea principal. NO crea el chat al toque — abre el
   * OnboardingChat con el prompt como descripción inicial pre-rellenada.
   * El chat se crea recién en handleOnboardingComplete cuando el cliente
   * pasa por todos los pasos.
   *
   * Por qué no crear directo: el cliente escribe "una web para mi pizzería"
   * sin decir si quiere LANDING, TIENDA o RESTAURANTE, sin precisar
   * complexity (simple/moderno/premium 3D), sin decir si tiene fotos
   * propias. Si lo mandamos directo a Claude, Claude tiene que adivinar
   * y la calidad baja. El onboarding refina antes de gastar tokens.
   */
  /**
   * Submit del textarea principal. La landing se transforma in-place al
   * layout chat+canvas (sin cambio de URL). El ConversationalOnboarding
   * arranca con el prompt como primer mensaje del user.
   */
  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!studioCaps) fetchStudioCaps(token);
    setChatInitialPrompt(input.trim());
    setChatViewActive(true);
  };

  /**
   * Disparado cuando la IA del onboarding decidió construir. Recibe el
   * richPrompt YA armado por el backend (a partir del brief que la IA
   * estructuró conversando). Crea el chat y empieza a publicar progreso
   * al mismo chat via onboardingRef. El redirect al /project/<id> ocurre
   * en el useEffect de poll cuando el preview pasa a 'running'.
   */
  const handleReadyToBuild = async (richPrompt: string, businessName: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);
    onboardingRef.current?.appendProgress?.('Conectando con el motor de PLIA…');
    try {
      const res = await fetch(`${apiBase}/experimental/iachat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ initialPrompt: richPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        onboardingRef.current?.appendProgress?.(
          'Listo. Estoy diseñando la arquitectura y generando los archivos…',
        );
        // El poll del useEffect tomará el chatId y empezará a publicar
        // progreso del preview hasta que esté running, momento en el que
        // hace router.push al /project.
        setPendingChatId(data.id);
        return;
      }
      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        setUpsellReason(
          err?.message ||
            'Alcanzaste el límite de créditos de tu plan. Sube de plan para seguir creando.',
        );
        setUpsellOpen(true);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating project', err);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsMenuOpen(false);
    router.push('/experimental/iachatweb/login');
  };

  if (!authChecked) return null;

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      {/* Sidebar de PLIA (Estilo Dashboard) */}
      <aside className="w-[280px] bg-[#0d1117] border-r border-white/5 flex flex-col p-6 z-30">
        <div className="flex items-center gap-3 mb-10">
          <img src="/plia-logo-white.svg" alt="PLIA" className="h-8 w-auto" />
          <span className="font-black text-2xl tracking-tighter text-white">Studio</span>
        </div>

        <div className="flex-1 space-y-2">
          {[
            { icon: Layout, label: 'Proyectos', active: true },
            { icon: Globe, label: 'Dominios', active: false },
            { icon: Settings, label: 'Configuración', active: false },
            { icon: HelpCircle, label: 'Soporte', active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all group",
                item.active ? "bg-cta/10 text-cta font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", item.active ? "text-cta" : "text-white/20 group-hover:text-white/50")} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-6">
           {/* Selector de plan SOLO admin — para probar cada tier. */}
           {user?.role === 'ADMIN' && (
             <AdminPlanSwitcher
               apiBase={apiBase}
               authToken={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}
               currentSlug={studioCaps?.planSlug}
               onChanged={(slug) => {
                 const token = localStorage.getItem('access_token');
                 if (token) fetchStudioCaps(token);
               }}
             />
           )}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap className="h-12 w-12 text-cta fill-cta" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-cta uppercase tracking-[0.2em]">Créditos IA</p>
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-full text-white/80">
                  {credits?.planLabel || 'Explorador'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-black mb-1.5">
                <span className="text-white/60">Diarios</span>
                <span className="text-cta">
                  {credits ? `${credits.dailyUsed} / ${credits.totalLimit}` : '...'}
                </span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-cta transition-all duration-1000 shadow-[0_0_10px_rgba(180,255,0,0.5)]"
                  style={{
                    width: `${
                      credits && credits.totalLimit
                        ? Math.min(100, (credits.dailyUsed / credits.totalLimit) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-black mb-1.5">
                <span className="text-white/60">Mensuales</span>
                <span className="text-white/80">
                  {credits ? `${credits.monthlyUsed} / ${credits.monthlyLimit}` : '...'}
                </span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-white/40 transition-all duration-1000"
                  style={{
                    width: `${
                      credits && credits.monthlyLimit
                        ? Math.min(100, (credits.monthlyUsed / credits.monthlyLimit) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              <button
                onClick={() => setUpsellOpen(true)}
                className="w-full bg-cta/10 hover:bg-cta/20 border border-cta/30 text-cta text-[11px] font-black uppercase tracking-widest rounded-xl py-2.5 transition-all"
              >
                Mejorar plan
              </button>
           </div>

           <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
              >
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                   {user?.avatar ? <img src={user.avatar} alt="u" /> : <User className="h-6 w-6 text-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black text-white truncate">{user?.name || 'Usuario PLIA'}</p>
                   <p className="text-[10px] text-white/40 font-bold truncate">{user?.email || '...'}</p>
                </div>
                <ChevronUp className={cn("h-4 w-4 text-white/20 transition-all", isMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-[#1c2128] border border-white/10 rounded-3xl shadow-2xl p-2 z-[60]"
                  >
                    <div className="p-3 space-y-1">
                      {[
                        { icon: User, label: 'Perfil' },
                        { icon: Settings, label: 'Ajustes', sub: 'Ctrl.' },
                        { icon: Palette, label: 'Apariencia', arrow: true },
                        { icon: HelpCircle, label: 'Soporte' },
                        { icon: CreditCard, label: 'Planes' },
                      ].map((item, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all text-left">
                          <div className="flex items-center gap-3">
                             <item.icon className="h-4 w-4 text-white/40" />
                             <span className="text-xs font-bold text-white/70">{item.label}</span>
                          </div>
                          {item.arrow && <ChevronRight className="h-3 w-3 text-white/20" />}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-white/5">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-xs font-black">Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-none relative">
        {/* HERO SECTION - COPIA EXACTA DE LA LANDING */}
        <section className="relative overflow-hidden pt-32 pb-24 min-h-[80vh] flex flex-col justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,255,0,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.8),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          <DeepParticleField />

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <AnimatedSection direction="up">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-cta animate-pulse" />
                <span className="text-sm font-medium text-white/90">
                  <span className="font-bold text-white">IA Generativa</span> de próxima generación
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.05] text-white md:text-6xl lg:text-[76px] tracking-tight mb-8">
                ¿Qué vas a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cta via-[#d4ff55] to-cta animate-shimmer italic font-bold">
                  construir
                </span> hoy?
              </h1>
              
              <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-white/70">
                Tu web profesional lista en minutos, no en semanas. Deja de imaginar, empieza a chatear con nuestra IA y lánzala con un solo clic.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="mt-12 max-w-3xl mx-auto relative group">
              {/* Previsualización de imágenes pegadas */}
              <AnimatePresence>
                {pastedImages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-24 left-0 right-0 flex gap-3 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl z-20"
                  >
                    {pastedImages.map((img, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/20 group">
                         <img src={img} alt="pasted" className="h-full w-full object-cover" />
                         <button 
                          onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                         >
                            <X className="h-4 w-4 text-white" />
                         </button>
                      </div>
                    ))}
                    <div className="flex flex-col justify-center text-left">
                       <span className="text-[10px] font-black text-cta uppercase tracking-widest">Imagen pegada</span>
                       <span className="text-[9px] text-slate-400 font-bold">Captura lista para la IA</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute -inset-1 bg-cta/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <form 
                onSubmit={handleCreate}
                onPaste={handlePaste}
                className="relative bg-[#161b22] border border-white/10 p-4 md:p-6 rounded-[2rem] shadow-2xl"
              >
                <textarea 
                  placeholder={`Ej: Hazme ${placeholder}_`}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg py-2 px-4 min-h-[100px] text-white placeholder:text-slate-600 resize-none scrollbar-none focus:outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate(e);
                    }
                  }}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <button type="button" className="p-2 rounded-xl text-slate-500 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <Plus className="h-5 w-5" />
                    </button>
                    <div className="hidden sm:flex gap-2 ml-2">
                      <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/5 transition-all">
                        <Figma className="h-3 w-3" /> Figma
                      </button>
                      <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/5 transition-all">
                        <Github className="h-3 w-3" /> GitHub
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    className="bg-cta hover:bg-cta-hover text-black rounded-full h-12 px-10 font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(191,255,0,0.3)] transition-all"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Zap className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <>
                        Construir ahora
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </section>

        {/* PROJECTS SECTION - RECIÉN DISEÑADA EN BLANCO */}
        <section className="py-24 bg-white text-slate-900 rounded-t-[40px] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="max-w-6xl mx-auto px-12">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                   Proyectos Recientes
                   <Badge className="bg-slate-100 text-slate-400 border-none rounded-lg text-sm px-3 py-1 font-black">{projects.length}</Badge>
                </h2>
                <Button variant="ghost" className="text-sm font-bold text-slate-400 hover:text-cta">Ver todos <ChevronRight className="ml-1 h-4 w-4" /></Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <motion.button 
                  whileHover={{ y: -5 }}
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="h-[400px] rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-cta hover:text-cta transition-all group bg-slate-50/50"
                >
                   <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                      <Plus className="h-10 w-10" />
                   </div>
                   <span className="font-black text-xs uppercase tracking-widest">Nuevo Proyecto</span>
                </motion.button>

                {projects.map((project, i) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ y: -10 }}
                    className={cn(
                      "h-[400px] rounded-[3rem] bg-white border border-slate-200 p-8 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative",
                      activeMenuId === project.id ? "z-50" : "z-10"
                    )}
                  >
                    {/* Botón de opciones tipo Lovable */}
                    <div className="absolute top-6 right-6 z-10">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === project.id ? null : project.id); }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                       >
                          <MoreHorizontal className="h-5 w-5" />
                       </button>

                       <AnimatePresence>
                         {activeMenuId === project.id && (
                           <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute top-12 right-0 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-20"
                           >
                              {[
                                { icon: ExternalLink, label: 'Abrir en nueva pestaña', onClick: () => window.open(`/experimental/iachatweb/project/${project.id}`, '_blank') },
                                { icon: Globe, label: 'Ver sitio publicado', disabled: true },
                                { icon: Zap, label: 'Analíticas', disabled: true },
                                { icon: FolderOpen, label: 'Mover a carpeta', disabled: true },
                                { icon: Share2, label: 'Remix', disabled: true },
                                { icon: Edit2, label: 'Renombrar', onClick: () => handleRename(project.id) },
                              ].map((item, idx) => (
                                <button 
                                  key={idx} 
                                  onClick={(e) => { e.stopPropagation(); if(item.onClick) item.onClick(); }}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
                                    item.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50"
                                  )}
                                >
                                   <item.icon className="h-4 w-4 text-slate-400" />
                                   <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                </button>
                              ))}
                              <div className="h-px bg-slate-50 my-2" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-500 transition-all text-left"
                              >
                                 <Trash2 className="h-4 w-4" />
                                 <span className="text-xs font-black">Eliminar</span>
                              </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>

                    <div onClick={() => router.push(`/experimental/iachatweb/project/${project.id}`)} className="flex-1 flex flex-col">
                      <div className="h-40 w-full rounded-2xl bg-slate-50 mb-6 flex items-center justify-center relative overflow-hidden">
                         <Layout className="h-12 w-12 text-slate-100 group-hover:text-cta/30 transition-all duration-500" />
                         <img
                           src={`${apiBase.replace('/api', '')}/uploads/thumbnails/${project.id}.png?t=${project.updatedAt || ''}`}
                           alt={project.title || 'Proyecto'}
                           className="absolute inset-0 w-full h-full object-cover object-top"
                           onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                         />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-lg text-slate-900 mb-1 group-hover:text-cta transition-all truncate">{project.title || 'Proyecto sin título'}</h3>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> Hace unos momentos
                         </p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                         <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-cta transition-all">Abrir Studio</span>
                         <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-cta group-hover:text-black transition-all">
                            <ArrowRight className="h-5 w-5" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>
      </main>

      {/* Cerrar menús al hacer clic fuera */}
      {(activeMenuId || isMenuOpen) && (
        <div className="fixed inset-0 z-10" onClick={() => { setActiveMenuId(null); setIsMenuOpen(false); }} />
      )}

      <UpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        reason={upsellReason}
        currentPlan={credits?.plan}
      />

      {/* VISTA CHAT CONVERSACIONAL CENTRADA (estilo Lovable). Cuando el
          cliente submitea el textarea grande, la landing se cubre con un
          fade + scale suave que da sensación de que toda la página se
          "transforma" en el chat. El fondo es el MISMO de la landing
          (#0d1117) para que la continuidad visual sea total. El chat vive
          en una columna central, sin paneles laterales. No cambia la URL. */}
      <AnimatePresence>
        {chatViewActive && (
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] bg-[#0d1117] overflow-hidden"
          >
            {/* Halo decorativo — mismo lenguaje visual de la landing */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,255,0,0.10),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.8),transparent_55%)] pointer-events-none" />

            {/* Chat centrado en columna */}
            <div className="relative z-10 h-full">
              <ConversationalOnboarding
                ref={onboardingRef}
                capabilities={studioCaps}
                initialPrompt={chatInitialPrompt}
                apiBase={apiBase}
                authToken={
                  typeof window !== 'undefined'
                    ? localStorage.getItem('access_token') || ''
                    : ''
                }
                onReadyToBuild={handleReadyToBuild}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
