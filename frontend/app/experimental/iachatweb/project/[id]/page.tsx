"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Sparkles, ChevronRight, Monitor, Tablet, Smartphone, Send, 
  ArrowLeft, RotateCcw, Globe, History, AlertCircle, Loader2,
  BookOpen, Hammer, MessageSquare, Lightbulb, X, Check, Wand2,
  Paperclip, Image as ImageIcon, Trash2, ChevronDown, Sidebar,
  Zap, FileText, Clock, Plus, Layout, Settings, LogOut, Search,
  MoreVertical, Eye, Code, Download, Copy, User, Bot, Save, Trash, ExternalLink,
  MousePointer2, Workflow, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThinkingEngine, AgentState } from '@/components/experimental/ThinkingEngine';
import { UpsellModal } from '@/components/experimental/UpsellModal';
import FileExplorer from '@/components/experimental/FileExplorer';
import {
  OnboardingChat,
  StudioCapabilities,
  OnboardingAnswers,
} from '@/components/experimental/OnboardingChat';
import { Templates3DDialog } from '@/components/experimental/Templates3DDialog';
import { CreativeStudioDialog } from '@/components/experimental/CreativeStudioDialog';
import { NodeCanvasDialog } from '@/components/experimental/NodeCanvasDialog';
import { CanvasViewport, CanvasViewportHandle } from '@/components/experimental/CanvasViewport';
import { CanvasItemsLayer, CanvasItem } from '@/components/experimental/CanvasItemsLayer';
import { StyleInspector } from '@/components/experimental/StyleInspector';
import { LayersPanel } from '@/components/experimental/LayersPanel';
import type { CreativeAsset } from '@/components/experimental/CreativeStudioDialog';
import { toast } from 'sonner';
import ThinkingSection from '@/components/chat/ThinkingSection';
import ToolResultItem from '@/components/chat/ToolResultItem';
import ReactMarkdown from 'react-markdown';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/toaster';

// Mapea los estados internos de la pagina (Build/Ask/Plan/working/searching/idle)
// a los estados que ThinkingEngine entiende (thinking/planning/coding/...).
// Sin esto, TypeScript rechaza pasar agentState directamente al componente.
function mapToThinkingState(
  s: AgentState | 'idle' | 'working' | 'searching' | 'Build' | 'Ask' | 'Plan',
): AgentState {
  switch (s) {
    case 'idle':
    case 'Build':
    case 'Ask':
    case 'Plan':
      return 'thinking';
    case 'working':
      return 'coding';
    case 'searching':
      return 'debugging';
    default:
      return s;
  }
}

