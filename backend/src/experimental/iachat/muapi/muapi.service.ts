import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Cliente del API de Muapi (https://muapi.ai). Muapi es un gateway unificado
 * pay-per-use a 200+ modelos de imagen/video (Flux, Kling, Veo, Seedance,
 * WAN, etc). Reemplaza a Higgsfield directo: sin suscripción, sin créditos
 * que vencen.
 *
 * Patrón de la API:
 *   - POST https://api.muapi.ai/api/v1/{endpoint}  -> { request_id }
 *   - GET  https://api.muapi.ai/api/v1/predictions/{request_id}/result
 *     (poll cada ~2s hasta status final con la URL del asset)
 *   - POST https://api.muapi.ai/api/v1/upload_file (multipart) -> { url }
 *   - Header: x-api-key: <MUAPI_API_KEY>
 *
 * Los nombres exactos de endpoint por modelo se mantienen en MODEL_REGISTRY
 * (configurable). Si Muapi cambia un endpoint, se ajusta ahí sin tocar la
 * lógica.
 */

export type MuapiKind = 'image' | 'video';

export interface MuapiModel {
  /** ID amigable usado internamente y por el frontend. */
  id: string;
  kind: MuapiKind;
  /** Endpoint REST en api.muapi.ai/api/v1/<endpoint>. */
  endpoint: string;
  /** Etiqueta para mostrar en la UI. */
  label: string;
  /** Costo estimado USD por generación (para presupuesto/credit). */
  costUsd: number;
  /** Si requiere image_url de entrada (image-to-video, etc). */
  requiresImage?: boolean;
}

/**
 * Registro de modelos. Los endpoint names siguen el patrón visto en la doc
 * (generate_<model>). Ajustables vía env si Muapi los renombra.
 */
// Endpoints CONFIRMADOS contra el OpenAPI real de Muapi
// (https://api.muapi.ai/openapi.json). El path es el slug directo, sin
// prefijo "generate_". Ajustables por env por si Muapi versiona.
const MODEL_REGISTRY: Record<string, MuapiModel> = {
  // ─── Imagen (Flux) ────────────────────────────────────────────────────
  'flux-dev': {
    id: 'flux-dev',
    kind: 'image',
    endpoint: process.env.MUAPI_EP_FLUX_DEV || 'flux-dev-image',
    label: 'Flux Dev (alta calidad)',
    costUsd: 0.03,
  },
  'flux-schnell': {
    id: 'flux-schnell',
    kind: 'image',
    endpoint: process.env.MUAPI_EP_FLUX_SCHNELL || 'flux-schnell-image',
    label: 'Flux Schnell (rápido)',
    costUsd: 0.02,
  },
  // ─── Video imagen-a-video (Veo 3) ─────────────────────────────────────
  'veo-fast-i2v': {
    id: 'veo-fast-i2v',
    kind: 'video',
    endpoint:
      process.env.MUAPI_EP_VEO_FAST_I2V || 'veo3-fast-image-to-video',
    label: 'Veo 3 Fast — imagen a video',
    costUsd: 0.8,
    requiresImage: true,
  },
  'veo-i2v': {
    id: 'veo-i2v',
    kind: 'video',
    endpoint: process.env.MUAPI_EP_VEO_I2V || 'veo3-image-to-video',
    label: 'Veo 3 — imagen a video (premium)',
    costUsd: 2.0,
    requiresImage: true,
  },
  // ─── Video texto-a-video (Veo 3) ──────────────────────────────────────
  'veo-t2v': {
    id: 'veo-t2v',
    kind: 'video',
    endpoint: process.env.MUAPI_EP_VEO_T2V || 'veo3-text-to-video',
    label: 'Veo 3 — texto a video',
    costUsd: 1.5,
  },
};

export interface MuapiGenerateParams {
  modelId: string;
  prompt?: string;
  imageUrl?: string;
  aspectRatio?: string; // '16:9' | '9:16' | '1:1'
  durationSeconds?: number;
  resolution?: string; // '480p' | '720p' | '1080p'
  quality?: string; // 'low' | 'medium' | 'high'
}

export interface MuapiResult {
  ok: boolean;
  /** URL del asset generado (imagen/video). */
  url?: string;
  /** Asset persistido localmente (uploads/media) si lo descargamos. */
  localUrl?: string;
  requestId?: string;
  error?: string;
  costUsd?: number;
}

@Injectable()
export class MuapiService {
  private readonly logger = new Logger(MuapiService.name);
  private readonly base =
    (process.env.MUAPI_BASE_URL || 'https://api.muapi.ai').replace(/\/$/, '') +
    '/api/v1';

  private get apiKey(): string {
    return process.env.MUAPI_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  listModels(kind?: MuapiKind): MuapiModel[] {
    const all = Object.values(MODEL_REGISTRY);
    return kind ? all.filter((m) => m.kind === kind) : all;
  }

  getModel(id: string): MuapiModel | null {
    return MODEL_REGISTRY[id] || null;
  }

  /**
   * Sube un archivo (imagen del cliente) a Muapi y devuelve su URL pública
   * (presigned, expira ~1h — suficiente para usarla como input de un video).
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<string | null> {
    if (!this.isConfigured()) return null;
    try {
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('file', buffer, { filename });
      const res = await axios.post(`${this.base}/upload_file`, form, {
        headers: {
          'x-api-key': this.apiKey,
          ...form.getHeaders(),
        },
        timeout: 60_000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      return res.data?.url || null;
    } catch (e: any) {
      this.logger.warn(`[muapi] upload_file falló: ${e?.message || e}`);
      return null;
    }
  }

  /**
   * Genera imagen o video. Envía el job, hace polling hasta tener el
   * resultado, opcionalmente lo descarga a uploads/media para persistencia
   * (las URLs de Muapi expiran).
   */
  async generate(params: MuapiGenerateParams): Promise<MuapiResult> {
    if (!this.isConfigured()) {
      return { ok: false, error: 'MUAPI_API_KEY no configurada en .env' };
    }
    const model = this.getModel(params.modelId);
    if (!model) {
      return { ok: false, error: `Modelo "${params.modelId}" no existe` };
    }
    if (model.requiresImage && !params.imageUrl) {
      return {
        ok: false,
        error: `El modelo ${model.label} requiere una imagen de entrada`,
      };
    }

    // Construir el body según el tipo de modelo.
    const body: Record<string, any> = {};
    if (params.prompt) body.prompt = params.prompt;
    if (params.imageUrl) body.image_url = params.imageUrl;
    if (params.aspectRatio) body.aspect_ratio = params.aspectRatio;
    if (params.durationSeconds) body.duration = params.durationSeconds;
    if (params.resolution) body.resolution = params.resolution;
    if (params.quality) body.quality = params.quality;

    let requestId: string;
    try {
      const submit = await axios.post(`${this.base}/${model.endpoint}`, body, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60_000,
      });
      requestId =
        submit.data?.request_id ||
        submit.data?.id ||
        submit.data?.requestId;
      if (!requestId) {
        // Algunos endpoints devuelven el resultado directo (síncrono).
        const directUrl = this.extractUrl(submit.data);
        if (directUrl) {
          const localUrl = await this.downloadAsset(directUrl, model.kind);
          return {
            ok: true,
            url: directUrl,
            localUrl: localUrl || undefined,
            costUsd: model.costUsd,
          };
        }
        return { ok: false, error: 'Muapi no devolvió request_id ni resultado' };
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message;
      this.logger.warn(`[muapi] submit ${model.endpoint} falló: ${msg}`);
      return { ok: false, error: String(msg).slice(0, 200) };
    }

    // Polling del resultado.
    const result = await this.pollResult(requestId, model.kind);
    if (!result) {
      return { ok: false, requestId, error: 'Timeout esperando el resultado' };
    }
    const localUrl = await this.downloadAsset(result, model.kind);
    this.logger.log(
      `[muapi] ${model.id} OK request=${requestId} -> ${localUrl || result}`,
    );
    return {
      ok: true,
      url: result,
      localUrl: localUrl || undefined,
      requestId,
      costUsd: model.costUsd,
    };
  }

  /**
   * Hace polling al endpoint de resultado cada 2s hasta que esté listo o
   * timeout (video puede tardar minutos). Devuelve la URL del asset.
   */
  private async pollResult(
    requestId: string,
    kind: MuapiKind,
  ): Promise<string | null> {
    const maxMs = kind === 'video' ? 5 * 60_000 : 90_000;
    const intervalMs = 2500;
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      try {
        const res = await axios.get(
          `${this.base}/predictions/${requestId}/result`,
          {
            headers: { 'x-api-key': this.apiKey },
            timeout: 30_000,
          },
        );
        const status = (res.data?.status || '').toLowerCase();
        const url = this.extractUrl(res.data);
        if (url) return url;
        if (
          status === 'failed' ||
          status === 'error' ||
          status === 'cancelled'
        ) {
          this.logger.warn(
            `[muapi] predicción ${requestId} terminó en ${status}`,
          );
          return null;
        }
        // status pending/processing -> seguir esperando.
      } catch (e: any) {
        // Reintentar en el siguiente tick salvo 404 (request inexistente).
        if (e?.response?.status === 404) return null;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return null;
  }

  /** Extrae la URL del asset de varias formas posibles del response. */
  private extractUrl(data: any): string | null {
    if (!data) return null;
    // Formas comunes: data.url, data.output.url, data.result.url,
    // data.outputs[0].url, data.video_url, data.image_url, data.outputs[0]
    const candidates = [
      data.url,
      data.output_url,
      data.video_url,
      data.image_url,
      data.output?.url,
      data.result?.url,
      Array.isArray(data.outputs) ? data.outputs[0]?.url || data.outputs[0] : null,
      Array.isArray(data.output) ? data.output[0]?.url || data.output[0] : null,
      data.output,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && /^https?:\/\//.test(c)) return c;
    }
    return null;
  }

  /**
   * Descarga el asset de Muapi (cuya URL expira) a uploads/media y devuelve
   * la URL pública persistente. Si falla, devolvemos null y se usa la URL
   * original (efímera).
   */
  private async downloadAsset(
    url: string,
    kind: MuapiKind,
  ): Promise<string | null> {
    try {
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120_000,
        maxContentLength: Infinity,
      });
      const ext = kind === 'video' ? 'mp4' : 'png';
      const dir = path.join(process.cwd(), 'uploads', 'media');
      await fs.mkdir(dir, { recursive: true });
      const name = `muapi-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(res.data));
      const base = (
        process.env.PUBLIC_API_URL ||
        process.env.PREVIEW_PROXY_BASE ||
        'http://localhost:3002'
      ).replace(/\/$/, '');
      return `${base}/uploads/media/${name}`;
    } catch (e: any) {
      this.logger.warn(`[muapi] downloadAsset falló: ${e?.message || e}`);
      return null;
    }
  }
}
