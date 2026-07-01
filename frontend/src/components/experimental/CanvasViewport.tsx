"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { Plus, Minus, Maximize2, Hand, MousePointer2 } from 'lucide-react';

/**
 * Lienzo infinito con zoom y pan estilo Framer/Kittl. Envuelve el preview
 * (artboard) en un "stage" transformable: rueda del ratón para zoom hacia
 * el cursor, arrastrar para mover, controles de zoom abajo.
 *
 * Detalle clave: cuando hay un <iframe> adentro, el iframe captura los
 * eventos del ratón y rompe el pan. Por eso durante el pan (o cuando la
 * herramienta "mano" está activa) montamos un overlay transparente encima
 * del artboard que captura el drag. Al soltar, se quita el overlay para
 * que el usuario pueda interactuar con el iframe normalmente.
 */

export interface CanvasViewportHandle {
  fit: () => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /**
   * Aplica un evento de rueda originado DENTRO del iframe del preview
   * (el bridge lo reenvía con PLIA_WHEEL porque los eventos del iframe
   * cross-origin no llegan al lienzo). Coordenadas en px de PANTALLA.
   */
  applyExternalWheel: (e: {
    screenX: number;
    screenY: number;
    deltaX: number;
    deltaY: number;
    ctrlKey: boolean;
    shiftKey: boolean;
  }) => void;
}

