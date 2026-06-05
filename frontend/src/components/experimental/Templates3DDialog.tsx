"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Box,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  Wand2,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

/**
 * Catalogo de templates 3D premium con preview en iframe y wizard que
 * captura los inputs del cliente para instanciar el template seleccionado.
 *
 * Flujo:
 *   1. Abre dialog (trigger externo).
 *   2. Fetch GET /experimental/templates-3d -> lista de templates.
 *   3. Cliente clickea un template -> entra al wizard.
 *   4. Wizard captura inputs por pasos (paleta, nombre, features, model).
 *   5. POST /experimental/templates-3d/:slug/preview con el input ->
 *      HTML como string que se carga en iframe srcDoc para preview live.
 *   6. Boton "Usar este template" llama a onUseTemplate(slug, input, html)
 *      que el padre usa para guardar en el proyecto.
 */

export interface Template3DMeta {
  slug: string;
  name: string;
  description: string;
  minPlan: 'free' | 'starter' | 'pro' | 'studio';
  previewUrl?: string;
  tags: string[];
}

export interface ProductShowcaseInput {
  productName: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  model:
    | { kind: 'gltf'; url: string }
    | {
        kind: 'placeholder';
        shape: 'box' | 'sphere' | 'torusKnot' | 'torus';
        primaryColor: string;
        accentColor?: string;
      };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  fonts: { heading: string; body: string };
  features: { icon?: string; label: string }[];
}

interface Props {
  open: boolean;
  /** Plan slug del usuario (studio-free/starter/pro/agency). */
  userPlanSlug?: string;
  /** Base URL del backend (sin trailing slash). */
  apiBase: string;
  /** JWT del usuario. */
  authToken: string;
  /** Paleta inicial sugerida del proyecto (para pre-rellenar el wizard). */
  initialPalette?: ProductShowcaseInput['palette'];
  initialFonts?: ProductShowcaseInput['fonts'];
  onClose: () => void;
  /** Callback cuando el cliente confirma. El padre decide qué hacer con el HTML. */
  onUseTemplate: (slug: string, input: any, html: string) => Promise<void> | void;
}

// Orden de planes para comparar nivel.
const PLAN_ORDER: Record<string, number> = {
  'studio-free': 0,
  'studio-starter': 1,
  'studio-pro': 2,
  'studio-agency': 3,
};
const MIN_PLAN_TO_SLUG: Record<Template3DMeta['minPlan'], string> = {
  free: 'studio-free',
  starter: 'studio-starter',
  pro: 'studio-pro',
  studio: 'studio-agency',
};

function userMeetsPlan(userSlug: string | undefined, minPlan: Template3DMeta['minPlan']): boolean {
  const u = PLAN_ORDER[userSlug || 'studio-free'] ?? 0;
  const r = PLAN_ORDER[MIN_PLAN_TO_SLUG[minPlan]] ?? 0;
  return u >= r;
}

// Defaults seguros del input del product showcase.
function defaultShowcaseInput(palette?: ProductShowcaseInput['palette'], fonts?: ProductShowcaseInput['fonts']): ProductShowcaseInput {
  return {
    productName: 'Mi Producto',
    tagline: 'La proxima generacion en diseno.',
    description:
      'Cada detalle pensado al milimetro. Lo que pasa cuando obsesionarse con la calidad paga.',
    ctaText: 'Comprar ahora',
    ctaHref: '#comprar',
    model: {
      kind: 'placeholder',
      shape: 'torusKnot',
      primaryColor: palette?.primary || '#FF4D00',
      accentColor: palette?.accent || '#00E5FF',
    },
    palette: palette || {
      primary: '#FF4D00',
      secondary: '#1A1A1A',
      accent: '#00E5FF',
      bg: '#0A0A0A',
      text: '#FFFFFF',
    },
    fonts: fonts || { heading: 'Inter', body: 'Inter' },
    features: [
      { label: 'Calidad premium' },
      { label: 'Edicion limitada' },
      { label: 'Hecho a mano' },
    ],
  };
}

