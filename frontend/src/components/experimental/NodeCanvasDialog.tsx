"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ImageIcon,
  Wand2,
  Film,
  Plus,
  Play,
  Loader2,
  Upload,
  Trash2,
  Workflow,
  Download,
} from 'lucide-react';

/**
 * Canvas de NODOS CREATIVOS (Fase D, estilo Kittl/Muapi). Un workflow
 * visual donde cada nodo es una operación (imagen origen, generar imagen,
 * imagen→video). Los nodos se conectan: el output de uno alimenta el input
 * del siguiente. Cada nodo se ejecuta vía los endpoints Muapi.
 *
 * Lienzo propio con pan (arrastrar el fondo) y zoom (Ctrl+rueda). Nodos
 * arrastrables por su cabecera. Conexiones dibujadas con curvas SVG.
 */

type NodeType = 'source' | 'generate-image' | 'to-video';

interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  // Estado / datos del nodo.
  prompt?: string;
  outputUrl?: string;
  outputKind?: 'image' | 'video';
  running?: boolean;
  error?: string;
  /** id del nodo del que toma su input (output). */
  inputFrom?: string | null;
}

interface Props {
  open: boolean;
  apiBase: string;
  authToken: string;
  onClose: () => void;
  /** Para usar un resultado en la web. */
  onUseAsset?: (url: string, kind: 'image' | 'video') => void;
}

const NODE_W = 240;
const NODE_H = 230;

export const NodeCanvasDialog: React.FC<Props> = ({
  open,
  apiBase,
  authToken,
  onClose,
  onUseAsset,
}) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [connecting, setConnecting] = useState<string | null>(null); // id del nodo cuyo output estamos conectando
  const containerRef = useRef<HTMLDivElement>(null);
  const dragNode = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const panning = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Reset al cerrar.
  useEffect(() => {
    if (!open) {
      setConnecting(null);
    }
  }, [open]);

  // ─── Zoom (Ctrl + rueda) ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !open) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        setZoom((z) => {
          const next = Math.max(0.3, Math.min(2, z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
          const f = next / z;
          setPan((p) => ({ x: px - (px - p.x) * f, y: py - (py - p.y) * f }));
          return next;
        });
      } else {
        e.preventDefault();
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [open]);

  // ─── Pan del fondo ────────────────────────────────────────────────────
  const onBgMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setConnecting(null);
    panning.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (panning.current) {
        setPan({
          x: panning.current.px + (e.clientX - panning.current.x),
          y: panning.current.py + (e.clientY - panning.current.y),
        });
      } else if (dragNode.current) {
        const { id, offX, offY } = dragNode.current;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - pan.x) / zoom - offX;
        const y = (e.clientY - rect.top - pan.y) / zoom - offY;
        setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x, y } : n)));
      }
    };
    const onUp = () => {
      panning.current = null;
      dragNode.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pan, zoom]);

  // ─── Nodos ────────────────────────────────────────────────────────────
  const addNode = (type: NodeType) => {
    const id = `n-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    // Posición: centro del viewport actual.
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - pan.x) / zoom - NODE_W / 2 : 100;
    const cy = rect ? (rect.height / 2 - pan.y) / zoom - NODE_H / 2 : 100;
    setNodes((ns) => [
      ...ns,
      { id, type, x: cx + ns.length * 20, y: cy + ns.length * 12, inputFrom: null },
    ]);
  };

  const updateNode = (id: string, patch: Partial<CanvasNode>) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNode = (id: string) => {
    setNodes((ns) =>
      ns.filter((n) => n.id !== id).map((n) => (n.inputFrom === id ? { ...n, inputFrom: null } : n)),
    );
  };

  const startNodeDrag = (id: string, e: React.MouseEvent) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;
    dragNode.current = { id, offX: mx - n.x, offY: my - n.y };
  };

  // Conexión: click en el puerto de salida -> click en el de entrada.
  const onOutputClick = (id: string) => setConnecting(id);
  const onInputClick = (id: string) => {
    if (connecting && connecting !== id) {
      updateNode(id, { inputFrom: connecting });
    }
    setConnecting(null);
  };

  // ─── Subir imagen para un nodo source ─────────────────────────────────
  const uploadToNode = async (id: string, file: File) => {
    updateNode(id, { running: true, error: undefined });
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${apiBase}/experimental/creative/upload-local`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      const data = await res.json();
      updateNode(id, { outputUrl: data.url, outputKind: 'image', running: false });
    } catch {
      updateNode(id, { error: 'Error subiendo', running: false });
    }
  };

  // ─── Ejecutar un nodo ─────────────────────────────────────────────────
  const runNode = async (node: CanvasNode) => {
    updateNode(node.id, { running: true, error: undefined });
    try {
      if (node.type === 'generate-image') {
        const res = await fetch(`${apiBase}/experimental/creative/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ prompt: node.prompt || 'imagen profesional', aspectRatio: '1:1' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        updateNode(node.id, { outputUrl: data.localUrl || data.url, outputKind: 'image', running: false });
      } else if (node.type === 'to-video') {
        const input = nodes.find((n) => n.id === node.inputFrom);
        const imageUrl = input?.outputUrl;
        if (!imageUrl) throw new Error('Conectá una imagen de entrada');
        const res = await fetch(`${apiBase}/experimental/creative/image-to-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ imageUrl, prompt: node.prompt || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        updateNode(node.id, { outputUrl: data.localUrl || data.url, outputKind: 'video', running: false });
      }
    } catch (e: any) {
      updateNode(node.id, { error: e?.message || 'Error', running: false });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-zinc-900 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center">
                <Workflow className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Workflow Creativo</h2>
                <p className="text-zinc-400 text-xs">Conectá nodos: imagen → video. Ctrl+rueda zoom, arrastrá el fondo para mover.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Toolbar agregar nodo */}
              <button onClick={() => addNode('source')} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-sky-400" /> Imagen origen
              </button>
              <button onClick={() => addNode('generate-image')} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-violet-400" /> Generar imagen
              </button>
              <button onClick={() => addNode('to-video')} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-fuchsia-400" /> A video
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            onMouseDown={onBgMouseDown}
            className="flex-1 relative overflow-hidden cursor-grab"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          >
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-zinc-600">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Agregá un nodo desde la barra de arriba para empezar.</p>
                  <p className="text-xs mt-1">Ej: Generar imagen → A video.</p>
                </div>
              </div>
            )}

            {/* Conexiones SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {nodes.map((n) => {
                if (!n.inputFrom) return null;
                const from = nodes.find((x) => x.id === n.inputFrom);
                if (!from) return null;
                const x1 = (from.x + NODE_W) * zoom + pan.x;
                const y1 = (from.y + NODE_H / 2) * zoom + pan.y;
                const x2 = n.x * zoom + pan.x;
                const y2 = (n.y + NODE_H / 2) * zoom + pan.y;
                const mid = (x1 + x2) / 2;
                return (
                  <path
                    key={`edge-${n.id}`}
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="none"
                  />
                );
              })}
            </svg>

            {/* Nodos */}
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                zoom={zoom}
                pan={pan}
                connecting={connecting}
                onHeaderMouseDown={(e) => startNodeDrag(node.id, e)}
                onDelete={() => deleteNode(node.id)}
                onPromptChange={(p) => updateNode(node.id, { prompt: p })}
                onRun={() => runNode(node)}
                onUpload={(f) => uploadToNode(node.id, f)}
                onOutputClick={() => onOutputClick(node.id)}
                onInputClick={() => onInputClick(node.id)}
                onUse={() => node.outputUrl && onUseAsset?.(node.outputUrl, node.outputKind || 'image')}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Node card ───────────────────────────────────────────────────────────

