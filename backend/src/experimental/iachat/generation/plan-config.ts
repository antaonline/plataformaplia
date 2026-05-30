/**
 * Configuracion de planes del Studio iachat (freemium + pago).
 *
 * Cada plan define CADENAS de modelos por fase (plan / build / edit). El
 * codegen recorre la cadena en orden: intenta el primer modelo, si responde
 * 429 / 503 / 529 o cae, pasa al siguiente. Esto multiplica el throughput
 * (cada modelo en Google AI Studio tiene su propia cuota RPM/RPD) y aisla
 * caidas de un solo modelo.
 *
 * Calibrado con costo REAL medido (Claude Sonnet: build ~$0.55, edit ~$0.16;
 * Haiku ~1/12; Gemini Flash ~$0). 1 credito ≡ $0.10 de costo real (ver
 * codegen). Topes conservadores -> margen sano garantizado.
 */

export type PlanCode = 'EXPLORADOR' | 'PRESENCIA' | 'EMPRENDEDOR' | 'AGENCIA';

export type ProviderKind = 'gemini' | 'claude';

export interface PlanConfig {
  code: PlanCode;
  label: string;
  /** Proveedor base informativo (free=gemini, pago=claude). */
  provider: ProviderKind;
  /** Cadena de modelos para la fase PLAN (analisis/arquitectura). */
  planModels: string[];
  /** Cadena de modelos para BUILD (primer prompt, web nueva). */
  buildModels: string[];
  /** Cadena de modelos para EDIT (iteraciones sobre web existente). */
  editModels: string[];
  /** Tope de creditos por dia. */
  dailyCredits: number;
  /** Tope de creditos por mes. */
  monthlyCredits: number;
}

const M = {
  geminiLegacy: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  haiku: process.env.ANTHROPIC_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
  sonnet:
    process.env.ANTHROPIC_MODEL_SONNET ||
    process.env.ANTHROPIC_MODEL ||
    'claude-sonnet-4-6',
};

// ===== Cadenas reusables =====
// Modelos REALES disponibles en Google AI Studio Nivel 1 (paid) hoy:
//   gemini-2.0-flash, gemini-2.0-flash-lite
//   gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite
//   gemini-3.5-flash, gemini-3.1-flash-lite
// Limites (Nivel 1): Pro=150 RPM/1K RPD, Flash=1K RPM/10K RPD,
// Flash Lite=4K RPM/150K-ilim RPD. Margen amplio.
//
// ESTRATEGIA DE AHORRO: Gemini va PRIMERO en TODAS las cadenas (es 30x mas
// barato que Claude Sonnet). Solo caemos a Claude cuando Gemini falla. El
// orden dentro de Gemini es: el modelo "premium" del tier primero (mejor
// calidad), luego Flash (rapido), luego Flash Lite (alto RPD).
// Claude Haiku/Sonnet siempre al final como fallback duro.

// Freemium BUILD: pide calidad alta. Pro primero (mejor design system),
// Flash variants si Pro rate-limit, Haiku rescate.
const FREE_BUILD_CHAIN = [
  'gemini-2.5-pro',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  M.haiku,
];

// Freemium EDIT/PLAN: Flash + Flash Lite (alta cuota RPM y RPD), Haiku rescate.
const FREE_FLASH_CHAIN = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  M.haiku,
];

const FREE_PLAN_CHAIN = FREE_FLASH_CHAIN;

// Plan pagado basico (PRESENCIA): Flash decente + Flash Lite + Haiku.
const PAID_BASIC_CHAIN = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  M.haiku,
];

// Build de alta calidad (EMPRENDEDOR/AGENCIA): Gemini Pro PRIMERO porque es
// 30x mas barato que Sonnet y produce calidad similar para diseno web.
// Sonnet queda como fallback de calidad garantizada si todos los Gemini
// caen — esto cubre tanto bursts de TPM como caidas de Google.
const PAID_HIGH_BUILD = [
  'gemini-2.5-pro',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  M.sonnet,
];

// Plan / Edit de planes pagos medianos/altos: Flash Lite es ideal para
// edits quirurgicos (4K RPM, 150K RPD). Subimos a Flash si Lite falla.
const PAID_FAST_CHAIN = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  M.haiku,
];

export const PLANS: Record<PlanCode, PlanConfig> = {
  EXPLORADOR: {
    code: 'EXPLORADOR',
    label: 'Explorador',
    provider: 'gemini',
    planModels: FREE_PLAN_CHAIN,
    buildModels: FREE_BUILD_CHAIN,
    editModels: FREE_FLASH_CHAIN,
    // Bump del free tier: con FAST PATH (skip plan en edits quirurgicos)
    // un turn de edicion cuesta ~0.3-0.6 creditos en lugar de 1+.
    // Asi el usuario gratuito tiene margen real para iterar antes de pagar.
    dailyCredits: 15,
    monthlyCredits: 80,
  },
  PRESENCIA: {
    code: 'PRESENCIA',
    label: 'Presencia',
    provider: 'claude',
    planModels: PAID_BASIC_CHAIN,
    buildModels: PAID_BASIC_CHAIN,
    editModels: PAID_BASIC_CHAIN,
    // 1 proyecto serio + ~80 edits chicos/dia. ~2.5x el free.
    dailyCredits: 40,
    monthlyCredits: 250,
  },
  EMPRENDEDOR: {
    code: 'EMPRENDEDOR',
    label: 'Emprendedor',
    provider: 'claude',
    planModels: PAID_FAST_CHAIN, // plan = barato
    buildModels: PAID_HIGH_BUILD, // web nueva = calidad alta
    editModels: PAID_FAST_CHAIN, // ediciones = baratas
    // Power user con varios proyectos en paralelo. ~2.5x Presencia.
    dailyCredits: 100,
    monthlyCredits: 600,
  },
  AGENCIA: {
    code: 'AGENCIA',
    label: 'Agencia',
    provider: 'claude',
    planModels: PAID_FAST_CHAIN,
    buildModels: PAID_HIGH_BUILD,
    editModels: PAID_FAST_CHAIN,
    // Agencias con multiples clientes en paralelo. ~2.5x Emprendedor.
    dailyCredits: 250,
    monthlyCredits: 1500,
  },
};

export function getPlan(code: string | null | undefined): PlanConfig {
  const c = (code || '').toUpperCase();
  return (PLANS as Record<string, PlanConfig>)[c] || PLANS.EXPLORADOR;
}
