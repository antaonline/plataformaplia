"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Video,
  Layers,
  Sparkles,
  Loader2,
  Upload,
  Wand2,
  Download,
  Lock,
  Film,
  Check,
} from 'lucide-react';

/**
 * Estudio Creativo: panel flotante con pestañas para generar imágenes
 * (Flux), convertir imágenes en video (Kling/Veo) y gestionar los assets
 * generados/subidos. Primer paso del entorno creativo unificado.
 *
 * Backend: /experimental/creative/* (Muapi).
 */

type Tab = 'image' | 'video' | 'assets';

export interface CreativeAsset {
  id: string;
  kind: 'image' | 'video';
  url: string; // localUrl persistente
  prompt?: string;
  createdAt: number;
}

interface CreativeCaps {
  canUseFlux: boolean;
  canUseVideo: boolean;
  planName: string;
}

interface Props {
  open: boolean;
  apiBase: string;
  authToken: string;
  onClose: () => void;
  /** Cuando el cliente elige "usar este asset" en su web. */
  onUseAsset?: (asset: CreativeAsset) => void;
}

export const CreativeStudioDialog: React.FC<Props> = ({
  open,
  apiBase,
  authToken,
  onClose,
  onUseAsset,
}) => {
  const [tab, setTab] = useState<Tab>('image');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [caps, setCaps] = useState<CreativeCaps | null>(null);
  const [assets, setAssets] = useState<CreativeAsset[]>([]);

  // Cargar modelos/capabilities al abrir.
  useEffect(() => {
    if (!open) return;
    fetch(`${apiBase}/experimental/creative/models`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setConfigured(!!data.configured);
        setCaps(data.capabilities || null);
      })
      .catch(() => setConfigured(false));
  }, [open, apiBase, authToken]);

  const addAsset = useCallback((a: CreativeAsset) => {
    setAssets((prev) => [a, ...prev]);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-[min(1100px,95vw)] h-[min(760px,92vh)] bg-zinc-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header + tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Estudio Creativo</h2>
                  <p className="text-zinc-400 text-xs">
                    Generá imágenes, convertilas en video, usá tus propias fotos
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-white/5">
              <TabButton active={tab === 'image'} onClick={() => setTab('image')} icon={ImageIcon} label="Imagen" />
              <TabButton active={tab === 'video'} onClick={() => setTab('video')} icon={Video} label="Video" />
              <TabButton
                active={tab === 'assets'}
                onClick={() => setTab('assets')}
                icon={Layers}
                label={`Mis assets${assets.length ? ` (${assets.length})` : ''}`}
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {configured === false ? (
                <div className="h-full flex items-center justify-center text-center px-8">
                  <div className="text-zinc-400">
                    <Wand2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-white mb-1">Estudio creativo no configurado</p>
                    <p className="text-sm">Falta la API key de Muapi en el servidor. Avisá a soporte.</p>
                  </div>
                </div>
              ) : tab === 'image' ? (
                <ImageTab apiBase={apiBase} authToken={authToken} caps={caps} onGenerated={addAsset} />
              ) : tab === 'video' ? (
                <VideoTab apiBase={apiBase} authToken={authToken} caps={caps} assets={assets} onGenerated={addAsset} />
              ) : (
                <AssetsTab assets={assets} onUseAsset={onUseAsset} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ───────────────────────────────────────────────────────────────────────
// Tab: Imagen
// ───────────────────────────────────────────────────────────────────────

const ImageTab: React.FC<{
  apiBase: string;
  authToken: string;
  caps: CreativeCaps | null;
  onGenerated: (a: CreativeAsset) => void;
}> = ({ apiBase, authToken, caps, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked = caps && !caps.canUseFlux;

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/experimental/creative/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio: aspect }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Error generando');
      const url = data.localUrl || data.url;
      if (!url) throw new Error('No se recibió la imagen');
      setResult(url);
      onGenerated({ id: `img-${Date.now()}`, kind: 'image', url, prompt: prompt.trim(), createdAt: Date.now() });
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (locked) return <LockedPanel feature="Generación de imágenes con IA" plan={caps?.planName} />;

  return (
    <div className="h-full flex">
      <div className="w-[380px] border-r border-white/5 p-6 flex flex-col gap-4 overflow-y-auto">
        <Field label="¿Qué imagen querés generar?">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Ej: una pizza artesanal con albahaca fresca sobre mesa de madera rústica, luz cálida"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
          />
        </Field>
        <Field label="Formato">
          <div className="grid grid-cols-3 gap-2">
            {['1:1', '16:9', '9:16'].map((a) => (
              <button
                key={a}
                onClick={() => setAspect(a)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  aspect === a ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>
        <button
          onClick={generate}
          disabled={!prompt.trim() || loading}
          className="mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? 'Generando…' : 'Generar imagen'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="flex-1 p-6 flex items-center justify-center bg-black/20">
        {loading ? (
          <div className="text-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Creando tu imagen con IA…</p>
          </div>
        ) : result ? (
          <div className="text-center">
            <img src={result} alt="generada" className="max-w-full max-h-[420px] rounded-2xl shadow-2xl mb-3" />
            <a href={result} download className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
              <Download className="w-4 h-4" /> Descargar
            </a>
          </div>
        ) : (
          <div className="text-center text-zinc-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tu imagen va a aparecer acá</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────
// Tab: Video (imagen a video)
// ───────────────────────────────────────────────────────────────────────

const VideoTab: React.FC<{
  apiBase: string;
  authToken: string;
  caps: CreativeCaps | null;
  assets: CreativeAsset[];
  onGenerated: (a: CreativeAsset) => void;
}> = ({ apiBase, authToken, caps, assets, onGenerated }) => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const locked = caps && !caps.canUseVideo;
  const imageAssets = assets.filter((a) => a.kind === 'image');

  const handleUpload = async (file: File) => {
    setError(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${apiBase}/experimental/creative/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error subiendo');
      setSourceUrl(data.url);
    } catch (e: any) {
      setError(e?.message || 'Error subiendo imagen');
    }
  };

  const generate = async () => {
    if (!sourceUrl || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/experimental/creative/image-to-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ imageUrl: sourceUrl, prompt: prompt.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Error generando video');
      const url = data.localUrl || data.url;
      if (!url) throw new Error('No se recibió el video');
      setResult(url);
      onGenerated({ id: `vid-${Date.now()}`, kind: 'video', url, prompt: prompt.trim(), createdAt: Date.now() });
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (locked) return <LockedPanel feature="Generación de video" plan={caps?.planName} requiredPlan="Pro" />;

  return (
    <div className="h-full flex">
      <div className="w-[380px] border-r border-white/5 p-6 flex flex-col gap-4 overflow-y-auto">
        <Field label="Imagen de origen">
          {sourceUrl ? (
            <div className="relative">
              <img src={sourceUrl} alt="origen" className="w-full h-40 object-cover rounded-lg" />
              <button onClick={() => setSourceUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full px-3 py-6 rounded-lg border border-dashed border-white/15 text-zinc-400 hover:border-violet-500/50 hover:text-white flex flex-col items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Subí una imagen</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              {imageAssets.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">O usá una generada</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageAssets.slice(0, 6).map((a) => (
                      <button key={a.id} onClick={() => setSourceUrl(a.url)} className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500">
                        <img src={a.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Field>
        <Field label="Movimiento (opcional)">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: zoom lento, humo subiendo, cámara orbitando"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>
        <button
          onClick={generate}
          disabled={!sourceUrl || loading}
          className="mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          {loading ? 'Generando video…' : 'Convertir en video'}
        </button>
        <p className="text-[10px] text-zinc-500 text-center">El video puede tardar 1-3 minutos.</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="flex-1 p-6 flex items-center justify-center bg-black/20">
        {loading ? (
          <div className="text-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Generando tu video con IA…<br />Esto toma 1-3 minutos.</p>
          </div>
        ) : result ? (
          <div className="text-center">
            <video src={result} controls autoPlay loop muted className="max-w-full max-h-[420px] rounded-2xl shadow-2xl mb-3" />
            <a href={result} download className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
              <Download className="w-4 h-4" /> Descargar
            </a>
          </div>
        ) : (
          <div className="text-center text-zinc-600">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tu video va a aparecer acá</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────
// Tab: Mis assets
// ───────────────────────────────────────────────────────────────────────

const AssetsTab: React.FC<{
  assets: CreativeAsset[];
  onUseAsset?: (a: CreativeAsset) => void;
}> = ({ assets, onUseAsset }) => {
  if (assets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center text-zinc-600">
        <div>
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Todavía no generaste ningún asset.<br />Creá imágenes o videos en las otras pestañas.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
      {assets.map((a) => (
        <div key={a.id} className="group rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative">
          <div className="aspect-square bg-black/40">
            {a.kind === 'video' ? (
              <video src={a.url} muted loop className="w-full h-full object-cover" onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} />
            ) : (
              <img src={a.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            {onUseAsset && (
              <button onClick={() => onUseAsset(a)} className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Usar en mi web
              </button>
            )}
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white uppercase tracking-wider font-bold">
            {a.kind === 'video' ? 'Video' : 'Imagen'}
          </div>
        </div>
      ))}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────
// Utilitarios
// ───────────────────────────────────────────────────────────────────────

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
      active ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
    }`}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const LockedPanel: React.FC<{ feature: string; plan?: string; requiredPlan?: string }> = ({ feature, plan, requiredPlan }) => (
  <div className="h-full flex items-center justify-center text-center px-8">
    <div className="max-w-sm">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-violet-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{feature}</h3>
      <p className="text-zinc-400 text-sm mb-1">
        Tu plan {plan ? <span className="text-white font-semibold">{plan}</span> : 'actual'} no incluye esta herramienta.
      </p>
      <p className="text-violet-300 text-sm font-semibold">
        Disponible desde el plan {requiredPlan || 'Starter'}.
      </p>
    </div>
  </div>
);
