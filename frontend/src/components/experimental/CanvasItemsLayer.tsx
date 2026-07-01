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
  /** IDs seleccionados (multi-selección por marquee o Shift+click). */
  selectedIds: string[];
  /** Reemplaza la selección completa. */
  onSelect: (ids: string[]) => void;
  /** Transformación actual del lienzo (la mantiene el padre via ref). */
  transformRef: React.MutableRefObject<{ zoom: number; pan: { x: number; y: number } }>;
  /** Iframe del preview, para el drop-para-reemplazar. */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  apiBase: string;
  authToken: string;
  /** Insertar el asset en la web vía chat (para videos u otros casos). */
  onInsertViaChat?: (url: string, kind: 'image' | 'video') => void;
  /**
   * Zoom actual del lienzo. La toolbar y los handles se CONTRA-ESCALAN
   * (scale 1/zoom) para mantener tamaño visual constante como Kittl —
   * sin esto, al alejar el zoom los botones quedan microscópicos.
   */
  zoom: number;
  /** Dimensiones del artboard (para snapping a sus bordes/centro). */
  artboardWidth?: number;
  artboardHeight?: number;
}

export const CanvasItemsLayer: React.FC<Props> = ({
  items,
  onChange,
  selectedIds,
  onSelect,
  transformRef,
  iframeRef,
  apiBase,
  authToken,
  onInsertViaChat,
  zoom,
  artboardWidth = 0,
  artboardHeight = 0,
}) => {
  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);
  // El item "primario" (último seleccionado) ancla la toolbar individual.
  const primaryId = selectedIds.length ? selectedIds[selectedIds.length - 1] : null;
  // Guías de alineación (snapping): línea vertical/horizontal al arrastrar.
  const [guides, setGuides] = useState<{ vx: number | null; hy: number | null }>({ vx: null, hy: null });
  // Factor de contra-escala para UI de tamaño constante (toolbar, handles).
  const inv = 1 / Math.max(zoom, 0.01);
  // Root del layer (coincide con el origen del stage): para convertir
  // coordenadas de pantalla -> coordenadas del stage.
  const rootRef = useRef<HTMLDivElement>(null);
  // Cable puerto-a-puerto (estilo Kittl): se arrastra desde el puerto de
  // salida de un item de imagen. Soltar en vacío genera un VIDEO conectado
  // en ese punto; soltar sobre una imagen del sitio la REEMPLAZA.
  const [portDrag, setPortDrag] = useState<{ fromId: string; x: number; y: number } | null>(null);

  /** Pantalla -> coords del stage (el rect del root ya incluye pan/zoom). */
  const toStage = useCallback(
    (clientX: number, clientY: number) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      const z = transformRef.current.zoom || 1;
      return { x: (clientX - r.left) / z, y: (clientY - r.top) / z };
    },
    [transformRef],
  );
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
    /** Posiciones originales de TODOS los items movidos (move en grupo). */
    group: { id: string; ox: number; oy: number }[];
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
        // ── Snapping: alinear los bordes/centro del item primario con los de
        // los otros items y del artboard. Produce un offset (sdx,sdy) global
        // para todo el grupo + las guías a dibujar.
        let sdx = 0, sdy = 0;
        let vx: number | null = null, hy: number | null = null;
        const prim = d.group.find((g) => g.id === d.id);
        const primIt = items.find((x) => x.id === d.id);
        if (prim && primIt) {
          const w = primIt.w, h = primIt.w / primIt.ar;
          const px = prim.ox + dx, py = prim.oy + dy;
          const dxs = [px, px + w / 2, px + w];
          const dys = [py, py + h / 2, py + h];
          const txs: number[] = [], tys: number[] = [];
          if (artboardWidth) txs.push(0, artboardWidth / 2, artboardWidth);
          if (artboardHeight) tys.push(0, artboardHeight / 2, artboardHeight);
          const groupIds = new Set(d.group.map((g) => g.id));
          for (const o of items) {
            if (groupIds.has(o.id)) continue;
            const oh = o.w / o.ar;
            txs.push(o.x, o.x + o.w / 2, o.x + o.w);
            tys.push(o.y, o.y + oh / 2, o.y + oh);
          }
          const thr = 7 / z; // ~7px de pantalla
          let bestX = thr, bestY = thr;
          for (const a of dxs) for (const t of txs) { const dd = Math.abs(a - t); if (dd < bestX) { bestX = dd; sdx = t - a; vx = t; } }
          for (const a of dys) for (const t of tys) { const dd = Math.abs(a - t); if (dd < bestY) { bestY = dd; sdy = t - a; hy = t; } }
        }
        // Mueve todo el grupo por el mismo delta (coords del stage) + snap.
        const moves = new Map(d.group.map((g) => [g.id, { x: g.ox + dx + sdx, y: g.oy + dy + sdy }]));
        onChange(items.map((it) => (moves.has(it.id) ? { ...it, ...moves.get(it.id)! } : it)));
        setGuides({ vx, hy });
        // Reemplazo sobre el sitio solo aplica al arrastrar UN item (no grupo).
        const single = d.group.length <= 1;
        const c = single ? toIframeCoords(e.clientX, e.clientY) : null;
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
        // Reemplazar imagen del sitio solo al soltar UN item (no un grupo).
        const c = d.group.length <= 1 ? toIframeCoords(e.clientX, e.clientY) : null;
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
      setGuides({ vx: null, hy: null }); // limpiar guías al soltar
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [items, onChange, toIframeCoords, transformRef, iframeRef, overSiteImg, artboardWidth, artboardHeight]);

  const startDrag = (id: string, mode: 'move' | 'resize', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const it = items.find((x) => x.id === id);
    if (!it) return;
    // Shift+click: alternar este item en la selección (sin iniciar arrastre).
    if (mode === 'move' && e.shiftKey) {
      onSelect(isSelected(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
      return;
    }
    // Si arrastras un item que YA es parte de una multi-selección, se mueve
    // todo el grupo. Si no, el arrastre selecciona solo ese item.
    const inGroup = isSelected(id) && selectedIds.length > 1;
    const groupIds = inGroup ? selectedIds : [id];
    if (!inGroup) onSelect([id]);
    drag.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: it.x,
      origY: it.y,
      origW: it.w,
      group:
        mode === 'move'
          ? groupIds
              .map((gid) => items.find((x) => x.id === gid))
              .filter((x): x is CanvasItem => !!x)
              .map((x) => ({ id: x.id, ox: x.x, oy: x.y }))
          : [],
    };
  };

  // ─── Convertir imagen → video (nodo conectado en el lienzo) ──────────
  // `at` (opcional): posición destino del video — la usa el cable
  // puerto-a-puerto para crear el video EXACTAMENTE donde se soltó.
  const convertToVideo = async (item: CanvasItem, at?: { x: number; y: number }) => {
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
      // El video aparece como un item NUEVO conectado al origen.
      const fresh: CanvasItem = {
        id: `vid-${Date.now()}`,
        kind: 'video',
        url,
        x: at ? at.x : item.x + item.w + 90,
        y: at ? at.y : item.y,
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

  // ─── Cable puerto-a-puerto (mousemove/mouseup globales) ──────────────
  useEffect(() => {
    if (!portDrag) return;
    const win = iframeRef.current?.contentWindow;
    const onMove = (e: MouseEvent) => {
      const s = toStage(e.clientX, e.clientY);
      setPortDrag((p) => (p ? { ...p, x: s.x, y: s.y } : p));
      // Resaltar imagen del sitio bajo el cable (destino de reemplazo).
      const c = toIframeCoords(e.clientX, e.clientY);
      if (c && win) {
        win.postMessage({ type: 'PLIA_DRAG_OVER', x: c.x, y: c.y }, '*');
        setOverSiteImg(true);
      } else {
        if (overSiteImg) win?.postMessage({ type: 'PLIA_DRAG_END' }, '*');
        setOverSiteImg(false);
      }
    };
    const onUp = (e: MouseEvent) => {
      const source = items.find((it) => it.id === portDrag.fromId);
      const c = toIframeCoords(e.clientX, e.clientY);
      if (c && win && source) {
        // Soltado sobre el sitio: reemplazar la imagen bajo el cursor.
        win.postMessage({ type: 'PLIA_DRAG_DROP', x: c.x, y: c.y, url: source.url }, '*');
      } else if (source && source.kind === 'image') {
        // Soltado en el vacío del lienzo: generar VIDEO conectado ahí.
        const s = toStage(e.clientX, e.clientY);
        convertToVideo(source, { x: s.x, y: s.y - source.w / source.ar / 2 });
      }
      win?.postMessage({ type: 'PLIA_DRAG_END' }, '*');
      setOverSiteImg(false);
      setPortDrag(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portDrag, items, overSiteImg]);

  // ─── Suprimir: eliminar los items seleccionados ──────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (!selectedIds.length) return;
      const t = e.target as HTMLElement;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      e.preventDefault();
      onChange(items.filter((x) => !selectedIds.includes(x.id)));
      onSelect([]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, items, onChange, onSelect]);

  return (
    <div ref={rootRef} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {/* Conexiones origen→video + cable en vivo del puerto */}
      <svg className="absolute pointer-events-none" style={{ overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}>
        {/* Guías de alineación (snapping) mientras se arrastra. */}
        {guides.vx != null && (
          <line
            x1={guides.vx} y1={-1000} x2={guides.vx} y2={artboardHeight + 1000}
            stroke="#ec4899" strokeWidth={inv} strokeDasharray={`${4 * inv} ${3 * inv}`}
          />
        )}
        {guides.hy != null && (
          <line
            x1={-1000} y1={guides.hy} x2={artboardWidth + 4000} y2={guides.hy}
            stroke="#ec4899" strokeWidth={inv} strokeDasharray={`${4 * inv} ${3 * inv}`}
          />
        )}
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
        {/* Cable en vivo mientras se arrastra desde un puerto (Kittl). */}
        {portDrag && (() => {
          const from = items.find((x) => x.id === portDrag.fromId);
          if (!from) return null;
          const x1 = from.x + from.w;
          const y1 = from.y + from.w / from.ar / 2;
          const mid = (x1 + portDrag.x) / 2;
          return (
            <>
              <path
                d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${portDrag.y}, ${portDrag.x} ${portDrag.y}`}
                stroke="#a855f7"
                strokeWidth={2.5}
                fill="none"
              />
              <circle cx={portDrag.x} cy={portDrag.y} r={5 * inv} fill="#a855f7" />
            </>
          );
        })()}
      </svg>

      {items.map((it) => {
        const h = it.w / it.ar;
        const selected = isSelected(it.id);
        const multi = selectedIds.length > 1;
        return (
          <div
            key={it.id}
            className="absolute pointer-events-auto group"
            style={{ left: it.x, top: it.y, width: it.w }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Toolbar de GRUPO (multi-selección): contador + eliminar todo.
                Se ancla al item primario. */}
            {multi && it.id === primaryId && (
              <div
                className="absolute left-0 flex items-center gap-2 bg-zinc-900 rounded-lg shadow-xl px-2 py-1 z-10"
                style={{ top: -44 * inv, transform: `scale(${inv})`, transformOrigin: 'left top' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] font-bold text-white/80 pl-0.5">
                  {selectedIds.length} seleccionados
                </span>
                <button
                  onClick={() => {
                    onChange(items.filter((x) => !selectedIds.includes(x.id)));
                    onSelect([]);
                  }}
                  title="Eliminar selección del lienzo"
                  className="p-1.5 rounded-md text-red-300 hover:bg-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Toolbar del item individual (selección única). Contra-escalada
                (1/zoom) para mantener tamaño visual constante como Kittl. */}
            {selected && !multi && (
              <div
                className="absolute left-0 flex items-center gap-1 bg-zinc-900 rounded-lg shadow-xl px-1 py-1 z-10"
                style={{
                  top: -44 * inv,
                  transform: `scale(${inv})`,
                  transformOrigin: 'left top',
                }}
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
                    onSelect([]);
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

            {/* PUERTO de salida (derecha-centro, estilo Kittl). Arrastra el
                cable: soltarlo en el vacío genera un VIDEO conectado en ese
                punto; soltarlo sobre una imagen del sitio la reemplaza. */}
            {it.kind === 'image' && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect([it.id]);
                  setPortDrag({ fromId: it.id, x: it.x + it.w + 10, y: it.y + h / 2 });
                }}
                title="Arrastra el cable: al vacío genera un video · sobre una imagen del sitio la reemplaza"
                className={`absolute z-10 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-crosshair transition-colors ${
                  portDrag?.fromId === it.id ? 'bg-violet-600' : 'bg-violet-400 hover:bg-violet-600'
                } ${selected || portDrag?.fromId === it.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{
                  right: -8 * inv,
                  top: '50%',
                  transform: `translateY(-50%) scale(${inv})`,
                  transformOrigin: 'center',
                }}
              />
            )}

            {/* Handle de resize (abajo-derecha), contra-escalado para que
                siga siendo agarrable en cualquier zoom. Solo en selección única. */}
            {selected && !multi && (
              <div
                onMouseDown={(e) => startDrag(it.id, 'resize', e)}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow cursor-nwse-resize"
                style={{ transform: `scale(${inv})`, transformOrigin: 'center' }}
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
