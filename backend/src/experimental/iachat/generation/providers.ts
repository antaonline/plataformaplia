import { Logger } from '@nestjs/common';
import axios from 'axios';
import { ChatMsg, CodegenProvider, CompleteOptions } from './codegen.types';

const logger = new Logger('CodegenProviders');

function toText(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Tarifas aprox USD por 1M tokens (input/output). Ajustables por env.
function rateFor(model: string): { in: number; out: number } {
  const m = (model || '').toLowerCase();
  if (m.includes('opus')) return { in: 15, out: 75 };
  if (m.includes('haiku')) return { in: 0.8, out: 4 };
  if (m.includes('sonnet') || m.includes('claude')) return { in: 3, out: 15 };
  if (m.includes('gemini')) return { in: 0.1, out: 0.4 };
  return { in: 2.5, out: 10 }; // openai gpt-4o por defecto
}

// Loggea tokens y costo estimado de UNA llamada (para calibrar precios).
function logUsage(
  provider: string,
  model: string,
  inTok: number,
  outTok: number,
): number {
  if (!inTok && !outTok) return 0;
  const r = rateFor(model);
  const cost = (inTok * r.in + outTok * r.out) / 1_000_000;
  logger.log(
    `[CostMeter] ${provider} model=${model} in=${inTok} out=${outTok} est=$${cost.toFixed(
      4,
    )}`,
  );
  return cost;
}

/**
 * Reintenta una llamada cuando el proveedor responde rate-limit/overloaded
 * (429/503/529) o error de red, con backoff exponencial + jitter. Asi el
 * tier free (Gemini, limites bajos) deja de reventar en 429.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 4,
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (e: any) {
      attempt += 1;
      const status = e?.response?.status;
      const retriable =
        status === 429 ||
        status === 503 ||
        status === 529 ||
        status === 500 ||
        e?.code === 'ECONNRESET' ||
        e?.code === 'ETIMEDOUT';
      if (!retriable) throw e;

      // 429 = rate limit por minuto / por dia. Reintentar el MISMO modelo
      // 3 veces con backoff exponencial gasta 12+ segundos antes de pasar
      // al siguiente modelo del chain (que tiene su propia cuota). Para
      // 429 cortamos en 1 reintento rapido y dejamos que el FallbackProvider
      // rote al siguiente modelo. Para 503/500/ECONN si seguimos hasta
      // maxAttempts porque suelen ser hipo de red.
      const isQuota = status === 429;
      const effectiveMax = isQuota ? 2 : maxAttempts;
      if (attempt >= effectiveMax) throw e;

      const retryAfter = Number(e?.response?.headers?.['retry-after']);
      const base = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 3000)
        : isQuota
          ? 800 // 429: pausa minima, luego saltamos al fallback
          : Math.min(1500 * 2 ** (attempt - 1), 20_000);
      const wait = base + Math.floor(Math.random() * 400);
      logger.warn(
        `${label}: ${status || e?.code || 'error'} -> reintento ${attempt}/${effectiveMax - 1} en ${wait}ms`,
      );
      await sleep(wait);
    }
  }
}

/**
 * Claude (Anthropic Messages API). Lo que usa Claudable.
 * Inerte si no hay ANTHROPIC_API_KEY: isAvailable() devuelve false.
 */
export class ClaudeProvider implements CodegenProvider {
  readonly id = 'claude';

  private get key() {
    return process.env.ANTHROPIC_API_KEY || '';
  }
  private get model() {
    return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  }

  isAvailable(): boolean {
    return this.key.length > 0;
  }

  async complete(
    system: string,
    messages: ChatMsg[],
    opts: CompleteOptions = {},
  ): Promise<string> {
    const model = opts.model || this.model;
    // Bloques de imagen (multimodal) para Claude: data URL -> base64,
    // http(s) -> source url. Se adjuntan al ULTIMO mensaje de usuario.
    const imageBlocks = (opts.images || [])
      .map((src) => {
        if (/^data:image\/(\w+);base64,/.test(src)) {
          const m = src.match(/^data:image\/(\w+);base64,(.*)$/);
          if (!m) return null;
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: `image/${m[1]}`,
              data: m[2],
            },
          };
        }
        if (/^https?:\/\//.test(src)) {
          return { type: 'image', source: { type: 'url', url: src } };
        }
        return null;
      })
      .filter(Boolean);

    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    const builtMessages = messages.map((m, i) => {
      if (i === lastUserIdx && imageBlocks.length > 0) {
        return {
          role: m.role,
          content: [
            ...imageBlocks,
            { type: 'text', text: m.content },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const res = await withRetry(
      () =>
        axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model,
            max_tokens: Math.min(opts.maxTokens ?? 8192, 8192), // claude-sonnet-4-6 max real
            temperature: opts.temperature ?? 0.7,
            system,
            messages: builtMessages,
          },
          {
            headers: {
              'x-api-key': this.key,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            timeout: 150_000,
          },
        ),
      'claude',
    );
    opts.onUsage?.(
      logUsage(
        'claude',
        model,
        res.data?.usage?.input_tokens || 0,
        res.data?.usage?.output_tokens || 0,
      ),
    );
    const parts = res.data?.content;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => toText(p?.text)).join('');
    }
    return '';
  }
}

/**
 * Gemini (Google Generative Language API), modernizado.
 * Modelo por defecto actual (env GEMINI_MODEL), no el viejo 1.5-flash.
 */
export class GeminiProvider implements CodegenProvider {
  readonly id = 'gemini';

  private get key() {
    return process.env.GOOGLE_GEMINI_KEY || '';
  }
  private get model() {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  isAvailable(): boolean {
    return this.key.length > 0;
  }

  async complete(
    system: string,
    messages: ChatMsg[],
    opts: CompleteOptions = {},
  ): Promise<string> {
    const model = opts.model || this.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.key}`;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const generationConfig: Record<string, any> = {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 8192,
    };
    if (opts.json) generationConfig.response_mime_type = 'application/json';

    const res = await withRetry(
      () =>
        axios.post(
          url,
          {
            contents,
            system_instruction: { parts: [{ text: system }] },
            generationConfig,
          },
          { timeout: 180_000 },
        ),
      'gemini',
    );

    const um = res.data?.usageMetadata;
    opts.onUsage?.(
      logUsage(
        'gemini',
        model,
        um?.promptTokenCount || 0,
        um?.candidatesTokenCount || 0,
      ),
    );
    const cand = res.data?.candidates?.[0];
    const parts = cand?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => toText(p?.text)).join('');
    }
    return '';
  }
}

/**
 * OpenAI (chat/completions). Se usa como fallback automatico si Gemini
 * falla (historicamente inestable) y mientras no haya clave de Anthropic.
 */
export class OpenAiProvider implements CodegenProvider {
  readonly id = 'openai';

  private get key() {
    return process.env.OPENAI_API_KEY || '';
  }
  private get baseUrl() {
    return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }
  private get model() {
    return process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o';
  }

  isAvailable(): boolean {
    return this.key.length > 0;
  }

  async complete(
    system: string,
    messages: ChatMsg[],
    opts: CompleteOptions = {},
  ): Promise<string> {
    const res = await withRetry(
      () =>
        axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages: [
              { role: 'system', content: system },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: opts.temperature ?? 0.7,
            max_tokens: opts.maxTokens ?? 16000,
            ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${this.key}`,
              'Content-Type': 'application/json',
            },
            timeout: 180_000,
          },
        ),
      'openai',
    );
    opts.onUsage?.(
      logUsage(
        'openai',
        this.model,
        res.data?.usage?.prompt_tokens || 0,
        res.data?.usage?.completion_tokens || 0,
      ),
    );
    return toText(res.data?.choices?.[0]?.message?.content);
  }
}