const NodeCard: React.FC<{
  node: CanvasNode;
  zoom: number;
  pan: { x: number; y: number };
  connecting: string | null;
  onHeaderMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onPromptChange: (p: string) => void;
  onRun: () => void;
  onUpload: (f: File) => void;
  onOutputClick: () => void;
  onInputClick: () => void;
  onUse: () => void;
}> = ({ node, zoom, pan, connecting, onHeaderMouseDown, onDelete, onPromptChange, onRun, onUpload, onOutputClick, onInputClick, onUse }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = {
    source: { label: 'Imagen origen', icon: Upload, iconClass: 'text-sky-400' },
    'generate-image': { label: 'Generar imagen', icon: Wand2, iconClass: 'text-violet-400' },
    'to-video': { label: 'A video', icon: Film, iconClass: 'text-fuchsia-400' },
  }[node.type];
  const Icon = meta.icon;
  const hasInput = node.type === 'to-video';
  const hasOutput = true;

  return (
    <div
      className="absolute bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl"
      style={{
        left: node.x * zoom + pan.x,
        top: node.y * zoom + pan.y,
        width: NODE_W * zoom,
        transform: `scale(1)`,
        transformOrigin: '0 0',
      }}
    >
      {/* Header (arrastrable) */}
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center justify-between px-3 py-2 border-b border-white/5 cursor-move"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${meta.iconClass}`} />
          <span className="text-xs font-bold text-white">{meta.label}</span>
        </div>
        <button onClick={onDelete} className="text-zinc-500 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Puerto de entrada */}
      {hasInput && (
        <button
          onClick={onInputClick}
          title="Conectar entrada"
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-700 border-2 border-fuchsia-400 hover:scale-125 transition-transform"
        />
      )}
      {/* Puerto de salida */}
      {hasOutput && (
        <button
          onClick={onOutputClick}
          title="Conectar salida"
          className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 hover:scale-125 transition-transform ${
            connecting === node.id ? 'bg-violet-500 border-violet-300 scale-125' : 'bg-zinc-700 border-violet-400'
          }`}
        />
      )}

      <div className="p-3 space-y-2">
        {/* Cuerpo según tipo */}
        {node.type === 'source' && !node.outputUrl && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 rounded-lg border border-dashed border-white/15 text-zinc-400 hover:border-sky-400 hover:text-white flex flex-col items-center justify-center gap-1.5"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Subir imagen</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </button>
        )}
        {(node.type === 'generate-image' || node.type === 'to-video') && (
          <textarea
            value={node.prompt || ''}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={node.type === 'generate-image' ? 'Describe la imagen…' : 'Movimiento (opcional)…'}
            rows={2}
            className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
          />
        )}

        {/* Resultado */}
        {node.outputUrl && (
          <div className="rounded-lg overflow-hidden border border-white/10">
            {node.outputKind === 'video' ? (
              <video src={node.outputUrl} controls loop muted className="w-full" />
            ) : (
              <img src={node.outputUrl} alt="" className="w-full" />
            )}
          </div>
        )}

        {node.error && <p className="text-[10px] text-red-400">{node.error}</p>}

        {/* Acciones */}
        <div className="flex gap-1.5">
          {node.type !== 'source' && (
            <button
              onClick={onRun}
              disabled={node.running}
              className="flex-1 px-2 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-violet-700 disabled:opacity-50"
            >
              {node.running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {node.running ? '…' : 'Ejecutar'}
            </button>
          )}
          {node.outputUrl && (
            <button onClick={onUse} title="Usar en la web" className="px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20">
              Usar
            </button>
          )}
          {node.outputUrl && (
            <a href={node.outputUrl} download className="px-2 py-1.5 rounded-lg bg-white/10 text-white flex items-center hover:bg-white/20">
              <Download className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