export const Templates3DDialog: React.FC<Props> = ({
  open,
  userPlanSlug,
  apiBase,
  authToken,
  initialPalette,
  initialFonts,
  onClose,
  onUseTemplate,
}) => {
  // Estados
  const [templates, setTemplates] = useState<Template3DMeta[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [step, setStep] = useState<'catalog' | 'wizard' | 'preview'>('catalog');
  const [input, setInput] = useState<ProductShowcaseInput>(
    defaultShowcaseInput(initialPalette, initialFonts),
  );
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Cargar catalogo cuando se abre el dialog.
  useEffect(() => {
    if (!open) return;
    setLoadError(null);
    setTemplates(null);
    fetch(`${apiBase}/experimental/templates-3d`)
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch((e) => setLoadError(e?.message || 'No se pudo cargar el catalogo'));
  }, [open, apiBase]);

  // Reset al cerrar.
  useEffect(() => {
    if (!open) {
      setStep('catalog');
      setSelectedSlug(null);
      setPreviewHtml('');
      setInput(defaultShowcaseInput(initialPalette, initialFonts));
    }
  }, [open, initialPalette, initialFonts]);

  const selectedMeta = useMemo(
    () => templates?.find((t) => t.slug === selectedSlug) || null,
    [templates, selectedSlug],
  );

  // Disparar preview live cuando el wizard cambia.
  const refreshPreview = async () => {
    if (!selectedSlug) return;
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/experimental/templates-3d/${selectedSlug}/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(input),
        },
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const html = await res.text();
      setPreviewHtml(html);
    } catch (e: any) {
      setPreviewHtml(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;color:#dc2626"><h2>Error</h2><p>${e?.message || 'Sin detalles'}</p></body></html>`,
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectTemplate = (meta: Template3DMeta) => {
    if (!userMeetsPlan(userPlanSlug, meta.minPlan)) return; // bloqueado, no hacer nada
    setSelectedSlug(meta.slug);
    setStep('wizard');
  };

  const handleGoPreview = async () => {
    setStep('preview');
    await refreshPreview();
  };

  const handleConfirm = async () => {
    if (!selectedSlug || !previewHtml) return;
    setConfirming(true);
    try {
      await onUseTemplate(selectedSlug, input, previewHtml);
      onClose();
    } finally {
      setConfirming(false);
    }
  };

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
            className="relative w-[min(1200px,95vw)] h-[min(800px,92vh)] bg-zinc-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <Box className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Templates 3D Premium</h2>
                  <p className="text-zinc-400 text-xs">
                    {step === 'catalog' && 'Elegí un template para empezar'}
                    {step === 'wizard' && selectedMeta?.name}
                    {step === 'preview' && 'Vista previa en vivo'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step !== 'catalog' && (
                  <button
                    onClick={() => setStep(step === 'preview' ? 'wizard' : 'catalog')}
                    className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Atras
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {step === 'catalog' && (
                <CatalogStep
                  templates={templates}
                  loadError={loadError}
                  userPlanSlug={userPlanSlug}
                  onSelect={handleSelectTemplate}
                />
              )}
              {step === 'wizard' && selectedMeta && (
                <WizardStep
                  meta={selectedMeta}
                  input={input}
                  onChange={setInput}
                  onPreview={handleGoPreview}
                />
              )}
              {step === 'preview' && selectedMeta && (
                <PreviewStep
                  html={previewHtml}
                  loading={previewLoading}
                  onRefresh={refreshPreview}
                  onConfirm={handleConfirm}
                  confirming={confirming}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------------------------------------------------------------------------
// Step: Catalog
// ---------------------------------------------------------------------------

const CatalogStep: React.FC<{
  templates: Template3DMeta[] | null;
  loadError: string | null;
  userPlanSlug?: string;
  onSelect: (t: Template3DMeta) => void;
}> = ({ templates, loadError, userPlanSlug, onSelect }) => {
  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 px-8 text-center">
        <div>
          <p className="font-semibold mb-1">No se pudo cargar el catalogo</p>
          <p className="text-sm opacity-75">{loadError}</p>
        </div>
      </div>
    );
  }
  if (!templates) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (templates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        Todavia no hay templates 3D disponibles. Pronto se agregan mas.
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
      {templates.map((t) => {
        const allowed = userMeetsPlan(userPlanSlug, t.minPlan);
        return (
          <motion.button
            key={t.slug}
            whileHover={allowed ? { y: -4 } : undefined}
            onClick={() => onSelect(t)}
            disabled={!allowed}
            className={`relative text-left rounded-xl border overflow-hidden transition-all ${
              allowed
                ? 'border-white/10 bg-zinc-900 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer'
                : 'border-white/5 bg-zinc-900/50 cursor-not-allowed opacity-60'
            }`}
          >
            {/* Preview area (gradient mock por ahora) */}
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-orange-500/30 via-pink-500/20 to-cyan-500/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <Box className="w-12 h-12 text-white/40" />
              </div>
              {!allowed && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                    <Lock className="w-3 h-3" /> Plan {t.minPlan.toUpperCase()}
                  </div>
                </div>
              )}
              {allowed && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-orange-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
                  {t.minPlan === 'free' ? 'Gratis' : t.minPlan}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold mb-1">{t.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-3">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {t.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step: Wizard (capturar input)
// ---------------------------------------------------------------------------

const WizardStep: React.FC<{
  meta: Template3DMeta;
  input: ProductShowcaseInput;
  onChange: (i: ProductShowcaseInput) => void;
  onPreview: () => void;
}> = ({ meta, input, onChange, onPreview }) => {
  const patch = (p: Partial<ProductShowcaseInput>) => onChange({ ...input, ...p });
  const patchPalette = (k: keyof ProductShowcaseInput['palette'], v: string) =>
    onChange({ ...input, palette: { ...input.palette, [k]: v } });
  const patchModel = (m: ProductShowcaseInput['model']) => onChange({ ...input, model: m });
  const patchFeatureAt = (idx: number, value: string) => {
    const next = [...input.features];
    next[idx] = { ...next[idx], label: value };
    onChange({ ...input, features: next });
  };
  const addFeature = () => {
    if (input.features.length >= 6) return;
    onChange({ ...input, features: [...input.features, { label: '' }] });
  };
  const removeFeature = (idx: number) => {
    onChange({ ...input, features: input.features.filter((_, i) => i !== idx) });
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Section: Basico */}
        <Section title="1. Lo basico">
          <Field label="Nombre del producto / marca">
            <input
              type="text"
              value={input.productName}
              onChange={(e) => patch({ productName: e.target.value })}
              placeholder="Ej: AERO X1"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
            />
          </Field>
          <Field label="Tagline corto (subtitulo del hero)">
            <input
              type="text"
              value={input.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
              placeholder="Velocidad reimaginada"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
            />
          </Field>
          <Field label="Descripcion completa">
            <textarea
              value={input.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={3}
              placeholder="Cuenta la historia del producto..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
            />
          </Field>
        </Section>

        {/* Section: CTA */}
        <Section title="2. Boton de accion (CTA)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto del boton">
              <input
                type="text"
                value={input.ctaText}
                onChange={(e) => patch({ ctaText: e.target.value })}
                placeholder="Comprar ahora"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </Field>
            <Field label="Link / Anchor del boton">
              <input
                type="text"
                value={input.ctaHref}
                onChange={(e) => patch({ ctaHref: e.target.value })}
                placeholder="#comprar"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </Field>
          </div>
        </Section>

        {/* Section: Modelo 3D */}
        <Section title="3. Modelo 3D del producto">
          <div className="flex gap-2 mb-3">
            <RadioPill
              active={input.model.kind === 'placeholder'}
              onClick={() =>
                patchModel({
                  kind: 'placeholder',
                  shape: 'torusKnot',
                  primaryColor: input.palette.primary,
                  accentColor: input.palette.accent,
                })
              }
            >
              Forma geometrica (rapido)
            </RadioPill>
            <RadioPill
              active={input.model.kind === 'gltf'}
              onClick={() => patchModel({ kind: 'gltf', url: '' })}
            >
              Subir modelo .glb/.gltf
            </RadioPill>
          </div>

          {input.model.kind === 'placeholder' && (
            <div>
              <Field label="Forma del placeholder">
                <div className="grid grid-cols-4 gap-2">
                  {(['box', 'sphere', 'torus', 'torusKnot'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        patchModel({
                          kind: 'placeholder',
                          shape: s,
                          primaryColor:
                            input.model.kind === 'placeholder' ? input.model.primaryColor : input.palette.primary,
                          accentColor:
                            input.model.kind === 'placeholder' ? input.model.accentColor : input.palette.accent,
                        })
                      }
                      className={`px-3 py-2 rounded-lg text-sm border transition ${
                        input.model.kind === 'placeholder' && input.model.shape === s
                          ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                          : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {input.model.kind === 'gltf' && (
            <Field label="URL del modelo .glb/.gltf">
              <input
                type="url"
                value={input.model.url}
                onChange={(e) => patchModel({ kind: 'gltf', url: e.target.value })}
                placeholder="https://.../producto.glb"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Subi tu .glb a uploads/ desde el editor o pega un URL publico.
              </p>
            </Field>
          )}
        </Section>

        {/* Section: Paleta */}
        <Section title="4. Paleta de colores">
          <div className="grid grid-cols-5 gap-3">
            {(['primary', 'secondary', 'accent', 'bg', 'text'] as const).map((k) => (
              <div key={k}>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  {k}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={input.palette[k]}
                    onChange={(e) => patchPalette(k, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={input.palette[k]}
                    onChange={(e) => patchPalette(k, e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 text-xs rounded bg-zinc-900 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section: Features */}
        <Section title="5. Features (chips)">
          <div className="space-y-2">
            {input.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={f.label}
                  onChange={(e) => patchFeatureAt(i, e.target.value)}
                  placeholder="Ej: Fibra de carbono"
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => removeFeature(i)}
                  className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {input.features.length < 6 && (
              <button
                onClick={addFeature}
                className="w-full px-3 py-2 rounded-lg border border-dashed border-white/10 text-zinc-400 hover:text-white hover:border-white/30 text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar feature
              </button>
            )}
          </div>
        </Section>

        {/* Footer CTA */}
        <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-zinc-950 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onPreview}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold flex items-center gap-2 hover:opacity-90"
          >
            <Eye className="w-4 h-4" />
            Ver preview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step: Preview en iframe
// ---------------------------------------------------------------------------

const PreviewStep: React.FC<{
  html: string;
  loading: boolean;
  onRefresh: () => void;
  onConfirm: () => void;
  confirming: boolean;
}> = ({ html, loading, onRefresh, onConfirm, confirming }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Hacé scroll en la preview para ver el efecto 3D scroll-driven</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" /> Refrescar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || confirming || !html}
            className="px-5 py-1.5 text-sm rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Usar este template
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 bg-black relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
            <div className="flex flex-col items-center gap-3 text-zinc-300">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Renderizando escena 3D...</span>
            </div>
          </div>
        )}
        {html && (
          <iframe
            srcDoc={html}
            title="Preview template 3D"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponentes utilitarios
// ---------------------------------------------------------------------------

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const RadioPill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm border transition ${
      active
        ? 'border-orange-500 bg-orange-500/10 text-orange-300'
        : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20'
    }`}
  >
    {children}
  </button>
);
