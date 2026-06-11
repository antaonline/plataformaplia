"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Film,
  Loader2,
  Download,
  MessageSquarePlus,
  GripHorizontal,
} from 'lucide-react';

/**
 * LIENZO UNIFICADO (estilo Kittl): los assets (imágenes/videos) viven como
 * ITEMS flotantes en el mismo lienzo que el artboard del sitio. Se pueden
 * mover, redimensionar, eliminar, convertir a video (con línea de conexión
 * origen→video) y arrastrar SOBRE una imagen del sitio para reemplazarla.
 *
 * Este componente se monta DENTRO del stage del CanvasViewport, así que
 * todas sus coordenadas son coordenadas del stage (sin zoom): el transform
 * del stage las escala solo. Lo único que necesita la matemática del zoom
 * son los arrastres (delta de pantalla / zoom = delta de stage), por eso
 * recibe transformRef.
 */

export interface CanvasItem {
  id: string;
  kind: 'image' | 'video';
  url: string;
  /** Posición en coords del stage. */
  x: number;
  y: number;
  /** Ancho en px del stage; el alto sigue el aspect ratio. */
  w: number;
  /** Aspect ratio w/h (se fija al cargar el media). */
  ar: number;
  /** Si este item fue generado a partir de otro (imagen→video). */
  fromId?: string | null;
  /** Prompt usado (referencia). */
  prompt?: string;
  /** Estado de conversión a video. */
  converting?: boolean;
  error?: string;
}

interface Props {
  items: CanvasItem[];
  onChange: (items: CanvasItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Transformación actual del lienzo (la mantiene el padre via ref). */
  transformRef: React.MutableRefObject<{ zoom: number; pan: { x: number; y: number } }>;
  /** Iframe del preview, para el drop-para-reemplazar. */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  apiBase: string;
  authToken: string;
  /** Insertar el asset en la web vía chat (para videos u otros casos). */
  onInsertViaChat?: (url: string, kind: 'image' | 'video') => void;
}

export const CanvasItemsLayer: React.FC<Props> = ({
  items,
  onChange,
  selectedId,
  onSelect,
  transformRef,
  iframeRef,
  apiBase,
  authToken,
  onInsertViaChat,
}) => {
  // Drag de un item: { id, mode: move|resize, startX/Y (pantalla), origX/Y/W,
  // snapBack: posición original por si el drop reemplaza una imagen del sitio }
  const drag = useRef<{
    id: string;
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
  } | null>(null);
  const [overSiteImg, setOverSiteImg] = useState(false);

  const update = useCallback(
    (id: string, patch: Partial<CanvasItem>) => {
      onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [items, onChange],
  );

  // Coordenadas de pantalla → coords internas del iframe (para el bridge).
  const toIframeCoords = useCallback(
    (clientX: number, clientY: number) => {
      const iframe = iframeRef.current;
      if (!iframe) return null;
      const r = iframe.getBoundingClientRect();
      if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
      return {
        x: ((clientX - r.left) * iframe.offsetWidth) / r.width,
        y: ((clientY - r.top) * iframe.offsetHeight) / r.height,
      };
    },
    [iframeRef],
  );

  // ─── Mover / redimensionar ────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      const z = transformRef.current.zoom || 1;
      const dx = (e.clientX - d.startX) / z;
      const dy = (e.clientY - d.startY) / z;
      if (d.mode === 'move') {
        onChange(
          items.map((it) => (it.id === d.id ? { ...it, x: d.origX + dx, y: d.origY + dy } : it)),
        );
        // ¿Estamos sobre una imagen del sitio? Avisar al bridge para resaltar.
        const c = toIframeCoords(e.clientX, e.clientY);
        const win = iframeRef.current?.contentWindow;
        if (c && win) {
          win.postMessage({ type: 'PLIA_DRAG_OVER', x: c.x, y: c.y }, '*');
          setOverSiteImg(true);
        } else {
          if (overSiteImg) iframeRef.current?.contentWindow?.postMessage({ type: 'PLIA_DRAG_END' }, '*');
          setOverSiteImg(false);
        }
      } else {
        const newW = Math.max(60, d.origW + dx);
        onChange(items.map((it) => (it.id === d.id ? { ...it, w: newW } : it)));
      }
    };
    const onUp = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      if (d.mode === 'move') {
        const item = items.find((it) => it.id === d.id);
        const c = toIframeCoords(e.clientX, e.clientY);
        const win = iframeRef.current?.contentWindow;
        if (c && win && item && item.kind === 'image') {
          // Soltado sobre el sitio: si hay un <img> debajo, el bridge lo
          // reemplaza y dispara PLIA_IMG_REPLACED (el page lo persiste).
          win.postMessage({ type: 'PLIA_DRAG_DROP', x: c.x, y: c.y, url: item.url }, '*');
          // El item vuelve a su posición original (no queda tapando el sitio).
          onChange(
            items.map((it) => (it.id === d.id ? { ...it, x: d.origX, y: d.origY } : it)),
          );
        } else if (win) {
          win.postMessage({ type: 'PLIA_DRAG_END' }, '*');
        }
      }
      setOverSiteImg(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [items, onChange, toIframeCoords, transformRef, iframeRef, overSiteImg]);

  const startDrag = (id: string, mode: 'move' | 'resize', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const it = items.find((x) => x.id === id);
    if (!it) return;
    onSelect(id);
    drag.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: it.x,
      origY: it.y,
      origW: it.w,
    };
  };