const claude = new ClaudeProvider();
const gemini = new GeminiProvider();
const openai = new OpenAiProvider();

export const PROVIDERS = { claude, gemini, openai };

// ─── Circuit breaker por proveedor ───────────────────────────────────
// Si un provider dispara 429 (rate limit / cuota) repetidamente, dejamos
// de intentarlo durante un periodo de gracia para no malgastar latencia.
// El chain entonces salta directo al siguiente provider disponible.
// Se resetea solo cuando expira el cooldown.
interface BreakerState {
  failures: number;
  cooledUntil: number; // epoch ms; 0 si esta sano
}
const BREAKER_THRESHOLD = 3; // 3 x 429 seguidos -> abrir
const BREAKER_COOLDOWN_MS = 60_000; // 60s sin intentar ese provider
const breakers: Record<string, BreakerState> = {};

function isProviderCooled(id: string): boolean {
  const b = breakers[id];
  if (!b) return false;
  if (b.cooledUntil > Date.now()) return true;
  if (b.cooledUntil !== 0 && b.cooledUntil <= Date.now()) {
    // Cooldown expiro; reseteamos para dar otra oportunidad.
    breakers[id] = { failures: 0, cooledUntil: 0 };
  }
  return false;
}

function noteProviderFailure(id: string, status: number | undefined): void {
  if (status !== 429) return; // solo cuotas; 503/500 son transitorios
  const b = breakers[id] || { failures: 0, cooledUntil: 0 };
  b.failures += 1;
  if (b.failures >= BREAKER_THRESHOLD && b.cooledUntil === 0) {
    b.cooledUntil = Date.now() + BREAKER_COOLDOWN_MS;
    logger.warn(
      `[breaker] ${id} abierto (${b.failures} x 429 seguidos). Saltando ${BREAKER_COOLDOWN_MS / 1000}s.`,
    );
  }
  breakers[id] = b;
}

