"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, GripVertical } from 'lucide-react';
import type { CreativeAsset } from './CreativeStudioDialog';

/**
 * Barra de assets arrastrables sobre el lienzo (Fase C). Permite arrastrar
 * una imagen generada/subida y soltarla sobre una imagen del preview para
 * reemplazarla.
 *
 * Por qué un drag CUSTOM (no HTML5 drag-and-drop): el preview es un iframe
 * de OTRO origen (:3002 vs :3001). El drag-and-drop nativo de HTML5 NO
 * cruza iframes cross-origin. Así que hacemos el drag con eventos de ratón
 * y le mandamos las coordenadas al bridge dentro del iframe via postMessage,
 * que usa document.elementFromPoint para encontrar la imagen destino.
 */

interface Props {
  /** Solo imágenes (los videos no se pueden soltar sobre <img>). */
  assets: CreativeAsset[];
  /** Ref del iframe del preview, para traducir coordenadas y postMessage. */
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const CanvasAssetDock: React.FC<Props> = ({ assets, iframeRef }) => {
  const [dragging, setDragging] = useState<CreativeAsset | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [overTarget, setOverTarget] = useState(false);

  const imageAssets = assets.filter((a) => a.kind === 'image');

  // Traduce coords de pantalla -> coords internas del iframe (CSS px del
  // viewport del iframe, donde funciona elementFromPoint).
  const toIframeCoords = useCallback(
    (clientX: number, clientY: number) => {
      const iframe = iframeRef.current;
      if (!iframe) return null;
      const r = iframe.getBoundingClientRect();
      if (
        clientX < r.left ||
        clientX > r.right ||
        clientY < r.top ||
        clientY > r.bottom
      )
        return null; // fuera del iframe
      return {
        x: ((clientX - r.left) * iframe.offsetWidth) / r.width,
        y: ((clientY - r.top) * iframe.offsetHeight) / r.height,
      };
    },
    [iframeRef],
  );

  const startDrag = (asset: CreativeAsset, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(asset);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!dragging) return;
    const win = iframeRef.current?.contentWindow;
    const onMove = (e: MouseEvent) => {
      setGhostPos({ x: e.clientX, y: e.clientY });
      const c = toIframeCoords(e.clientX, e.clientY);
      if (c && win) {
        win.postMessage({ type: 'PLIA_DRAG_OVER', x: c.x, y: c.y }, '*');
        setOverTarget(true);
      } else {
        setOverTarget(false);
      }
    };
    const onUp = (e: MouseEvent) => {
      const c = toIframeCoords(e.clientX, e.clientY);
      if (c && win) {
        win.postMessage(
          { type: 'PLIA_DRAG_DROP', x: c.x, y: c.y, url: dragging.url },
          '*',
        );
      } else if (win) {
        win.postMessage({ type: 'PLIA_DRAG_END' }, '*');
      }
      setDragging(null);
      setOverTarget(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, toIframeCoords, iframeRef]);

  if (imageAssets.length === 0) return null;

  return (
    <>
      {/* Dock de assets (abajo-izquierda del lienzo) */}
      <div className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-2 max-w-[340px]">
        <div className="flex items-center gap-1.5 px-1.5 pb-1.5 mb-0.5 border-b border-slate-100">
          <ImageIcon className="h-3 w-3 text-violet-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Assets · arrastra sobre una imagen
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pt-1 pb-0.5 max-w-[324px]">
          {imageAssets.map((a) => (
            <button
              key={a.id}
              onMouseDown={(e) => startDrag(a, e)}
              className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-violet-400 cursor-grab active:cursor-grabbing group"
              title="Arrastra sobre una imagen del sitio para reemplazarla"
            >
              <img src={a.url} alt="" className="w-full h-full object-cover pointer-events-none" />
              <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-black/50 rounded p-0.5">
                <GripVertical className="h-2.5 w-2.5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ghost que sigue el cursor mientras se arrastra */}
      {dragging && (
        <motion.div
          className="fixed pointer-events-none z-[200]"
          style={{
            left: ghostPos.x + 12,
            top: ghostPos.y + 12,
          }}
        >
          <div
            className={`w-20 h-20 rounded-xl overflow-hidden shadow-2xl border-2 ${
              overTarget ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-white'
            }`}
          >
            <img src={dragging.url} alt="" className="w-full h-full object-cover" />
          </div>
          {overTarget && (
            <span className="block mt-1 text-[10px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full shadow text-center">
              Soltar para reemplazar
            </span>
          )}
        </motion.div>
      )}
    </>
  );
};