  // ─── Convertir imagen → video (nodo conectado en el lienzo) ──────────
  const convertToVideo = async (item: CanvasItem) => {
    update(item.id, { converting: true, error: undefined });
    try {
      const res = await fetch(`${apiBase}/experimental/creative/image-to-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ imageUrl: item.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Error generando video');
      const url = data.localUrl || data.url;
      if (!url) throw new Error('No se recibió el video');
      // El video aparece como un item NUEVO a la derecha, conectado al origen.
      const fresh: CanvasItem = {
        id: `vid-${Date.now()}`,
        kind: 'video',
        url,
        x: item.x + item.w + 90,
        y: item.y,
        w: item.w,
        ar: item.ar,
        fromId: item.id,
      };
      onChange(
        items
          .map((it) => (it.id === item.id ? { ...it, converting: false } : it))
          .concat(fresh),
      );
    } catch (e: any) {
      update(item.id, { converting: false, error: (e?.message || 'Error').slice(0, 120) });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {/* Conexiones origen→video */}
      <svg className="absolute pointer-events-none" style={{ overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}>
        {items.map((it) => {
          if (!it.fromId) return null;
          const from = items.find((x) => x.id === it.fromId);
          if (!from) return null;
          const x1 = from.x + from.w;
          const y1 = from.y + from.w / from.ar / 2;
          const x2 = it.x;
          const y2 = it.y + it.w / it.ar / 2;
          const mid = (x1 + x2) / 2;
          return (
            <path
              key={`c-${it.id}`}
              d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
            />
          );
        })}
      </svg>

      {items.map((it) => {
        const h = it.w / it.ar;
        const selected = selectedId === it.id;
        return (
          <div
            key={it.id}
            className="absolute pointer-events-auto group"
            style={{ left: it.x, top: it.y, width: it.w }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Toolbar del item (al seleccionar) */}
            {selected && (
              <div
                className="absolute -top-9 left-0 flex items-center gap-1 bg-zinc-900 rounded-lg shadow-xl px-1 py-1 z-10"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {it.kind === 'image' && (
                  <button
                    onClick={() => convertToVideo(it)}
                    disabled={it.converting}
                    title="Convertir a video con IA"
                    className="p-1.5 rounded-md text-fuchsia-300 hover:bg-white/10 disabled:opacity-50"
                  >
                    {it.converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                  </button>
                )}
                {onInsertViaChat && (
                  <button
                    onClick={() => onInsertViaChat(it.url, it.kind)}
                    title="Insertar en la web (la IA decide dónde)"
                    className="p-1.5 rounded-md text-emerald-300 hover:bg-white/10"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={it.url}
                  download
                  title="Descargar"
                  className="p-1.5 rounded-md text-sky-300 hover:bg-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    onChange(items.filter((x) => x.id !== it.id));
                    onSelect(null);
                  }}
                  title="Eliminar del lienzo"
                  className="p-1.5 rounded-md text-red-300 hover:bg-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Media (arrastrable para mover; si es imagen y la soltás sobre
                una imagen del sitio, la reemplaza) */}
            <div
              onMouseDown={(e) => startDrag(it.id, 'move', e)}
              className={`relative rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing transition-shadow ${
                selected
                  ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent'
                  : 'ring-1 ring-black/10 hover:ring-violet-400'
              }`}
              style={{ height: h }}
            >
              {it.kind === 'video' ? (
                <video
                  src={it.url}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover pointer-events-none"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.videoWidth && v.videoHeight) {
                      update(it.id, { ar: v.videoWidth / v.videoHeight });
                    }
                  }}
                />
              ) : (
                <img
                  src={it.url}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                  onLoad={(e) => {
                    const im = e.currentTarget;
                    if (im.naturalWidth && im.naturalHeight && Math.abs(it.ar - im.naturalWidth / im.naturalHeight) > 0.01) {
                      update(it.id, { ar: im.naturalWidth / im.naturalHeight });
                    }
                  }}
                />
              )}
              {/* Hint mientras se arrastra sobre el sitio */}
              {drag.current?.id === it.id && overSiteImg && (
                <div className="absolute inset-0 bg-amber-400/30 border-4 border-amber-400 rounded-xl flex items-center justify-center">
                  <span className="text-[11px] font-black text-amber-900 bg-white/90 px-2 py-1 rounded-full">
                    Soltar para reemplazar
                  </span>
                </div>
              )}
              {/* Badge tipo */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/55 text-[9px] font-bold text-white uppercase tracking-wider">
                {it.kind === 'video' ? 'Video' : 'IMG'}
              </span>
            </div>

            {it.error && (
              <p className="mt-1 text-[10px] text-red-500 bg-white/90 rounded px-1.5 py-0.5">{it.error}</p>
            )}

            {/* Handle de resize (abajo-derecha) */}
            {selected && (
              <div
                onMouseDown={(e) => startDrag(it.id, 'resize', e)}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow cursor-nwse-resize"
                title="Redimensionar"
              />
            )}

            {/* Grip visual sutil al hover */}
            {!selected && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripHorizontal className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
