/**
 * Configuracion de planes del Studio iachat (freemium + pago).
 *
 * Calibrado con costo REAL medido (Claude Sonnet: build ~$0.55, edit ~$0.16;
 * Haiku ~1/12; Gemini ~$0). 1 credito ≡ $0.10 de costo real (ver codegen).
 * Topes conservadores -> margen sano garantizado.
 */

export type PlanCode = 'EXPLORADOR' | 'PRESENCIA' | 'EMPRENDEDOR' | 'AGENCIA';

export type ProviderKind = 'gemini' | 'claude';

export interface PlanConfig {
  code: PlanCode;
  label: string;
  /** Proveedor base (free=gemini, pago=claude con fallback). */
  provider: ProviderKind;
  /** Modelo para la fase de PLAN (barato). */
  planModel: string;
  /** Modelo para generar archivos en una WEB NUEVA. */
  buildModel: string;
  /** Modelo para generar archivos en una EDICION. */
  editModel: string;
  /** Tope de creditos por dia. */
  dailyCredits: number;
  /** Tope de creditos por mes. */
  monthlyCredits: number;
}

const M = {
  gemini: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  haiku: process.env.ANTHROPIC_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
  sonnet:
    process.env.ANTHROPIC_MODEL_SONNET ||
    process.env.ANTHROPIC_MODEL ||
    'claude-sonnet-4-6',
};

export const PLANS: Record<PlanCode, PlanConfig> = {
  EXPLORADOR: {
    code: 'EXPLORADOR',
    label: 'Explorador',
    provider: 'gemini',
    planModel: M.gemini,
    buildModel: M.gemini,
    editModel: M.gemini,
    dailyCredits: 5,
    monthlyCredits: 30,
  },
  PRESENCIA: {
    code: 'PRESENCIA',
    label: 'Presencia',
    provider: 'claude',
    planModel: M.haiku,
    buildModel: M.haiku,
    editModel: M.haiku,
    dailyCredits: 10,
    monthlyCredits: 100,
  },
  EMPRENDEDOR: {
    code: 'EMPRENDEDOR',
    label: 'Emprendedor',
    provider: 'claude',
    planModel: M.haiku, // plan = barato
    buildModel: M.sonnet, // web nueva = calidad alta
    editModel: M.haiku, // ediciones = baratas
    dailyCredits: 15,
    monthlyCredits: 150,
  },
  AGENCIA: {
    code: 'AGENCIA',
    label: 'Agencia',
    provider: 'claude',
    planModel: M.haiku,
    buildModel: M.sonnet,
    editModel: M.haiku,
    dailyCredits: 20,
    monthlyCredits: 400,
  },
};

export function getPlan(code: string | null | undefined): PlanConfig {
  const c = (code || '').toUpperCase();
  return (PLANS as Record<string, PlanConfig>)[c] || PLANS.EXPLORADOR;
}
