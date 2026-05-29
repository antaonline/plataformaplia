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
  MoreVertical, Eye, Code, Download, Copy, User, Bot, Save, Trash, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThinkingEngine, AgentState } from '@/components/experimental/ThinkingEngine';
import { UpsellModal } from '@/components/experimental/UpsellModal';
import FileExplorer from '@/components/experimental/FileExplorer';
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
  const [agentState, setAgentState] = useState<'idle' | 'planning' | 'working' | 'searching' | 'Build' | 'Ask' | 'Plan'>('Build');
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
  const [showExplorer, setShowExplorer] = useState(false);
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
      if (!e.data || e.data.type !== 'PLIA_SHOT' || !e.data.dataUrl) return;
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
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [apiBase, id]);

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
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
      toast({ title: "¡Proyecto Publicado!", description: `Tu web está lista en: ${data.previewUrl}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
            const routeKeys = Object.keys(pages).filter(
              (k) =>
                k.startsWith('/') &&
                k !== '/' &&
                !/\.(tsx|ts|jsx|js|css|json|md|svg|png|jpg)$/i.test(k),
            );
            const routes = ['/', ...routeKeys];
            const goToRoute = (r: string) => {
              setPreviewRoute(r);
              setNavOpen(false);
              if (iframeRef.current) {
                iframeRef.current.src =
                  previewUrl.replace(/\/$/, '') + (r === '/' ? '/' : r);
              }
            };
            return (
              <div className="absolute left-1/2 -translate-x-1/2 w-[34%] min-w-[300px] max-w-[520px]">
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
                      {routeKeys.length === 0 && (
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
                    <ThinkingEngine state={agentState} completedTasks={completedTasks} currentTask={currentTask} />
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
          <div className="flex-1 bg-slate-100 flex flex-col items-center p-8 overflow-hidden relative">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="absolute top-4 left-4 z-40 bg-white border border-slate-200 p-2 rounded-xl shadow-md hover:bg-slate-50 transition-all group"
              >
                <Sidebar className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
              </button>
            )}
            <div className="absolute top-4 left-16 z-10 flex gap-2">
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setShowExplorer(!showExplorer)}
                 className="bg-white/80 backdrop-blur-md shadow-sm border rounded-xl"
                 title="Mostrar/ocultar explorador de archivos"
               >
                 <History className={cn("h-4 w-4 transition-all", showExplorer ? "text-indigo-500 rotate-180" : "text-slate-400")} />
               </Button>
            </div>
            
            <div className={cn("bg-white shadow-2xl rounded-3xl overflow-hidden flex-1 relative transition-all duration-500", rightPaneMode === 'code' ? 'w-full' : viewport === 'desktop' ? "w-full" : viewport === 'tablet' ? "w-[768px]" : "w-[375px]")}>
               {rightPaneMode === 'code' ? (
                 <FileExplorer
                   files={pages}
                   onAskAiAboutFile={(path) => {
                     setRightPaneMode('preview');
                     const tag = `Edita el archivo \`${path}\`: `;
                     setInput((prev) => (prev ? `${tag}${prev}` : tag));
                   }}
                 />
               ) : previewUrl ? (
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

      <AnimatePresence>
        {showExplorer && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l bg-white flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
               <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Explorador</span>
               </div>
               <button onClick={() => setShowExplorer(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
               {Object.keys(pages).map(p => (
                 <button 
                   key={p} 
                   onClick={() => setCurrentPath(p)}
                   className={cn("w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all", currentPath === p ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:bg-slate-50")}
                 >
                   <div className={cn("h-1.5 w-1.5 rounded-full", currentPath === p ? "bg-indigo-500" : "bg-slate-200")} />
                   {p.startsWith('/') ? p.substring(1) || 'index.html' : p}
                 </button>
               ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
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
      <Toaster />
    </div>
  );
}