interface Props {
  /** Ancho del artboard en px (según el dispositivo: 1440 desktop, etc). */
  artboardWidth: number;
  /** Alto del artboard en px. */
  artboardHeight: number;
  /** El contenido (la tarjeta blanca con el iframe). */
  children: React.ReactNode;
  /** Color de fondo del lienzo. */
  background?: string;
  /**
   * Notifica cada cambio de transformación (zoom/pan). El padre lo usa
   * para convertir coordenadas de pantalla → coordenadas del stage (los
   * items del lienzo unificado necesitan esta matemática al arrastrar).
   */
  onTransformChange?: (t: { zoom: number; pan: { x: number; y: number } }) => void;
  /** Click directo sobre el fondo del lienzo (no sobre un hijo). */
  onBackgroundMouseDown?: () => void;
  /**
   * Selección por área (marquee, estilo escritorio de Windows): se dibuja
   * arrastrando sobre el fondo del lienzo. El rect llega en coordenadas del
   * STAGE (sin zoom) para hit-test directo contra los items flotantes.
   * `additive` = true cuando se mantenía Shift (sumar a la selección).
   */
  onMarquee?: (
    rect: { x: number; y: number; w: number; h: number },
    additive: boolean,
  ) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

export const CanvasViewport = React.forwardRef<CanvasViewportHandle, Props>(
  (
    {
      artboardWidth,
      artboardHeight,
      children,
      background = '#eef1f5',
      onTransformChange,
      onBackgroundMouseDown,
      onMarquee,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'select' | 'hand'>('select');
    const [isPanning, setIsPanning] = useState(false);
    const [spaceHeld, setSpaceHeld] = useState(false);
    const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
    // Marquee (selección por área). Mientras se arrastra guardamos las dos
    // esquinas en coords de PANTALLA; `pending` espera a que el ratón se
    // mueva un mínimo antes de dibujar (así un click simple NO crea caja).
    const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
    const marqueeStart = useRef<{ x: number; y: number; additive: boolean } | null>(null);
    // Espejo de zoom/pan en refs: el zoom-hacia-cursor lee el valor ACTUAL
    // sin depender de closures ni de setState-dentro-de-setState (que causa
    // saltos al hacer scroll rápido del zoom).
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    zoomRef.current = zoom;
    panRef.current = pan;

    // Reportar la transformación al padre en cada cambio.
    useEffect(() => {
      onTransformChange?.({ zoom, pan });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, pan]);

    // La altura vive en un ref para que `fit` NO se recree (ni re-encuadre)
    // cuando el sitio reporta su altura completa y el artboard crece hacia
    // abajo — solo re-encuadramos al cambiar de dispositivo (ancho).
    const artboardHeightRef = useRef(artboardHeight);
    artboardHeightRef.current = artboardHeight;

    // ─── Fit: encuadra el artboard ─────────────────────────────────────────
    // Para páginas ALTAS (web completa desplegada), ajusta al ANCHO y alinea
    // arriba (como Framer/Kittl): el usuario panea hacia abajo para recorrer.
    const fit = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const pad = 80;
      const h = artboardHeightRef.current;
      const zw = (cw - pad) / artboardWidth;
      const zh = (ch - pad) / h;
      const isTall = h * Math.min(zw, 1) > ch * 1.4;
      const scale = isTall ? Math.min(zw, 1) : Math.min(zw, zh, 1);
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
      setZoom(z);
      setPan({
        x: (cw - artboardWidth * z) / 2,
        y: isTall ? 40 : (ch - h * z) / 2,
      });
    }, [artboardWidth]);

    // Auto-fit al montar y cuando cambia el tamaño del artboard.
    useEffect(() => {
      const t = setTimeout(fit, 50);
      return () => clearTimeout(t);
    }, [fit]);

    useImperativeHandle(ref, () => ({
      fit,
      resetZoom: () => {
        const el = containerRef.current;
        if (!el) return;
        setZoom(1);
        setPan({
          x: (el.clientWidth - artboardWidth) / 2,
          y: 40,
        });
      },
      zoomIn: () => zoomBy(1.2),
      zoomOut: () => zoomBy(1 / 1.2),
      applyExternalWheel: (e) => {
        if (e.ctrlKey) {
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          zoomAt(e.screenX, e.screenY, factor);
        } else {
          panBy(-(e.shiftKey ? e.deltaY : e.deltaX), -(e.shiftKey ? 0 : e.deltaY));
        }
      },
    }));

    // ─── Zoom hacia el cursor ─────────────────────────────────────────────
    // Lee zoom/pan ACTUALES desde refs y fija ambos en una sola pasada. NO
    // anidamos setPan dentro del updater de setZoom: en StrictMode (dev) los
    // updaters corren DOS veces, así que el anidado aplicaba la corrección de
    // pan dos veces y el zoom se recentraba en un punto equivocado.
    const zoomAt = (clientX: number, clientY: number, factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const prevZoom = zoomRef.current;
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * factor));
      if (next === prevZoom) return;
      const realFactor = next / prevZoom;
      const prevPan = panRef.current;
      const nextPan = {
        // El punto (px,py) bajo el cursor queda fijo tras escalar.
        x: px - (px - prevPan.x) * realFactor,
        y: py - (py - prevPan.y) * realFactor,
      };
      zoomRef.current = next;
      panRef.current = nextPan;
      setZoom(next);
      setPan(nextPan);
    };

    // Pan incremental que lee/escribe el ref para no acumular sobre un valor
    // viejo cuando llegan muchos eventos de rueda seguidos (batching de React).
    const panBy = (dx: number, dy: number) => {
      const next = { x: panRef.current.x + dx, y: panRef.current.y + dy };
      panRef.current = next;
      setPan(next);
    };

    const zoomBy = (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    };

    // Listener de rueda NATIVO con { passive: false } para poder hacer
    // preventDefault. El onWheel de React es passive por default -> el
    // navegador se queda con ctrl+rueda (zoom de la página) y nuestro
    // preventDefault no surte efecto. Con el listener nativo lo capturamos.
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const handler = (e: WheelEvent) => {
        // Ctrl (o Cmd en Mac) + rueda = zoom del lienzo. Igual que Kittl.
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          zoomAt(e.clientX, e.clientY, factor);
        } else {
          // Rueda sola = pan (vertical; Shift = horizontal).
          e.preventDefault();
          panBy(-(e.shiftKey ? e.deltaY : e.deltaX), -(e.shiftKey ? 0 : e.deltaY));
        }
      };
      el.addEventListener('wheel', handler, { passive: false });
      return () => el.removeEventListener('wheel', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Pan con arrastre ─────────────────────────────────────────────────
    const canPan = tool === 'hand' || spaceHeld;

    const onMouseDown = (e: React.MouseEvent) => {
      // Pan con: herramienta mano, espacio, o botón central. Tiene prioridad.
      if (canPan || e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        return;
      }
      // Click directo en el fondo (no en el artboard ni en items) con la
      // herramienta de selección → arranca un posible marquee. El deseleccionar
      // se decide al soltar: click limpio = deselecciona; arrastre = selecciona.
      if (e.target === e.currentTarget && e.button === 0) {
        marqueeStart.current = { x: e.clientX, y: e.clientY, additive: e.shiftKey };
      }
    };

    useEffect(() => {
      if (!isPanning) return;
      const onMove = (e: MouseEvent) => {
        setPan({
          x: panStart.current.panX + (e.clientX - panStart.current.x),
          y: panStart.current.panY + (e.clientY - panStart.current.y),
        });
      };
      const onUp = () => setIsPanning(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isPanning]);

    // ─── Marquee: dibujar y resolver la selección por área ────────────────
    useEffect(() => {
      const THRESH = 4; // px de pantalla antes de considerar que es arrastre
      const onMove = (e: MouseEvent) => {
        const s = marqueeStart.current;
        if (!s) return;
        if (!marquee && Math.hypot(e.clientX - s.x, e.clientY - s.y) < THRESH) return;
        const el = containerRef.current;
        if (!el) return;
        // Guardamos coords RELATIVAS al contenedor (para pintar el rect como
        // hijo absoluto). El hit-test de onUp usa las coords de cliente.
        const r = el.getBoundingClientRect();
        setMarquee({
          x0: s.x - r.left,
          y0: s.y - r.top,
          x1: e.clientX - r.left,
          y1: e.clientY - r.top,
        });
      };
      const onUp = (e: MouseEvent) => {
        const s = marqueeStart.current;
        if (!s) return;
        marqueeStart.current = null;
        const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y) >= THRESH;
        const el = containerRef.current;
        if (moved && el && onMarquee) {
          // Pantalla → stage para hit-test contra los items (coords sin zoom).
          const rect = el.getBoundingClientRect();
          const z = zoomRef.current || 1;
          const p = panRef.current;
          const toStage = (cx: number, cy: number) => ({
            x: (cx - rect.left - p.x) / z,
            y: (cy - rect.top - p.y) / z,
          });
          const a = toStage(s.x, s.y);
          const b = toStage(e.clientX, e.clientY);
          onMarquee(
            {
              x: Math.min(a.x, b.x),
              y: Math.min(a.y, b.y),
              w: Math.abs(a.x - b.x),
              h: Math.abs(a.y - b.y),
            },
            s.additive,
          );
        } else if (!moved && !s.additive) {
          // Click limpio sobre el fondo → deseleccionar.
          onBackgroundMouseDown?.();
        }
        setMarquee(null);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [marquee, onMarquee, onBackgroundMouseDown]);

    // ─── Espacio para pan temporal ────────────────────────────────────────
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
          setSpaceHeld(true);
        }
      };
      const up = (e: KeyboardEvent) => {
        if (e.code === 'Space') setSpaceHeld(false);
      };
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
      };
    }, []);

    const cursor = isPanning
      ? 'grabbing'
      : canPan
        ? 'grab'
        : 'default';

    return (
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        className="absolute inset-0 overflow-hidden select-none"
        style={{ background, cursor }}
      >
        {/* Patrón de puntos del lienzo (look design-tool) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Rectángulo de selección por área (marquee, estilo Windows) */}
        {marquee && (
          <div
            className="absolute z-40 pointer-events-none border border-indigo-500 bg-indigo-500/10 rounded-sm"
            style={{
              left: Math.min(marquee.x0, marquee.x1),
              top: Math.min(marquee.y0, marquee.y1),
              width: Math.abs(marquee.x1 - marquee.x0),
              height: Math.abs(marquee.y1 - marquee.y0),
            }}
          />
        )}

        {/* Stage transformable */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: artboardWidth,
            height: artboardHeight,
          }}
        >
          {children}
          {/* Overlay que captura el drag durante el pan para que el iframe
              no se coma los eventos. Solo activo mientras se hace pan. */}
          {(isPanning || canPan) && (
            <div className="absolute inset-0 z-50" style={{ cursor }} />
          )}
        </div>

        {/* Controles de zoom + herramientas (abajo centro) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-white rounded-2xl shadow-xl border border-slate-200 px-1.5 py-1.5">
          <button
            onClick={() => setTool('select')}
            title="Seleccionar (V)"
            className={`p-2 rounded-xl transition-colors ${tool === 'select' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <MousePointer2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('hand')}
            title="Mano / mover lienzo (H, o mantén Espacio)"
            className={`p-2 rounded-xl transition-colors ${tool === 'hand' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Hand className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onClick={() => zoomBy(1 / 1.2)}
            title="Alejar"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => zoomBy(1.2)}
            title="Acercar"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-500 w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={fit}
            title="Ajustar a pantalla"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  },
);

CanvasViewport.displayName = 'CanvasViewport';