export default function projectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [apiBase, setApiBase] = useState('/api');

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const envApi = process.env.NEXT_PUBLIC_API_URL;
    const base = envApi || (isLocal ? 'http://localhost:3002' : window.location.origin);
    const finalBase = base.endsWith('/api') ? base : `${base}/api`;
    setApiBase(finalBase);
  }, []);

  const [messages, setMessages] = useState<any[]>([]);
  // ── Onboarding Conversacional (PLIA Studio v2) ──
  // Cuando el proyecto está recién creado (sin mensajes ni archivos generados)
  // mostramos un chat guiado en lugar de saltar directo al canvas. Esto ahorra
  // costos de API porque calibramos la generación según lo que el cliente realmente
  // necesita y permite ofrecer la mejor experiencia "WOW" sin desperdiciar tokens.
  const [studioCaps, setStudioCaps] = useState<StudioCapabilities | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTemplates3D, setShowTemplates3D] = useState(false);
  const [showCreative, setShowCreative] = useState(false);
  const [showNodeCanvas, setShowNodeCanvas] = useState(false);
  const onboardingCheckedRef = useRef(false);
  const [input, setInput] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  // Sprint 4: alternar entre vista de preview (iframe) y vista de codigo
  // (arbol de archivos + viewer). Estilo Lovable/Bolt.
  const [rightPaneMode, setRightPaneMode] = useState<'preview' | 'code'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSelectedOption, setHasSelectedOption] = useState(false);
  const [pages, setPages] = useState<Record<string, string>>({});
  const [currentPath, setCurrentPath] = useState('/');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  // Unimos los estados propios de esta pagina (Build/Ask/Plan/working/searching/idle)
  // con los estados del ThinkingEngine (coding/rendering/done/...) para que setAgentState
  // acepte cualquiera sin que `next build` se queje por type mismatch.
  const [agentState, setAgentState] = useState<
    AgentState | 'idle' | 'working' | 'searching' | 'Build' | 'Ask' | 'Plan'
  >('Build');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<string>("");
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewStatus, setPreviewStatus] = useState<string>('stopped');
  const previewStartedRef = useRef(false);
  const awaitingGenRef = useRef(false);
  const startingRef = useRef(false);
  const pagesRef = useRef<Record<string, string>>({});
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [upsellReason, setUpsellReason] = useState<string | undefined>(undefined);
  const [creditsChip, setCreditsChip] = useState<any>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [previewRoute, setPreviewRoute] = useState('/');
  const [previewNonce, setPreviewNonce] = useState(0);
  const prevStatusRef = useRef<string>('');
  // showExplorer: el viejo sidebar lateral "Explorador" se eliminó (lo
  // reemplaza el FileExplorer integrado al modo CODE del panel derecho,
  // que es mejor: muestra el contenido del archivo, no solo nombres).
  const [chatMode, setChatMode] = useState<'build' | 'ask' | 'plan'>('build');
  const [showAiRules, setShowAiRules] = useState(false);
  const [aiRules, setAiRules] = useState<string>('');
  const [aiRulesSaved, setAiRulesSaved] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<CanvasViewportHandle>(null);
  // Modo lienzo: cuando está activo, el preview vive en un canvas infinito
  // con zoom/pan (estilo Framer). Cuando está apagado, ocupa todo el panel.
  const [canvasMode, setCanvasMode] = useState(true);
  // Modo edición visual (Fase B): seleccionar elementos del preview y
  // editarlos (texto/imagen) directo en el lienzo.
  const [editMode, setEditMode] = useState(false);
  const [selectedEl, setSelectedEl] = useState<any | null>(null);
  const [creativeForReplace, setCreativeForReplace] = useState(false);
  // Assets generados/subidos en el Estudio Creativo, accesibles para
  // arrastrar sobre el lienzo (Fase C). Persisten en la sesión del editor.
  const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
  // Drop de imágenes externas (desde el PC) al lienzo.
  const [fileDragActive, setFileDragActive] = useState(false);

  // LIENZO UNIFICADO (estilo Kittl): los assets viven como items flotantes
  // en el mismo lienzo que el artboard. Se mueven, redimensionan, convierten
  // a video y se arrastran sobre el sitio para reemplazar imágenes.
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  // Multi-selección (marquee / Shift+click) de items flotantes del lienzo.
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  // Panel de capas (árbol del DOM) + su contenido (lo reporta el bridge).
  const [showLayers, setShowLayers] = useState(false);
  const [layerTree, setLayerTree] = useState<{ path: string; label: string; depth: number; kids: number }[]>([]);
  // Overrides de estilo (estilo Framer), anidados por breakpoint:
  // { desktop|tablet|mobile: { [rutaDOM]: { paddingTop, ... } } }.
  // Se guardan por proyecto y se re-aplican al recargar el preview.
  const padOverridesRef = useRef<
    Record<string, Record<string, Record<string, string>>>
  >({});
  // Cola para persistir los overrides EN EL CÓDIGO (src/plia-overrides.css del
  // proyecto, vía backend). Se agrupa por breakpoint+ruta y debouncea.
  const pendingStyleRef = useRef<
    Record<string, { bp: string; path: string; style: Record<string, string> }>
  >({});
  const styleFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Transformación actual del lienzo (zoom/pan) — la reporta el
  // CanvasViewport; los items la usan para la matemática de arrastre.
  const canvasTransformRef = useRef<{ zoom: number; pan: { x: number; y: number } }>({
    zoom: 1,
    pan: { x: 0, y: 0 },
  });
  // Zoom como estado SOLO para la contra-escala de la UI de los items
  // (toolbar/handles a tamaño constante). El pan no necesita re-render.
  const [canvasZoom, setCanvasZoom] = useState(1);
  // Altura REAL del documento del sitio (la reporta el bridge del scaffold
  // via PLIA_DOC_HEIGHT). En modo lienzo, el artboard se estira a esta
  // altura para mostrar la web COMPLETA de arriba a abajo (estilo Framer),
  // sin scroll interno.
  const [siteDocHeight, setSiteDocHeight] = useState<number>(0);

  /** Dimensiones del artboard según el dispositivo activo. */
  const artboardDims = useCallback(() => {
    return viewport === 'tablet'
      ? { w: 820, h: 1180 }
      : viewport === 'mobile'
        ? { w: 390, h: 844 }
        : { w: 1440, h: 900 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  /** Agrega un asset como item del lienzo, a la derecha del artboard. */
  const addCanvasItem = useCallback(
    (url: string, kind: 'image' | 'video', at?: { x: number; y: number }) => {
      const dims = artboardDims();
      setCanvasItems((prev) => {
        const pos = at || {
          x: dims.w + 70,
          y: 40 + (prev.length % 6) * 70,
        };
        return [
          ...prev,
          {
            id: `it-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
            kind,
            url,
            x: pos.x,
            y: pos.y,
            w: 240,
            ar: 4 / 3, // se corrige al cargar el media
          },
        ];
      });
    },
    [artboardDims],
  );

  /**
   * Sube imágenes arrastradas desde el PC y las coloca COMO ITEMS en el
   * lienzo, en el punto donde se soltaron (coords pantalla → stage).
   */
  const handleExternalFiles = useCallback(
    async (files: FileList | File[], dropPoint?: { clientX: number; clientY: number; rect: DOMRect }) => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imgs.length === 0) return;
      // Punto de drop en coords del stage (si lo tenemos).
      let at: { x: number; y: number } | undefined;
      if (dropPoint) {
        const { zoom, pan } = canvasTransformRef.current;
        at = {
          x: (dropPoint.clientX - dropPoint.rect.left - pan.x) / zoom - 120,
          y: (dropPoint.clientY - dropPoint.rect.top - pan.y) / zoom - 80,
        };
      }
      let offset = 0;
      for (const file of imgs) {
        const form = new FormData();
        form.append('file', file);
        try {
          const res = await fetch(`${apiBase}/experimental/creative/upload-local`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
          const data = await res.json();
          if (data.url) {
            addCanvasItem(
              data.url,
              'image',
              at ? { x: at.x + offset, y: at.y + offset } : undefined,
            );
            offset += 30;
            // También al catálogo del Estudio Creativo (pestaña Mis Assets).
            setCreativeAssets((prev) => [
              { id: `up-${Date.now()}-${Math.random()}`, kind: 'image', url: data.url, createdAt: Date.now() },
              ...prev,
            ]);
          }
        } catch {
          /* noop */
        }
      }
    },
    [apiBase, addCanvasItem],
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentTask]);

  const shellHtml = React.useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/framer-motion/10.16.4/framer-motion.umd.min.js"></script>
        <style>
          body { margin: 0; background: white; color: #0f172a; font-family: sans-serif; min-height: 100vh; overflow-x: hidden; }
          #root { min-height: 100vh; }
          .loader { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ccc; font-size: 14px; }
          .inspect-highlight { outline: 2px solid #6366f1 !important; outline-offset: -2px !important; cursor: crosshair !important; }
          #console-log { position: fixed; bottom: 0; left: 0; right: 0; max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.8); color: #00ff00; font-family: monospace; font-size: 10px; padding: 10px; z-index: 9999; pointer-events: none; }
        </style>
      </head>
      <body>
        <div id="root"><div class="loader">Sincronizando motor...</div></div>
        <div id="console-log"></div>
        <script>
          window.parent.postMessage({ type: 'DEBUG_LOG', msg: 'MOTOR: Iniciando ejecución...' }, '*');
          const logEl = document.getElementById('console-log');
          const originalLog = console.log;
          const originalError = console.error;
          
          const debugParent = (m) => {
            window.parent.postMessage({ type: 'DEBUG_LOG', msg: m }, '*');
          };

          console.log = (...args) => {
            originalLog(...args);
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
            const div = document.createElement('div');
            div.textContent = "> " + msg;
            logEl.appendChild(div);
            logEl.scrollTop = logEl.scrollHeight;
            debugParent(msg);
          };
          console.error = (...args) => {
            originalError(...args);
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
            const div = document.createElement('div');
            div.style.color = '#ff0000';
            div.textContent = "ERR> " + msg;
            logEl.appendChild(div);
            logEl.scrollTop = logEl.scrollHeight;
            debugParent("ERROR: " + msg);
          };

          console.log("Iframe inicializando...");
          
          window.onerror = (msg, url, line, col, error) => {
            console.error("Iframe Error: " + msg + " at " + url + ":" + line);
            window.parent.postMessage({ type: 'RUNTIME_ERROR', error: msg + " (line " + line + ")" }, '*');
          };

          let loadAttempts = 0;
          const checkLibs = () => {
            loadAttempts++;
            const missing = [];
            if (!window.React) missing.push("React");
            if (!window.ReactDOM) missing.push("ReactDOM");
            if (!window.Babel) missing.push("Babel");
            if (!window.tailwind) missing.push("Tailwind");
            if (!window.Motion && !window.framerMotion) missing.push("FramerMotion");

            if (missing.length === 0) {
              init();
            } else {
              if (loadAttempts % 20 === 0) {
                console.log("Faltan: " + missing.join(", "));
              }
              if (loadAttempts > 100) { // 10 segundos
                console.error("Timeout cargando librerías: " + missing.join(", "));
                return;
              }
              setTimeout(checkLibs, 100);
            }
          };

          const init = () => {
            console.log("Librerías cargadas. Configurando entorno...");
            
            const LucideIcons = new Proxy({}, {
              get: (target, name) => (props) => React.createElement('svg', { 
                ...props, width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
                className: 'lucide lucide-' + name.toLowerCase() + ' ' + (props.className || '')
              }, React.createElement('circle', { cx: 12, cy: 12, r: 10, opacity: 0.2 }), React.createElement('path', { d: 'M12 8v4l3 3', opacity: 0.5 }));
            });

            window.React = React; window.ReactDOM = ReactDOM;
            window.useState = React.useState; window.useEffect = React.useEffect; window.useRef = React.useRef; window.useMemo = React.useMemo; window.useCallback = React.useCallback;
            window.Icon = ({ name, ...props }) => React.createElement(LucideIcons[name] || LucideIcons['Circle'], props);
            window.cn = (...args) => args.filter(Boolean).join(' ');
            
            // Mock de lucide-react para que no falle al leer .Icon
            window.LucideReact = { 
              ...LucideIcons,
              Icon: ({ name, ...props }) => React.createElement(LucideIcons[name] || LucideIcons['Circle'], props)
            };

            console.log("Entorno listo. Enviando IFRAME_READY...");
            window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
          };

          const instanceRegistry = {};
          let reactRoot = null;

          const runModule = (p) => {
            if (instanceRegistry[p]) return instanceRegistry[p];
            const compiled = window.compiledResults[p];
            if (!compiled || compiled.error) return null;

            const exports = {};
            const module = { exports };
            const require = (name) => {
              if (name === 'react') return window.React;
              if (name === 'react-dom') return window.ReactDOM;
              if (name === 'lucide-react') return { Icon: window.Icon };
              const resolved = name.startsWith('./') ? name.replace('./', '/') : (name.startsWith('/') ? name : '/' + name);
              return runModule(resolved) || runModule(resolved.substring(1)) || runModule(resolved + '.tsx') || runModule(resolved + '.ts');
            };

            try {
              const execute = new Function('React', 'ReactDOM', 'require', 'exports', 'module', compiled.js + "; return module.exports.AppMain || module.exports.default || module.exports;");
              const result = execute(window.React, window.ReactDOM, require, exports, module);
              instanceRegistry[p] = result;
              return result;
            } catch (e) {
              console.error("Error ejecutando módulo " + p + ": " + e.message);
              return null;
            }
          };

          const compileCode = async (files, apiBase) => {
            try {
              console.log("Compilando con Sandbox...");
              const res = await fetch(apiBase + '/experimental/sandbox/compile-multiple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
              });
              if (res.ok) return await res.json();
            } catch (e) { console.warn("Sandbox falló, usando Babel..."); }

            const results = {};
            for (const [p, code] of Object.entries(files)) {
              try {
                const { code: transformed } = Babel.transform(code, {
                  presets: ['react', ['typescript', { isTSX: true, allExtensions: true }]],
                  filename: p
                });
                results[p] = { js: transformed };
              } catch (err) { results[p] = { error: err.message }; }
            }
            return results;
          };

          window.addEventListener('message', async (event) => {
            if (event.data.type === 'RENDER_CODE') {
              try {
                const { files, path, apiBase } = event.data;
                console.log("RENDER_CODE recibido. Compilando...");
                window.compiledResults = await compileCode(files, apiBase);
                
                for (let key in instanceRegistry) delete instanceRegistry[key];
                const entryFile = path === '/' ? '/AppMain.tsx' : (path.startsWith('/') ? path : '/' + path);
                let RootComponent = runModule(entryFile) || runModule(entryFile.substring(1)) || runModule('/AppMain.tsx') || runModule('AppMain.tsx');
                
                if (!RootComponent) {
                  for (let p in window.compiledResults) {
                    const mod = runModule(p);
                    if (mod) { RootComponent = mod; break; }
                  }
                }

                if (RootComponent) {
                  const rootEl = document.getElementById('root');
                  if (!reactRoot) reactRoot = ReactDOM.createRoot(rootEl);
                  reactRoot.render(React.createElement(RootComponent));
                  console.log("Renderizado completado con éxito");
                } else {
                  console.error("No se encontró componente raíz.");
                }
              } catch (e) { console.error("Render Error: " + e.message); }
            }
          });

          checkLibs();
        </script>
      </body>
    </html>
  `, []);

  const pollStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/experimental/preview/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPreviewStatus(data.status);
      if (Array.isArray(data.logs) && data.logs.length > 0) {
        setDebugLogs(data.logs.slice(-12));
      }
      if (data.status === 'running' && data.url) {
        setPreviewUrl((prev) => (prev === data.url ? prev : data.url));
        setRuntimeError(null);
      } else if (
        // Auto-sanación: el backend se reinició y mató Vite (status
        // 'stopped'/'error' o sin url) pero tenemos archivos -> relevantar.
        (data.status === 'stopped' || data.status === 'error' || !data.url) &&
        Object.keys(pagesRef.current).length > 0 &&
        !startingRef.current
      ) {
        startPreview(pagesRef.current);
      }
    } catch (e) {
      /* backend offline: se reintenta en el siguiente tick */
    }
  };

  const startPreview = async (files: Record<string, string>) => {
    const token = localStorage.getItem('access_token');
    if (!token || Object.keys(files).length === 0) return;
    if (startingRef.current) return;
    startingRef.current = true;
    previewStartedRef.current = true;
    setPreviewStatus('starting');
    setAgentState('working');
    try {
      const res = await fetch(`${apiBase}/experimental/preview/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewStatus(data.status);
        if (data.status === 'running' && data.url) setPreviewUrl(data.url);
        if (Array.isArray(data.logs)) setDebugLogs(data.logs.slice(-12));
      }
    } catch (e) {
      setRuntimeError('No se pudo contactar el motor de preview.');
    } finally {
      startingRef.current = false;
      setAgentState('idle');
    }
  };

  const syncPreview = async (files: Record<string, string>) => {
    const token = localStorage.getItem('access_token');
    if (!token || Object.keys(files).length === 0) return;
    try {
      await fetch(`${apiBase}/experimental/preview/${id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files }),
      });
    } catch (e) {
      /* HMR best-effort */
    }
  };

  const restartPreview = () => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = previewUrl;
      }, 50);
    }
  };

  // Pide al preview que se auto-capture (capturador inyectado en el scaffold).
  const captureThumbnail = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PLIA_CAPTURE' },
        '*',
      );
    } catch (e) {
      /* preview aun no listo */
    }
  }, []);

  // Recibe la imagen del preview y la guarda como thumbnail del proyecto.
  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      // 1. Captura de miniatura.
      if (e.data?.type === 'PLIA_SHOT' && e.data.dataUrl) {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
          await fetch(`${apiBase}/experimental/iachat/${id}/thumbnail`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ dataUrl: e.data.dataUrl }),
          });
        } catch (err) {
          /* best-effort */
        }
        return;
      }

      // 2. Captura de errores de runtime del proyecto generado.
      // El index.html del scaffold escucha window.onerror,
      // unhandledrejection y un watchdog de "root vacio tras 4s" y nos
      // los envia. Asi el cliente VE el problema en vez de un blanco mudo.
      if (e.data?.type === 'PLIA_RUNTIME_ERROR' && e.data.message) {
        const kind = e.data.kind as 'error' | 'promise' | 'blank';
        const prefix =
          kind === 'blank'
            ? 'Página en blanco'
            : kind === 'promise'
            ? 'Promise sin manejar'
            : 'Error de runtime';
        setRuntimeError(`${prefix}: ${e.data.message}`);
        return;
      }

      // 3. EDICIÓN VISUAL (Fase B): elemento seleccionado en el lienzo.
      if (e.data?.type === 'PLIA_ELEMENT_SELECTED') {
        setSelectedEl(e.data);
        return;
      }
      // 3.1. Árbol del DOM para el panel de capas.
      if (e.data?.type === 'PLIA_TREE' && Array.isArray(e.data.tree)) {
        setLayerTree(e.data.tree);
        return;
      }
      // 3.5. Altura del documento del sitio (para desplegar la web completa).
      if (e.data?.type === 'PLIA_DOC_HEIGHT' && typeof e.data.height === 'number') {
        setSiteDocHeight(Math.min(e.data.height, 30000)); // tope sanidad
        return;
      }
      // 3.6. Rueda reenviada desde DENTRO del iframe (los eventos del
      // iframe cross-origin no llegan al lienzo). Convertimos las coords
      // internas del iframe a coords de pantalla (el rect ya incluye el
      // zoom del lienzo) y aplicamos zoom/pan del canvas.
      if (e.data?.type === 'PLIA_WHEEL') {
        const ifr = iframeRef.current;
        if (!ifr || !canvasRef.current) return;
        const r = ifr.getBoundingClientRect();
        const scale = ifr.offsetWidth > 0 ? r.width / ifr.offsetWidth : 1;
        canvasRef.current.applyExternalWheel({
          screenX: r.left + (e.data.clientX || 0) * scale,
          screenY: r.top + (e.data.clientY || 0) * scale,
          deltaX: e.data.deltaX || 0,
          deltaY: e.data.deltaY || 0,
          ctrlKey: !!e.data.ctrlKey,
          shiftKey: !!e.data.shiftKey,
        });
        return;
      }
      // 3.7. Ctrl+Z / Ctrl+Shift+Z presionados con el foco DENTRO del sitio
      // (el bridge los reenvía porque el keydown del iframe no llega acá).
      if (e.data?.type === 'PLIA_UNDO') {
        performUndo();
        return;
      }
      if (e.data?.type === 'PLIA_REDO') {
        performRedo();
        return;
      }

      // 4. Texto editado inline -> aplicar al código via visual-edit.
      if (e.data?.type === 'PLIA_TEXT_CHANGED' && e.data.oldText) {
        await applyVisualEdit({
          kind: 'text',
          oldText: e.data.oldText,
          newText: e.data.newText,
        });
        return;
      }
      // 5. Imagen reemplazada -> aplicar al código.
      if (e.data?.type === 'PLIA_IMG_REPLACED' && e.data.oldSrc) {
        await applyVisualEdit({
          kind: 'image',
          oldSrc: e.data.oldSrc,
          newUrl: e.data.newUrl,
        });
        return;
      }
      // 6. Padding ajustado (estilo Framer): se persiste por proyecto+ruta y
      // se re-aplica al recargar (el bridge ya lo aplicó en vivo).
      if (e.data?.type === 'PLIA_PADDING_CHANGED' && e.data.path) {
        const bp: string = e.data.bp || 'desktop';
        const map = padOverridesRef.current; // { bp: { path: {prop} } }
        const bpMap = map[bp] || (map[bp] = {});
        // Valores previos (para Ctrl+Z) ANTES de pisar el override.
        const before: Record<string, string> = {};
        for (const k of Object.keys(e.data.padding)) before[k] = bpMap[e.data.path]?.[k] ?? '';
        bpMap[e.data.path] = { ...(bpMap[e.data.path] || {}), ...e.data.padding };
        try {
          localStorage.setItem(`pliaPadOverrides:${id}`, JSON.stringify(map));
        } catch {
          /* cuota llena: el cambio sigue vivo en pantalla */
        }
        // Persistir también en el código del proyecto (durable + exportable)
        // y registrar en el historial (el bridge ya lo aplicó en vivo).
        queueStyleToCode(e.data.path, e.data.padding, bp);
        recordStyleEdit(e.data.path, bp, before, e.data.padding);
        return;
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, id]);

  // Historial de ediciones visuales para Ctrl+Z / Ctrl+Shift+Z.
  // Incluye estilos (padding/resize/inspector): `before`/`after` son mapas de
  // props CSS; "" en una prop = sin override (volver al valor generado).
  type StyleEdit = {
    kind: 'style';
    path: string;
    bp: string; // breakpoint: desktop | tablet | mobile
    before: Record<string, string>;
    after: Record<string, string>;
  };
  type VisualEdit =
    | { kind: 'text'; oldText: string; newText: string }
    | { kind: 'image'; oldSrc: string; newUrl: string }
    | StyleEdit;
  const undoStack = useRef<VisualEdit[]>([]);
  const redoStack = useRef<VisualEdit[]>([]);
  // Para coalescer ráfagas de estilo (teclear/arrastrar) en un solo paso undo.
  const lastStyleEditRef = useRef<{ path: string; t: number } | null>(null);
  // Puente de orden: performUndo/Redo (definidos aquí) llaman a applyStyleEdit
  // (definido más abajo) a través de este ref, sin meterlo en sus deps.
  const applyStyleEditRef = useRef<((edit: StyleEdit) => Promise<boolean>) | null>(null);
  const invertEdit = (e: VisualEdit): VisualEdit =>
    e.kind === 'text'
      ? { kind: 'text', oldText: e.newText, newText: e.oldText }
      : e.kind === 'image'
        ? { kind: 'image', oldSrc: e.newUrl, newUrl: e.oldSrc }
        : { kind: 'style', path: e.path, bp: e.bp, before: e.after, after: e.before };

  /**
   * Aplica una edición visual (texto/imagen) llamando al backend, que
   * reemplaza en los archivos. Luego actualiza `pages` con los archivos
   * devueltos -> el useEffect de sync recarga el preview (Vite HMR).
   * Las ediciones exitosas entran al historial (Ctrl+Z), salvo que
   * vengan del propio undo/redo (skipHistory).
   */
  const applyVisualEdit = useCallback(
    async (edit: VisualEdit, opts?: { skipHistory?: boolean }) => {
      const token = localStorage.getItem('access_token');
      if (!token) return false;
      try {
        const res = await fetch(`${apiBase}/experimental/iachat/${id}/visual-edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(edit),
        });
        const data = await res.json();
        if (data.ok && data.files && Object.keys(data.files).length > 0) {
          setPages(data.files);
          if (!opts?.skipHistory) {
            undoStack.current.push(edit);
            redoStack.current = []; // una edición nueva invalida los redo
          }
          toast.success(
            edit.kind === 'text' ? 'Texto actualizado' : 'Imagen reemplazada',
          );
          return true;
        } else if (data.replacements === 0) {
          toast.error('No se encontró el contenido en el código. Probá editarlo desde el chat.');
        }
      } catch {
        toast.error('No se pudo aplicar el cambio');
      }
      return false;
    },
    [apiBase, id],
  );

  /** Ctrl+Z: revierte la última edición visual (texto, imagen o estilo). */
  const performUndo = useCallback(async () => {
    const last = undoStack.current.pop();
    if (!last) {
      toast.info('Nada que deshacer');
      return;
    }
    const inv = invertEdit(last);
    const ok =
      inv.kind === 'style'
        ? !!(await applyStyleEditRef.current?.(inv))
        : await applyVisualEdit(inv, { skipHistory: true });
    if (ok) redoStack.current.push(last);
    else undoStack.current.push(last); // falló: lo devolvemos a la pila
  }, [applyVisualEdit]);

  /** Ctrl+Shift+Z / Ctrl+Y: re-aplica la última edición deshecha. */
  const performRedo = useCallback(async () => {
    const last = redoStack.current.pop();
    if (!last) return;
    const ok =
      last.kind === 'style'
        ? !!(await applyStyleEditRef.current?.(last))
        : await applyVisualEdit(last, { skipHistory: true });
    if (ok) undoStack.current.push(last);
    else redoStack.current.push(last);
  }, [applyVisualEdit]);

  /**
   * Encola un override de estilo para escribirlo en el CÓDIGO del proyecto
   * (src/plia-overrides.css vía backend). Agrupa por breakpoint+ruta DOM y
   * debouncea para no disparar una petición por cada tecla/pixel arrastrado.
   */
  const queueStyleToCode = useCallback(
    (path: string, style: Record<string, string>, bp: string) => {
      const p = pendingStyleRef.current;
      const key = bp + '|' + path;
      const e = p[key] || (p[key] = { bp, path, style: {} });
      Object.assign(e.style, style);
      if (styleFlushTimer.current) clearTimeout(styleFlushTimer.current);
      styleFlushTimer.current = setTimeout(async () => {
        const batch = pendingStyleRef.current;
        pendingStyleRef.current = {};
        const token = localStorage.getItem('access_token');
        if (!token) return;
        for (const k of Object.keys(batch)) {
          const { bp: bpk, path: pth, style: st } = batch[k];
          try {
            await fetch(`${apiBase}/experimental/iachat/${id}/style-override`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ path: pth, style: st, breakpoint: bpk }),
            });
          } catch {
            /* sin red: el cambio sigue vivo en pantalla y en localStorage */
          }
        }
      }, 600);
    },
    [apiBase, id],
  );

  /**
   * Aplica props de estilo a un elemento POR SU RUTA DOM: en vivo en el iframe
   * (PLIA_SET_STYLE_AT), en localStorage (cache), en el código (debounced) y en
   * el panel si es el seleccionado. "" en una prop = quitar el override.
   */
  const applyStyleToPath = useCallback(
    (path: string, style: Record<string, string>, bp: string) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PLIA_SET_STYLE_AT', path, style, bp },
        '*',
      );
      const map = padOverridesRef.current; // { bp: { path: {prop} } }
      const bpMap = map[bp] || (map[bp] = {});
      const cur = { ...(bpMap[path] || {}) };
      for (const k of Object.keys(style)) {
        if (style[k] === '') delete cur[k];
        else cur[k] = style[k];
      }
      if (Object.keys(cur).length) bpMap[path] = cur;
      else delete bpMap[path];
      if (!Object.keys(bpMap).length) delete map[bp];
      try {
        localStorage.setItem(`pliaPadOverrides:${id}`, JSON.stringify(map));
      } catch {
        /* cuota llena: el cambio sigue vivo en pantalla */
      }
      queueStyleToCode(path, style, bp);
      setSelectedEl((prev: any) =>
        prev && prev.path === path
          ? { ...prev, styles: { ...(prev.styles || {}), ...style } }
          : prev,
      );
    },
    [id, queueStyleToCode],
  );

  /** Valores actuales (override) de esas props en ese breakpoint; "" si no hay. */
  const styleBefore = useCallback(
    (path: string, props: Record<string, string>, bp: string): Record<string, string> => {
      const cur = padOverridesRef.current[bp]?.[path] || {};
      const before: Record<string, string> = {};
      for (const k of Object.keys(props)) before[k] = cur[k] ?? '';
      return before;
    },
    [],
  );

  /** Registra una edición de estilo en el historial, coalesciendo ráfagas
   *  sobre el mismo elemento+breakpoint (teclear/arrastrar) en un paso. */
  const recordStyleEdit = useCallback(
    (path: string, bp: string, before: Record<string, string>, after: Record<string, string>) => {
      const now = Date.now();
      const top = undoStack.current[undoStack.current.length - 1];
      const last = lastStyleEditRef.current;
      if (
        top && top.kind === 'style' && top.path === path && top.bp === bp &&
        last && now - last.t < 1200
      ) {
        for (const k of Object.keys(before)) if (!(k in top.before)) top.before[k] = before[k];
        Object.assign(top.after, after);
      } else {
        undoStack.current.push({ kind: 'style', path, bp, before: { ...before }, after: { ...after } });
        redoStack.current = [];
      }
      lastStyleEditRef.current = { path, t: now };
    },
    [],
  );

  // Undo/redo de estilos: aplica SIN registrar. Se expone por ref a
  // performUndo/Redo (que están definidos más arriba) para evitar TDZ.
  const applyStyleEdit = useCallback(
    async (edit: StyleEdit): Promise<boolean> => {
      applyStyleToPath(edit.path, edit.after, edit.bp);
      return true;
    },
    [applyStyleToPath],
  );
  applyStyleEditRef.current = applyStyleEdit;

  /**
   * Inspector lateral: aplica una prop al elemento seleccionado en el
   * breakpoint actual (en vivo + persistencia) y la registra (Ctrl+Z).
   */
  const applyElementStyle = useCallback(
    (style: Record<string, string>) => {
      const path = selectedEl?.path;
      if (!path) return;
      const bp = viewport;
      const before = styleBefore(path, style, bp);
      applyStyleToPath(path, style, bp);
      recordStyleEdit(path, bp, before, style);
    },
    [selectedEl, viewport, styleBefore, applyStyleToPath, recordStyleEdit],
  );

  // Selección por ruta DOM (breadcrumb "subir al padre" / panel de capas):
  // se la pedimos al bridge, que selecciona y nos reporta el elemento.
  const selectElementByPath = useCallback((path: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'PLIA_SELECT_PATH', path }, '*');
  }, []);
  const requestLayerTree = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'PLIA_REQUEST_TREE' }, '*');
  }, []);
  // Al abrir el panel de capas (o reseleccionar), pedir el árbol fresco.
  useEffect(() => {
    if (showLayers) requestLayerTree();
  }, [showLayers, previewNonce, selectedEl?.path, requestLayerTree]);

  // Atajos de teclado del editor (fuera de inputs/textarea).
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      } else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) {
        e.preventDefault();
        performRedo();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [performUndo, performRedo]);

  // Comunicar el modo de selección al iframe cuando cambia editMode.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLIA_SET_TOOL', tool: editMode ? 'select' : 'none' },
      '*',
    );
    if (!editMode) setSelectedEl(null);
  }, [editMode, previewUrl, previewNonce]);

  // Comunicar el modo lienzo al bridge: con lienzo activo, la rueda sobre
  // el sitio se reenvía al canvas (zoom/pan) en vez de scrollear/zoomear
  // dentro del iframe. Reintento corto porque el iframe puede no haber
  // terminado de cargar cuando corre este effect.
  useEffect(() => {
    const on = canvasMode && rightPaneMode !== 'code';
    // `vh` = altura del dispositivo: el bridge capa min-h-screen/h-screen a este
    // valor en modo lienzo, así el hero mide UN viewport (no toda la web).
    const vh = artboardDims().h;
    const send = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PLIA_SET_CANVAS_MODE', on, vh },
        '*',
      );
    send();
    const t1 = setTimeout(send, 800);
    const t2 = setTimeout(send, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [canvasMode, rightPaneMode, previewUrl, previewNonce, previewStatus, artboardDims]);

  // Cargar overrides guardados de este proyecto (localStorage). Migra el
  // formato viejo (plano por ruta) al nuevo anidado por breakpoint.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`pliaPadOverrides:${id}`);
      const parsed = raw ? JSON.parse(raw) : {};
      const hasBp = ['desktop', 'tablet', 'mobile'].some((k) => k in parsed);
      padOverridesRef.current = hasBp
        ? parsed
        : Object.keys(parsed).length
          ? { desktop: parsed }
          : {};
    } catch {
      padOverridesRef.current = {};
    }
  }, [id]);

  // Informar al bridge el breakpoint actual (= dispositivo) para que las
  // ediciones de estilo se guarden en ese bucket (desktop/tablet/mobile).
  useEffect(() => {
    const post = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PLIA_SET_BREAKPOINT', bp: viewport },
        '*',
      );
    post();
    const t1 = setTimeout(post, 900);
    return () => clearTimeout(t1);
  }, [viewport, previewUrl, previewNonce, previewStatus]);

  // Informar al bridge el zoom del lienzo → contra-escala los marcadores de
  // padding para que mantengan tamaño visual constante (como Kittl/Framer).
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLIA_SET_ZOOM', zoom: canvasZoom || 1 },
      '*',
    );
  }, [canvasZoom]);

  // Re-aplicar los overrides de padding cada vez que (re)carga el preview.
  // El bridge reintenta internamente porque React monta el árbol async.
  useEffect(() => {
    const post = () => {
      const w = iframeRef.current?.contentWindow;
      if (!w) return;
      w.postMessage(
        { type: 'PLIA_APPLY_OVERRIDES', overrides: padOverridesRef.current },
        '*',
      );
      w.postMessage(
        { type: 'PLIA_SET_ZOOM', zoom: canvasTransformRef.current.zoom || 1 },
        '*',
      );
    };
    post();
    const t1 = setTimeout(post, 900);
    const t2 = setTimeout(post, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [previewUrl, previewNonce, previewStatus, id]);

  // Cuando el servidor pasa a 'running' (recien listo), recargamos el iframe
  // UNA vez. Sin esto, si el iframe cargo la URL antes de que Vite estuviera
  // sirviendo (deps instalando), se quedaba en pagina rota para siempre.
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (previewStatus === 'running' && !!previewUrl && prev !== 'running') {
      setPreviewNonce((n) => n + 1);
    }
    prevStatusRef.current = previewStatus;
  }, [previewStatus, previewUrl]);

  // Auto-captura ~6s despues de que el preview esta corriendo (da tiempo a
  // que cargue fuentes/imagenes) y tras cada cambio de archivos (edicion).
  useEffect(() => {
    if (previewStatus !== 'running' || !previewUrl) return;
    const t = setTimeout(captureThumbnail, 6000);
    return () => clearTimeout(t);
  }, [previewStatus, previewUrl, pages, captureThumbnail]);

  // Mantiene la ultima version de los archivos accesible dentro de los intervals.
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Arranca el servidor real la primera vez que hay archivos; luego solo sincroniza (HMR de Vite).
  useEffect(() => {
    if (Object.keys(pages).length === 0) return;
    if (!previewStartedRef.current) {
      startPreview(pages);
    } else {
      syncPreview(pages);
    }
  }, [pages, id, apiBase]);

  // Watchdog resiliente: mientras haya archivos, vigila el estado real del
  // preview. Si esta arrancando/instalando sondea rapido; si ya corre sigue
  // vigilando lento para detectar caidas (reinicio de backend) y relevantar.
  useEffect(() => {
    if (Object.keys(pages).length === 0) return;
    const running = previewStatus === 'running' && !!previewUrl;
    const iv = setInterval(pollStatus, running ? 6000 : 1800);
    return () => clearInterval(iv);
  }, [previewStatus, previewUrl, apiBase, id, pages]);

  const extractPages = (content: string) => {
    if (!content || typeof content !== 'string') return false;
    const filesMatch = content.match(/\[FILES\]([\s\S]*?)\[\/FILES\]/);
    if (filesMatch) {
      try {
        const newFiles = JSON.parse(filesMatch[1]);
        if (Object.keys(newFiles).length > 0) {
          setPages(prev => ({ ...prev, ...newFiles }));
          if (currentPath === '/' && !newFiles['/']) {
            if (newFiles['/AppMain.tsx']) setCurrentPath('/AppMain.tsx');
            else setCurrentPath(Object.keys(newFiles)[0]);
          }
          setHasSelectedOption(true);
          setRuntimeError(null);
          return true;
        }
      } catch (e) {
        console.error("Error parsing [FILES] block", e);
      }
    }
    const tsxMatch = content.match(/```(?:tsx|jsx|javascript|js)([\s\S]*?)```/i);
    if (tsxMatch) {
      const code = tsxMatch[1].trim();
      setPages(prev => ({ ...prev, '/': code }));
      setHasSelectedOption(true);
      setRuntimeError(null);
      return true;
    }
    return false;
  };

  const fetchChatData = async (token: string) => {
    try {
      const res = await fetch(`${apiBase}/experimental/iachat/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo cargar el chat');
      const data = await res.json();
      setChatInfo(data);
      setMessages(data.messages);

      // Generacion inicial en curso: hay mensaje del usuario pero aun no
      // llega la respuesta del asistente con el codigo -> modo "pensando".
      const hasAssistant =
        Array.isArray(data.messages) &&
        data.messages.some(
          (m: any) =>
            m.role === 'assistant' &&
            /\[FILES\]|\[RESPONSE\]/.test(m.content || ''),
        );
      if (
        !hasAssistant &&
        Array.isArray(data.messages) &&
        data.messages.length > 0
      ) {
        awaitingGenRef.current = true;
        setIsLoading(true);
      } else if (hasAssistant) {
        awaitingGenRef.current = false;
        setIsLoading(false);
      }
      
      const allPages: Record<string, string> = {};
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach((m: any) => {
          const fm = m.content.match(/\[FILES\]([\s\S]*?)\[\/FILES\]/);
          if (fm) {
            try {
              const files = JSON.parse(fm[1]);
              Object.assign(allPages, files);
            } catch (e) {}
          }
          if (Object.keys(allPages).length === 0) {
            const tm = m.content.match(/```(?:tsx|jsx|javascript|js)([\s\S]*?)```/i);
            if (tm) allPages['/'] = tm[1].trim();
          }
        });
        setPages(allPages);
        if (Object.keys(allPages).length > 0) {
          setHasSelectedOption(true);
          if (currentPath === '/' && !allPages['/']) {
            if (allPages['/AppMain.tsx']) setCurrentPath('/AppMain.tsx');
            else setCurrentPath(Object.keys(allPages)[0]);
          }
        }
      }
      if (data.aiRules) setAiRules(data.aiRules);
      if (data.chatMode) setChatMode(data.chatMode);

      // ── Decisión: ¿mostrar OnboardingChat o ir directo al canvas? ──
      // FALLBACK del onboarding. El flujo NORMAL hace que el cliente
      // pase por el onboarding ANTES de crear el chat (en la landing
      // /experimental/iachatweb). Cuando llega aquí, ya hay mensajes y este
      // bloque NO se dispara. Pero si por algún side-channel (admin SQL,
      // retry post-error) llegamos a /project/[id] sin mensajes, mostramos
      // el onboarding como red de seguridad para que el usuario no se
      // quede mirando un canvas en blanco.
      if (!onboardingCheckedRef.current) {
        onboardingCheckedRef.current = true;
        const hasMessages = Array.isArray(data.messages) && data.messages.length > 0;
        const hasGeneratedFiles = Object.keys(allPages).length > 0;
        if (!hasMessages && !hasGeneratedFiles) {
          try {
            const token = localStorage.getItem('access_token');
            if (token) {
              const capsRes = await fetch(`${apiBase}/experimental/studio-plans/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (capsRes.ok) {
                const caps = await capsRes.json();
                setStudioCaps(caps);
              }
            }
          } catch {/* el onboarding funciona aunque caps falle */}
          setShowOnboarding(true);
        }
      }
    } catch (e) { console.error("Error fetching chat data", e); }
  };

  const saveAiRules = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      await fetch(`${apiBase}/experimental/iachat/${id}/ai-rules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aiRules, chatMode }),
      });
      setAiRulesSaved(true);
      setTimeout(() => setAiRulesSaved(false), 2000);
    } catch (e) { console.error('Error saving AI_RULES', e); }
  };

  const fetchCreditsChip = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/experimental/iachat/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCreditsChip(await res.json());
    } catch (e) {
      /* no critico */
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/experimental/iachatweb/login'); return; }
    setAuthChecked(true);
    if (apiBase !== '/api' || window.location.hostname !== 'localhost') {
      fetchChatData(token);
      fetchCreditsChip();
    }
  }, [id, apiBase]);

  // Polling mientras la IA construye el proyecto inicial en segundo plano.
  useEffect(() => {
    if (!awaitingGenRef.current) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const iv = setInterval(() => fetchChatData(token), 3000);
    return () => clearInterval(iv);
  }, [isLoading, messages, id, apiBase]);

  // Tareas animadas estilo Claudable durante la espera de la generacion.
  useEffect(() => {
    if (!isLoading || !awaitingGenRef.current) return;
    const steps = [
      'Analizando el negocio y la audiencia',
      'Definiendo el sistema visual (paleta y tipografia)',
      'Diseñando la arquitectura de componentes',
      'Generando los componentes con IA',
      'Ensamblando y puliendo la aplicacion',
    ];
    let i = 0;
    setAgentState('planning');
    setCompletedTasks([]);
    setCurrentTask(steps[0]);
    const iv = setInterval(() => {
      setCompletedTasks((prev) =>
        prev.includes(steps[i]) ? prev : [...prev, steps[i]],
      );
      i = Math.min(i + 1, steps.length - 1);
      setCurrentTask(steps[i]);
      setAgentState(i >= 3 ? 'working' : 'coding');
    }, 4500);
    return () => clearInterval(iv);
  }, [isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachedImages(prev => {
              if (prev.includes(base64)) return prev;
              return [...prev, base64];
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachedImages(prev => {
              if (prev.includes(base64)) return prev;
              return [...prev, base64];
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, []);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: any) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 800) setSidebarWidth(newWidth);
      else if (newWidth <= 200) { setIsSidebarOpen(false); setIsResizing(false); }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setAttachedImages(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  /**
   * Cuando el cliente termina el OnboardingChat, convertimos sus respuestas
   * en un prompt rico para la IA y disparamos la primera generación.
   * El prompt incluye el contexto de complejidad para que el AI Router del
   * backend pueda decidir qué stack de APIs usar (Claude solo vs Claude+3D
   * vs full stack con Higsfield, etc.).
   */
  const handleOnboardingComplete = async (a: OnboardingAnswers) => {
    const typeLabels: Record<string, string> = {
      landing: 'una landing de servicio',
      tienda: 'una tienda online',
      restaurante: 'una web para restaurante/cafetería',
      portfolio: 'un portfolio personal',
      corporativa: 'una web corporativa',
      otro: 'una web',
    };
    const styleLabels: Record<string, string> = {
      simple: 'estilo simple, directo y limpio. Sin efectos pesados.',
      modern: 'estilo moderno con microinteracciones y animaciones suaves.',
      clean:
        'estilo Apple/Stripe: tipografía cuidada, espacios amplios, animaciones sutiles muy pulidas.',
      premium:
        'estilo PREMIUM con elementos 3D, video hero cinematográfico y scroll-triggered animations nivel agencia top.',
    };
    const assetHint = a.hasOwnAssets
      ? 'El cliente va a subir sus propias fotos en el siguiente turno.'
      : 'No tiene fotos propias — generá imágenes profesionales con IA que encajen con el rubro.';

    const promptParts = [
      `Quiero ${typeLabels[a.projectType] || 'una web'} para mi negocio.`,
      `Nombre del negocio: ${a.businessName}`,
      `Descripción: ${a.description}`,
      ``,
      `Estilo visual: ${styleLabels[a.complexity]}`,
      assetHint,
      ``,
      `[META]${JSON.stringify({
        projectType: a.projectType,
        businessName: a.businessName,
        complexity: a.complexity,
        hasOwnAssets: a.hasOwnAssets,
      })}[/META]`,
    ];
    const prompt = promptParts.join('\n');

    // Cerramos el onboarding y disparamos la generación (handleSend ya
    // mostrará el estado "Generando..." en el canvas).
    setShowOnboarding(false);
    await handleSend(prompt);
  };

  /**
   * Llamado cuando el cliente confirma usar un template 3D en el dialog.
   * Guardamos el HTML resultante como pagina del proyecto via un mensaje
   * de chat que instruye al motor a NO regenerar y simplemente persistir
   * el HTML tal cual. Usamos un prompt especial con marcador [TEMPLATE_3D]
   * que el backend reconoce (o sino, lo metemos como mensaje del usuario
   * que dice "aplica este HTML como pagina 'showcase.html' del proyecto"
   * y dejamos que Claude lo procese).
   *
   * Implementacion simple para v1: enviamos el HTML al chat como un mensaje
   * que solicita la insercion textual. Backend mejorado (siguiente sprint)
   * detectara [TEMPLATE_3D] y hara un write directo al filesystem del
   * proyecto sin pasar por Claude — ahorra tokens.
   */
  const handleUseTemplate3D = async (slug: string, templateInput: any, html: string) => {
    const message = [
      `[TEMPLATE_3D]${slug}[/TEMPLATE_3D]`,
      `Quiero que agregues esta pagina 3D ya generada al proyecto como "showcase.html" (o si ya existe, reemplazala). NO regeneres el HTML — usalo TAL CUAL como te lo doy. Solo crea/actualiza el archivo.`,
      '',
      '=== HTML COMPLETO DEL TEMPLATE ===',
      html,
      '=== FIN HTML ===',
      '',
      `Meta del template (para referencia, no tocar):`,
      '```json',
      JSON.stringify({ templateSlug: slug, input: templateInput }, null, 2),
      '```',
    ].join('\n');
    setShowTemplates3D(false);
    await handleSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (msg?: string) => {
    const textToSend = msg || input;
    if (!textToSend.trim() || isLoading) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const imagesToSend = [...attachedImages];
    setMessages(prev => [...prev, { role: 'user', content: textToSend, images: imagesToSend }]);
    if (!msg) setInput('');
    setAttachedImages([]);
    setIsLoading(true);
    setRuntimeError(null);
    setAgentState("planning");

    try {
      const res = await fetch(`${apiBase}/experimental/iachat/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: textToSend, chatMode, images: imagesToSend })
      });
      if (res.status === 403) {
        const errBody = await res.json().catch(() => ({}));
        setUpsellReason(
          errBody?.message ||
            'Alcanzaste el límite de créditos de tu plan.',
        );
        setUpsellOpen(true);
        setAgentState('idle');
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Servidor offline');
      const data = await res.json();
      fetchCreditsChip();
      const metaMatch = data.content.match(/\[META\]([\s\S]*?)\[\/META\]/);
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1]);
          const steps = meta.steps || [];
          setAgentState("coding");
          for (const step of steps) {
            setCurrentTask(step);
            await new Promise(r => setTimeout(r, 800));
            setCompletedTasks(prev => [...prev, step]);
          }
          setAgentState("rendering");
          setCurrentTask("Finalizando código y estilos...");
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {}
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Error' }]);
      extractPages(data.content);
      setAgentState("done");
      setCurrentTask("");
      setCompletedTasks([]);
    } catch (err: any) {
      toast.error('Error', { description: err.message });
      setAgentState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (Object.keys(pages).length === 0 || isLoading) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);
    setAgentState("working");
    setCurrentTask("Preparando archivos para despliegue...");

    try {
      const res = await fetch(`${apiBase}/experimental/iachat/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files: pages })
      });
      if (!res.ok) throw new Error('Error al publicar');
      const data = await res.json();
      toast.success('¡Proyecto Publicado!', {
        description: `Tu web está lista en: ${data.previewUrl}`,
      });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setIsLoading(false);
      setAgentState("idle");
      setCurrentTask("");
    }
  };

  if (!authChecked) return null;

  return (
    <div className="flex h-screen bg-[#f8f9fb] text-slate-900 overflow-hidden relative">
      {/* Dyad-style living background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-lime-500 blur-[120px] rounded-full"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500 blur-[120px] rounded-full"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 z-30 shadow-sm relative">
          <div className="flex items-center gap-4">
             <button onClick={() => router.push('/experimental/iachatweb')} className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></button>
             <div className="flex items-center gap-2">
                <img src="/plia-logo-white.svg" alt="PLIA" className="h-6 w-auto brightness-0" />
                <span className="font-black text-base">Studio</span>
             </div>
             {creditsChip && (
               <div className="flex items-center gap-1.5">
                 <div
                   title={`Plan ${creditsChip.planLabel} · ${creditsChip.monthlyUsed}/${creditsChip.monthlyLimit} créditos este mes`}
                   className="flex items-center gap-2 bg-slate-100 rounded-full pl-3 pr-1.5 py-1"
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                     {creditsChip.planLabel}
                   </span>
                   <span className="text-[11px] font-black text-indigo-600 bg-white rounded-full px-2 py-0.5">
                     {creditsChip.dailyUsed}/{creditsChip.totalLimit} hoy
                   </span>
                 </div>
                 <button
                   onClick={() => { setUpsellReason(undefined); setUpsellOpen(true); }}
                   className="flex items-center gap-1 bg-lime-400 hover:bg-lime-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 transition-all shadow-[0_0_12px_rgba(163,230,53,0.5)]"
                 >
                   <Zap className="h-3 w-3 fill-black" />
                   {creditsChip.plan === 'AGENCIA' ? 'Tu plan' : 'Mejorar'}
                 </button>
               </div>
             )}
          </div>

          {previewUrl && (() => {
            // Las rutas reales del proyecto vienen del src/App.tsx generado
            // por la IA, que tiene <Route path="/..." element={...} />. Las
            // extraemos con regex. Como fallback, derivamos de los archivos
            // en src/pages/*.tsx (Index -> /, About -> /about, etc.).
            const findApp = () => {
              const candidates = ['src/App.tsx', '/src/App.tsx', 'App.tsx', '/App.tsx'];
              for (const c of candidates) if (pages[c]) return pages[c];
              return '';
            };
            const appTsx = findApp();
            let declared: string[] = [];
            if (appTsx) {
              const matches = Array.from(
                appTsx.matchAll(/<Route\s+[^>]*path=["']([^"']+)["']/g),
              );
              declared = matches
                .map((m) => m[1])
                .filter((r) => r && r !== '*' && !r.includes(':'));
            }
            // Si no encontramos rutas en App.tsx, derivamos de los pages.
            if (declared.length === 0) {
              declared = Object.keys(pages)
                .map((k) => k.replace(/^\/+/, ''))
                .filter((k) => /^src\/pages\/[A-Z][\w-]*\.tsx$/.test(k))
                .map((k) => {
                  const name = k.match(/\/([A-Z][\w-]*)\.tsx$/)?.[1] || '';
                  if (!name || name === 'Index') return '/';
                  if (name === 'NotFound') return '';
                  return '/' + name.charAt(0).toLowerCase() + name.slice(1);
                })
                .filter(Boolean);
            }
            const dedup = Array.from(new Set(declared));
            const routes = dedup.includes('/') ? dedup : ['/', ...dedup];
            const goToRoute = (r: string) => {
              setPreviewRoute(r);
              setNavOpen(false);
              if (iframeRef.current) {
                iframeRef.current.src =
                  previewUrl.replace(/\/$/, '') + (r === '/' ? '/' : r);
              }
            };
            return (
              <div className="absolute left-1/2 -translate-x-1/2 w-[24%] min-w-[220px] max-w-[380px]">
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl h-9 pl-3 pr-1.5 border border-slate-200">
                  <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  <button
                    onClick={() => setNavOpen((v) => !v)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0 px-1 group"
                    title="Ver rutas"
                  >
                    <span className="text-sm font-medium text-slate-600 truncate flex-1">
                      {previewRoute}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-slate-400 transition-transform group-hover:text-slate-600',
                        navOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  <button
                    onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                    title="Abrir en pantalla completa (nueva pestaña)"
                    className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={restartPreview}
                    title="Recargar preview"
                    className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {navOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNavOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-1.5">
                        Rutas de la web
                      </p>
                      {routes.map((r) => (
                        <button
                          key={r}
                          onClick={() => goToRoute(r)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left',
                            previewRoute === r
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50',
                          )}
                        >
                          <span className="truncate">{r}</span>
                          {previewRoute === r && (
                            <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      ))}
                      {routes.length <= 1 && (
                        <p className="text-[10px] text-slate-400 px-3 py-1.5 italic">
                          Web de una sola página (sin rutas internas)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          <div className="flex items-center gap-4">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setIsInspectMode(!isInspectMode)}
               className={cn("rounded-full gap-2 font-bold px-4", isInspectMode ? "bg-lime-500 text-black hover:bg-lime-600" : "text-slate-500 hover:bg-slate-100")}
             >
               <Sparkles className={cn("h-4 w-4", isInspectMode ? "fill-black" : "")} />
               {isInspectMode ? "INSPECCIONAR: ON" : "INSPECCIONAR"}
             </Button>
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setRightPaneMode('preview')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider',
                    rightPaneMode === 'preview'
                      ? 'bg-white shadow-sm text-lime-500'
                      : 'text-slate-400',
                  )}
                >
                  Preview
                </button>
                <button
                  onClick={() => setRightPaneMode('code')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider',
                    rightPaneMode === 'code'
                      ? 'bg-white shadow-sm text-indigo-500'
                      : 'text-slate-400',
                  )}
                >
                  Code
                </button>
             </div>
             {rightPaneMode === 'preview' && (
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[{ id: 'desktop', icon: Monitor }, { id: 'tablet', icon: Tablet }, { id: 'mobile', icon: Smartphone }].map(v => (
                  <button key={v.id} onClick={() => setViewport(v.id as any)} className={cn("p-1.5 rounded-lg", viewport === v.id ? "bg-white shadow-sm text-lime-500" : "text-slate-400")}><v.icon className="h-4 w-4" /></button>
                ))}
             </div>
             )}
             <Button 
               variant="ghost"
               size="icon"
               onClick={restartPreview}
               className="rounded-xl text-slate-500 hover:bg-slate-100"
             >
               <RotateCcw className="h-4 w-4" />
             </Button>
             <Button 
               onClick={handlePublish}
               disabled={isLoading || Object.keys(pages).length === 0}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full px-6 h-9"
             >
                {isLoading && agentState === 'working' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                PUBLICAR
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn("rounded-xl text-slate-500", !isSidebarOpen && "bg-slate-100 text-indigo-500")}
              >
                <Sidebar className="h-5 w-5" />
              </Button>

              <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setShowAiRules(!showAiRules)}
               className={cn("rounded-xl", showAiRules ? "bg-slate-100 text-indigo-500" : "text-slate-500")}
             >
               <BookOpen className="h-5 w-5" />
             </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ x: -sidebarWidth, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -sidebarWidth, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ width: sidebarWidth }}
                className="border-r flex flex-col bg-white z-20 relative h-full shadow-xl"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center border-4 border-dashed border-indigo-500 m-4 rounded-[2.5rem] pointer-events-none shadow-2xl"
                    >
                      <motion.div 
                        className="bg-indigo-600 p-8 rounded-full mb-6 shadow-lg shadow-indigo-500/40"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Paperclip className="h-12 w-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">¡Suelta para adjuntar!</h3>
                      <p className="text-sm text-slate-500 font-bold max-w-[240px] leading-relaxed">
                        Tus archivos se subirán instantáneamente al contexto de la IA
                      </p>
                      
                      <div className="mt-10 relative h-40 w-40">
                         <div className="absolute inset-0 bg-slate-100 rounded-3xl rotate-12 shadow-sm border border-slate-200 opacity-50" />
                         <div className="absolute inset-0 bg-slate-200 rounded-3xl -rotate-6 shadow-sm border border-slate-200 opacity-50" />
                         <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center p-4 overflow-hidden">
                             <ImageIcon className="h-12 w-12 text-indigo-500" />
                         </div>
                          <motion.div 
                            className="absolute -bottom-4 -right-4 bg-indigo-600 text-white p-3 rounded-2xl shadow-2xl z-10"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Plus className="h-6 w-6 stroke-[3]" />
                         </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
                  {messages.map((m, i) => {
                    const metaMatch = m.content.match(/\[META\]([\s\S]*?)\[\/META\]/);
                    const meta = metaMatch ? JSON.parse(metaMatch[1]) : null;
                    const filesMatch = m.content.match(/\[FILES\]([\s\S]*?)\[\/FILES\]/);
                    const messageFiles = filesMatch ? JSON.parse(filesMatch[1]) : {};
                    const responseText = m.content.match(/\[RESPONSE\]([\s\S]*?)\[\/RESPONSE\]/)?.[1] || m.content.split('[FILES]')[0].split('[META]')[0].trim();

                    return (
                      <div key={i} className="space-y-4">
                        {m.role === 'assistant' && (
                          <div className="mr-8 space-y-2">
                        {meta?.thinking && (
                          <ThinkingSection content={meta.thinking} isExpanded={true} />
                        )}

                        {Object.keys(messageFiles).length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl p-2 space-y-1 shadow-sm">
                             <div className="flex items-center gap-1.5 mb-2 px-2 pt-1">
                                <Hammer className="h-3 w-3 text-slate-400" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ejecución de Tareas</span>
                             </div>
                             {Object.keys(messageFiles).map((path) => (
                               <ToolResultItem 
                                 key={path}
                                 action={i > 2 ? 'Edited' : 'Created'} 
                                 filePath={path}
                                />
                             ))}
                          </div>
                        )}
                      </div>
                    )}

                      <div className="space-y-2">
                        {m.role === 'user' && (
                          <div className="text-center text-[10px] text-slate-400 font-medium mb-1">
                            {formatDate(m.createdAt || new Date())}
                          </div>
                        )}
                      <div className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          m.role === 'user' 
                            ? "max-w-[85%] rounded-2xl p-4 shadow-sm bg-slate-900 text-white" 
                            : "w-full space-y-4"
                        )}>
                          <div className={cn(
                            "prose prose-sm prose-slate max-w-none dark:prose-invert",
                            m.role === 'assistant' && "text-slate-700"
                          )}>
                             <ReactMarkdown>{responseText}</ReactMarkdown>
                          </div>
                        {m.images && m.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {m.images.map((img: string, idx: number) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="Attachment" 
                                className="max-w-[200px] max-h-[200px] rounded-lg border border-slate-200 shadow-sm" 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              
              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
                    <ThinkingEngine
                      state={mapToThinkingState(agentState)}
                      completedTasks={completedTasks}
                      currentTask={currentTask}
                    />
                  </div>
                    <div ref={messagesEndRef} />
                </div>
              )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t bg-slate-50/50 relative">
                  {attachedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 px-1">
                      {attachedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} className="h-16 w-16 object-cover rounded-xl border-2 border-white shadow-sm transition-transform group-hover:scale-105" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-16 w-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all bg-white"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe lo que quieres construir..."
                        className="w-full p-4 pr-12 bg-transparent text-sm resize-none focus:outline-none min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 px-3 bg-slate-50/50 border-t">
                      <div className="flex items-center gap-1.5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload-chat"
                        />
                        <label
                          htmlFor="file-upload-chat"
                          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer text-slate-500"
                        >
                          <Paperclip className="h-4 w-4" />
                        </label>

                        {/* Boton Templates 3D — solo lo mostramos si el plan
                            del usuario incluye templates 3D (Pro/Studio). Para
                            usuarios Free, mostramos un boton "candado" que
                            abre el dialog igual pero las cards aparecen
                            bloqueadas — sirve como discovery/upsell. */}
                        <button
                          type="button"
                          onClick={() => setShowTemplates3D(true)}
                          title={studioCaps?.editor?.canUse3DTemplates
                            ? 'Templates 3D Premium'
                            : 'Templates 3D (requiere plan Pro)'}
                          className="h-9 px-3 flex items-center gap-1.5 rounded-xl hover:bg-slate-200/50 transition-colors text-slate-600 text-xs font-semibold"
                        >
                          <Layout className="h-3.5 w-3.5 text-orange-500" />
                          <span className="hidden sm:inline">Templates 3D</span>
                        </button>

                        {/* Botón Estudio Creativo: generar imágenes/video con IA */}
                        <button
                          type="button"
                          onClick={() => setShowCreative(true)}
                          title="Estudio Creativo — generar imágenes y video con IA"
                          className="h-9 px-3 flex items-center gap-1.5 rounded-xl hover:bg-slate-200/50 transition-colors text-slate-600 text-xs font-semibold"
                        >
                          <Wand2 className="h-3.5 w-3.5 text-violet-500" />
                          <span className="hidden sm:inline">Estudio</span>
                        </button>

                        {/* Botón Workflow: canvas de nodos creativos */}
                        <button
                          type="button"
                          onClick={() => setShowNodeCanvas(true)}
                          title="Workflow Creativo — nodos imagen→video"
                          className="h-9 px-3 flex items-center gap-1.5 rounded-xl hover:bg-slate-200/50 transition-colors text-slate-600 text-xs font-semibold"
                        >
                          <Workflow className="h-3.5 w-3.5 text-fuchsia-500" />
                          <span className="hidden sm:inline">Workflow</span>
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 px-3 text-xs font-semibold text-slate-600 gap-2 hover:bg-slate-200/50 rounded-xl">
                              <Zap className="h-3.5 w-3.5 text-indigo-600" />
                              {chatMode.charAt(0).toUpperCase() + chatMode.slice(1)}
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 p-1">
                            <DropdownMenuItem onClick={() => setChatMode('build')} className="gap-2">
                              <Zap className="h-4 w-4 text-indigo-600" />
                              <span>Build</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setChatMode('ask')} className="gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span>Ask</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setChatMode('plan')} className="gap-2">
                              <FileText className="h-4 w-4 text-orange-600" />
                              <span>Plan</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2">
                         <Button 
                           onClick={() => handleSend()} 
                           disabled={isLoading || !input.trim()}
                           size="icon"
                           className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                         >
                           {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resize Handle */}
                <div onMouseDown={startResizing} className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-indigo-500/20 cursor-col-resize z-30 transition-all" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Preview Area */}
          <div
            className="flex-1 bg-slate-100 flex flex-col items-center p-8 overflow-hidden relative"
            onDragEnter={(e) => {
              if (Array.from(e.dataTransfer.types).includes('Files')) {
                e.preventDefault();
                setFileDragActive(true);
              }
            }}
            onDragOver={(e) => {
              if (Array.from(e.dataTransfer.types).includes('Files')) e.preventDefault();
            }}
            onDragLeave={(e) => {
              // Solo desactivar si salimos del contenedor (no de un hijo).
              if (e.currentTarget === e.target) setFileDragActive(false);
            }}
            onDrop={(e) => {
              if (Array.from(e.dataTransfer.types).includes('Files')) {
                e.preventDefault();
                setFileDragActive(false);
                handleExternalFiles(e.dataTransfer.files, {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  rect: e.currentTarget.getBoundingClientRect(),
                });
              }
            }}
          >
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="absolute top-4 left-4 z-40 bg-white border border-slate-200 p-2 rounded-xl shadow-md hover:bg-slate-50 transition-all group"
              >
                <Sidebar className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
              </button>
            )}
            {/* CÓDIGO: el FileExplorer ocupa todo el panel, sin canvas. */}
            {rightPaneMode === 'code' ? (
              <div className="bg-white shadow-2xl rounded-3xl overflow-hidden flex-1 w-full relative">
                <FileExplorer
                  files={pages}
                  onAskAiAboutFile={(path) => {
                    setRightPaneMode('preview');
                    const tag = `Edita el archivo \`${path}\`: `;
                    setInput((prev) => (prev ? `${tag}${prev}` : tag));
                  }}
                />
              </div>
            ) : previewUrl && canvasMode ? (
              /* PREVIEW + LIENZO INFINITO (zoom/pan estilo Framer). El artboard
                 es un device frame de tamaño fijo según el viewport; el canvas
                 lo escala y mueve. */
              (() => {
                const dims =
                  viewport === 'tablet'
                    ? { w: 820, h: 1180 }
                    : viewport === 'mobile'
                      ? { w: 390, h: 844 }
                      : { w: 1440, h: 900 };
                // Web COMPLETA: el artboard se estira a la altura real del
                // documento (la reporta el bridge), no a una ventana fija.
                const fullH = Math.max(dims.h, siteDocHeight);
                return (
                  <CanvasViewport
                    ref={canvasRef}
                    artboardWidth={dims.w}
                    artboardHeight={fullH}
                    onTransformChange={(t) => {
                      canvasTransformRef.current = t;
                      setCanvasZoom((prev) => (prev !== t.zoom ? t.zoom : prev));
                    }}
                    onBackgroundMouseDown={() => setSelectedItemIds([])}
                    onMarquee={(rect, additive) => {
                      // Hit-test: items flotantes cuyo box intersecta el área.
                      // Criterio del producto: NO se seleccionan ni el artboard
                      // del sitio ni sus elementos internos (se editan con click
                      // → edición inline), ni items en plena generación.
                      const hit = canvasItems
                        .filter((it) => !it.converting)
                        .filter((it) => {
                          const l = it.x;
                          const t = it.y;
                          const r = it.x + it.w;
                          const b = it.y + it.w / it.ar;
                          return !(r < rect.x || l > rect.x + rect.w || b < rect.y || t > rect.y + rect.h);
                        })
                        .map((it) => it.id);
                      setSelectedItemIds((prev) =>
                        additive ? Array.from(new Set([...prev, ...hit])) : hit,
                      );
                    }}
                  >
                    <div
                      className="bg-white shadow-2xl rounded-2xl overflow-hidden relative"
                      style={{ width: dims.w, height: fullH }}
                    >
                      <iframe
                        key={`preview-iframe-${id}-${previewNonce}`}
                        ref={iframeRef}
                        src={previewUrl}
                        scrolling="no"
                        className="w-full h-full border-none"
                      />
                    </div>
                    {/* Items flotantes del lienzo unificado (estilo Kittl):
                        imágenes/videos junto al sitio, manipulables. Soltar
                        una imagen sobre una imagen del sitio la reemplaza. */}
                    <CanvasItemsLayer
                      items={canvasItems}
                      onChange={setCanvasItems}
                      selectedIds={selectedItemIds}
                      onSelect={setSelectedItemIds}
                      transformRef={canvasTransformRef}
                      zoom={canvasZoom}
                      iframeRef={iframeRef}
                      apiBase={apiBase}
                      authToken={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}
                      onInsertViaChat={(url, kind) => {
                        handleSend(
                          `Usa este ${kind === 'video' ? 'video' : 'imagen'} en la web: ${url}\n\nInsértalo donde mejor quede (hero, galería, fondo de sección). ${kind === 'video' ? 'Si va en el hero, usalo como <video autoPlay muted loop playsInline> de fondo con overlay.' : ''}`,
                        );
                      }}
                    />
                  </CanvasViewport>
                );
              })()
            ) : (
            <div className={cn("bg-white shadow-2xl rounded-3xl overflow-hidden flex-1 relative transition-all duration-500", viewport === 'desktop' ? "w-full" : viewport === 'tablet' ? "w-[768px]" : "w-[375px]")}>
               {previewUrl ? (
                  <iframe
                    key={`preview-iframe-${id}-${previewNonce}`}
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-none"
                  />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-[#0A0A0A]">
                     <div className="h-20 w-20 bg-[#1A1A1A] border border-white/5 rounded-3xl shadow-2xl flex items-center justify-center animate-pulse">
                        <Sparkles className="h-10 w-10 text-indigo-400" />
                     </div>
                     <div className="max-w-md">
                        <h3 className="text-xl font-black text-white mb-2">Construyendo tu visión estratégica</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                           Iniciando motor de renderizado premium. La IA está orquestando los componentes y la arquitectura de tu aplicación...
                        </p>
                     </div>
                     <div className="flex gap-3">
                        {[1,2,3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                     </div>
                  </div>
               )}

               {runtimeError && (
                  <div className="absolute bottom-20 left-4 right-4 bg-red-600 text-white p-4 rounded-xl flex items-center justify-between shadow-2xl z-50">
                     <div className="text-xs font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {runtimeError}</div>
                     <Button onClick={() => handleSend(`Fix this error: ${runtimeError}`)} className="bg-white text-red-600 text-xs h-7 px-3 rounded-lg font-black">AUTO-FIX</Button>
                  </div>
                )}
                
                {/* Solo mostrar el diagnóstico cuando hay un proceso activo
                    (preview arrancando o IA generando). Si el preview ya está
                    corriendo y no hay tarea en curso, ocultarlo. */}
                {Object.keys(pages).length > 0 &&
                  previewStatus !== 'running' && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-800 shadow-2xl z-50 animate-pulse">
                     <div className="flex items-center gap-2 mb-1">
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Diagnóstico del Motor</span>
                     </div>
                      <div className="flex flex-col gap-1 overflow-y-auto max-h-20 scrollbar-none">
                         {debugLogs.length > 0 ? debugLogs.slice(-2).map((log, i) => (
                           <p key={i} className="text-[9px] text-slate-400 font-medium truncate">
                             {String(log).replace(/?\[\d+(?:;\d+)*m/g, '')}
                           </p>
                         )) : (
                           <p className="text-[9px] text-slate-500 italic">Esperando señal del motor...</p>
                         )}
                      </div>
                  </div>
                )}
            </div>
            )}

            {/* Error de runtime en modo lienzo (el overlay de adentro solo
                cubre el modo sin lienzo). */}
            {runtimeError && canvasMode && previewUrl && rightPaneMode !== 'code' && (
              <div className="absolute bottom-6 left-8 right-8 bg-red-600 text-white p-4 rounded-xl flex items-center justify-between shadow-2xl z-50">
                <div className="text-xs font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {runtimeError}</div>
                <Button onClick={() => handleSend(`Fix this error: ${runtimeError}`)} className="bg-white text-red-600 text-xs h-7 px-3 rounded-lg font-black">AUTO-FIX</Button>
              </div>
            )}

            {/* Toggles: modo lienzo (zoom/pan) + modo edición visual. */}
            {previewUrl && rightPaneMode !== 'code' && (
              <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
                <button
                  onClick={() => setEditMode((v) => !v)}
                  title={editMode ? 'Salir del modo edición' : 'Editar elementos (click para seleccionar)'}
                  className={cn(
                    'px-3 py-2 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all border',
                    editMode
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <MousePointer2 className="h-3.5 w-3.5" />
                  {editMode ? 'Editando' : 'Editar'}
                </button>
                <button
                  onClick={() => setCanvasMode((v) => !v)}
                  title={canvasMode ? 'Salir del lienzo' : 'Modo lienzo (zoom/pan estilo Framer)'}
                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-md hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1.5 transition-all"
                >
                  <Layout className="h-3.5 w-3.5 text-indigo-500" />
                  {canvasMode ? 'Lienzo ON' : 'Lienzo'}
                </button>
                <button
                  onClick={() => {
                    if (!showLayers) setEditMode(true); // para que la selección + inspector funcionen
                    setShowLayers((v) => !v);
                  }}
                  title="Panel de capas (árbol del sitio)"
                  className={cn(
                    'px-3 py-2 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all border',
                    showLayers
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Capas
                </button>
              </div>
            )}

            {showLayers && previewUrl && rightPaneMode !== 'code' && (
              <LayersPanel
                tree={layerTree}
                selectedPath={selectedEl?.path}
                onSelect={selectElementByPath}
                onClose={() => setShowLayers(false)}
                onRefresh={requestLayerTree}
              />
            )}

            {/* (El dock de assets fue reemplazado por los items flotantes
                del lienzo unificado — CanvasItemsLayer dentro del canvas.) */}

            {/* Overlay de drop para imágenes externas (arrastradas del PC). */}
            {fileDragActive && (
              <div className="absolute inset-4 z-[60] rounded-3xl border-4 border-dashed border-violet-400 bg-violet-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-black text-violet-700">Suelta tu imagen aquí</p>
                  <p className="text-sm text-violet-500 font-medium">Se agregará al dock para arrastrarla sobre el sitio</p>
                </div>
              </div>
            )}

            {/* INSPECTOR de elemento seleccionado (Fase B). */}
            {editMode && selectedEl && (
              <div className="absolute top-16 right-4 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                      {selectedEl.isImage ? 'Imagen' : `<${selectedEl.tag}>`}
                    </span>
                  </div>
                  <button onClick={() => setSelectedEl(null)} className="text-slate-300 hover:text-slate-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Breadcrumb de ancestros (#root → … → elemento). Click en un
                    padre lo selecciona — "subir al padre" estilo Framer. */}
                {Array.isArray(selectedEl.ancestors) && selectedEl.ancestors.length > 0 && (
                  <div className="px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/70 flex items-center overflow-x-auto scrollbar-none">
                    {selectedEl.ancestors.map((a: any, i: number) => {
                      const isLast = i === selectedEl.ancestors.length - 1;
                      return (
                        <button
                          key={a.path}
                          onClick={() => !isLast && selectElementByPath(a.path)}
                          disabled={isLast}
                          title={isLast ? 'Elemento actual' : `Seleccionar ${a.label}`}
                          className={cn(
                            'flex items-center shrink-0 text-[10px] font-medium whitespace-nowrap rounded px-1 py-0.5',
                            isLast
                              ? 'text-violet-700 font-bold'
                              : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50',
                          )}
                        >
                          {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="p-4 space-y-3 max-h-[72vh] overflow-y-auto">
                  {selectedEl.isImage ? (
                    <>
                      {selectedEl.src && (
                        <img src={selectedEl.src} alt="" className="w-full h-28 object-cover rounded-lg border border-slate-100" />
                      )}
                      <button
                        onClick={() => { setCreativeForReplace(true); setShowCreative(true); }}
                        className="w-full px-3 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700"
                      >
                        <Wand2 className="h-4 w-4" /> Reemplazar imagen
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">Elegí o generá una en el Estudio Creativo.</p>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto</label>
                        <p className="mt-1 text-sm text-slate-700 bg-slate-50 rounded-lg p-2.5 max-h-24 overflow-y-auto leading-snug">
                          {selectedEl.text || <span className="italic text-slate-400">(sin texto directo)</span>}
                        </p>
                      </div>
                      {selectedEl.text && (
                        <button
                          onClick={() => {
                            iframeRef.current?.contentWindow?.postMessage({ type: 'PLIA_EDIT_TEXT' }, '*');
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700"
                        >
                          <Code className="h-4 w-4" /> Editar texto en el lienzo
                        </button>
                      )}
                    </>
                  )}

                  {/* Inspector numérico de propiedades (tamaño, padding,
                      margen, tipografía, apariencia) estilo Framer/Figma. */}
                  <div className="border-t border-slate-100 pt-3">
                    <StyleInspector el={selectedEl} onApply={applyElementStyle} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showAiRules && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-0 top-14 bottom-0 w-80 bg-white border-l shadow-2xl z-40 flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Reglas de la IA</span>
                </div>
                <button onClick={() => setShowAiRules(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 p-4 flex flex-col space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Contexto Estratégico</label>
                  <textarea 
                    value={aiRules}
                    onChange={(e) => setAiRules(e.target.value)}
                    placeholder="Ej: Usa una paleta de colores cyberpunk, botones con bordes redondeados, etc."
                    className="w-full h-40 bg-slate-50 border-none rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 transition-all resize-none scrollbar-none"
                  />
                </div>
                <Button 
                  onClick={saveAiRules}
                  className={cn("w-full rounded-xl font-bold text-xs h-10 transition-all", aiRulesSaved ? "bg-indigo-500 text-white" : "bg-slate-900 text-white")}
                >
                  {aiRulesSaved ? <Check className="h-4 w-4 mr-2" /> : <History className="h-4 w-4 mr-2" />}
                  {aiRulesSaved ? "GUARDADO" : "GUARDAR REGLAS"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar lateral "Explorador" eliminado: ahora se usa el botón CODE
          del top bar, que abre el FileExplorer integrado en el panel central
          con preview del contenido del archivo. */}
<AnimatePresence>
        {isHistoryOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[100] bg-white">
            <div className="flex h-full flex-col">
              <header className="flex h-14 items-center justify-between border-b px-6">
                <h2 className="text-sm font-bold">Historial de Versiones</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)}><X className="h-4 w-4" /></Button>
              </header>
              <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Clock className="mx-auto h-12 w-12 opacity-20 mb-4" />
                  <p className="text-sm">No hay versiones anteriores disponibles</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <UpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        reason={upsellReason}
        currentPlan={creditsChip?.plan}
      />
      {/* Conversational Onboarding — solo aparece la primera vez que el cliente
          entra al proyecto, antes de cualquier generación. Sustituye el canvas
          por un chat guiado de 5 pasos. */}
      <OnboardingChat
        open={showOnboarding}
        capabilities={studioCaps}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />
      {/* Catalogo de templates 3D premium (solo Pro/Studio). Abre wizard +
          preview iframe + inserta pagina al proyecto. */}
      <Templates3DDialog
        open={showTemplates3D}
        userPlanSlug={studioCaps?.planSlug}
        apiBase={apiBase}
        authToken={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}
        onClose={() => setShowTemplates3D(false)}
        onUseTemplate={handleUseTemplate3D}
      />
      {/* Estudio Creativo: generar imágenes (Flux), imagen-a-video (Kling/Veo),
          gestionar assets. Primer paso del entorno creativo unificado. */}
      <CreativeStudioDialog
        open={showCreative}
        apiBase={apiBase}
        authToken={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}
        onClose={() => setShowCreative(false)}
        externalAssets={creativeAssets}
        onAssetGenerated={(a) => {
          setCreativeAssets((prev) => [a, ...prev]);
          // El asset generado aparece también como item del lienzo.
          addCanvasItem(a.url, a.kind);
        }}
        onUseAsset={(asset) => {
          setShowCreative(false);
          // CASO 1: venimos del inspector "Reemplazar imagen" -> reemplazo
          // directo en el lienzo (sin pasar por el chat). El iframe cambia
          // el src y nos avisa con PLIA_IMG_REPLACED, que aplica al código.
          if (creativeForReplace && asset.kind === 'image' && selectedEl?.isImage) {
            iframeRef.current?.contentWindow?.postMessage(
              { type: 'PLIA_REPLACE_IMG', url: asset.url },
              '*',
            );
            setCreativeForReplace(false);
            return;
          }
          setCreativeForReplace(false);
          // CASO 2: uso general -> insertar via chat para que la IA decida.
          const kind = asset.kind === 'video' ? 'video' : 'imagen';
          handleSend(
            `Usa este ${kind} que generé en el Estudio Creativo: ${asset.url}\n\n` +
              `Insértalo donde mejor quede (hero, galería, o donde tenga sentido para ${kind === 'video' ? 'un fondo cinematográfico' : 'mostrar el producto/ambiente'}). ` +
              (asset.prompt ? `Contexto: "${asset.prompt}".` : ''),
          );
        }}
      />
      {/* Workflow Creativo: canvas de nodos imagen→video (Fase D). */}
      <NodeCanvasDialog
        open={showNodeCanvas}
        apiBase={apiBase}
        authToken={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}
        onClose={() => setShowNodeCanvas(false)}
        onUseAsset={(url, kind) => {
          setShowNodeCanvas(false);
          // El resultado del workflow aparece como item del lienzo,
          // listo para mover/arrastrar sobre el sitio.
          setCreativeAssets((prev) => [
            { id: `wf-${Date.now()}`, kind, url, createdAt: Date.now() },
            ...prev,
          ]);
          addCanvasItem(url, kind);
          toast.success(`${kind === 'video' ? 'Video' : 'Imagen'} agregado al lienzo`);
        }}
      />
      <Toaster />
    </div>
  );
}