function noteProviderSuccess(id: string): void {
  if (breakers[id]?.failures) {
    breakers[id] = { failures: 0, cooledUntil: 0 };
  }
}

export function getBreakerSnapshot() {
  return JSON.parse(JSON.stringify(breakers));
}

/**
 * Dado un nombre de modelo, retorna el provider que sabe llamarlo. Permite
 * cadenas de fallback que mezclen Google + Anthropic + OpenAI sin tener que
 * configurar el provider explicitamente para cada eslabon.
 */
export function resolveProviderForModel(model: string): CodegenProvider {
  const m = (model || '').toLowerCase();
  if (m.includes('claude')) return claude;
  if (m.startsWith('gemini') || m.startsWith('gemma')) return gemini;
  if (m.startsWith('gpt') || m.includes('openai')) return openai;
  // Default: gemini (el catch-all mas barato del freemium).
  return gemini;
}

/**
 * Indica si un provider esta en cooldown por circuit breaker. El codegen
 * lo usa para saltar todos los modelos de ese provider en el chain.
 */
export function isProviderOpen(providerId: string): boolean {
  return isProviderCooled(providerId);
}

/**
 * Notifica resultado de UNA llamada al breaker. El codegen llama esto tras
 * cada intento de completeWithChain para que el breaker se entere de los
 * 429 sin tener que envolver cada provider.
 */
export function recordProviderResult(
  providerId: string,
  ok: boolean,
  status?: number,
): void {
  if (ok) noteProviderSuccess(providerId);
  else noteProviderFailure(providerId, status);
}

/**
 * Provider con fallback automatico: intenta el preferido y si lanza error
 * o no esta disponible, cae al siguiente disponible. Respeta el circuit
 * breaker para no malgastar tiempo en providers en cooldown.
 */
export class FallbackProvider implements CodegenProvider {
  readonly id: string;
  constructor(private chain: CodegenProvider[]) {
    this.id = chain.map((p) => p.id).join('>');
  }

  isAvailable(): boolean {
    return this.chain.some((p) => p.isAvailable());
  }

  async complete(
    system: string,
    messages: ChatMsg[],
    opts?: CompleteOptions,
  ): Promise<string> {
    let lastErr: unknown;
    for (const p of this.chain) {
      if (!p.isAvailable()) continue;
      if (isProviderCooled(p.id)) {
        logger.warn(`[breaker] skip ${p.id} (en cooldown)`);
        continue;
      }
      try {
        const out = await p.complete(system, messages, opts);
        if (out && out.trim().length > 0) {
          noteProviderSuccess(p.id);
          return out;
        }
        lastErr = new Error(`${p.id} devolvio respuesta vacia`);
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status;
        noteProviderFailure(p.id, status);
        const body = e?.response?.data
          ? JSON.stringify(e.response.data).slice(0, 600)
          : e?.message || String(e);
        logger.warn(
          `Provider ${p.id} fallo (${status || ''}). Detalle: ${body}`,
        );
      }
    }
    throw lastErr || new Error('Ningun proveedor de codegen disponible');
  }
}
