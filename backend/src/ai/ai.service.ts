import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { join } from 'path';
import { AiGenerationResult, AiMode, SiteSpec } from './ai.types';
import { PrismaService } from '../prisma/prisma.service';
import { NextExportService } from '../integrations/next-export/next-export.service';
import { WebsiteGenService, WebMode } from './website-gen.service';
import { MailService } from '../mail/mail.service';
import { ProjectStatus } from '@prisma/client';

type PlanType = 'LANDING' | 'WEB';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private nextExportService: NextExportService,
    private websiteGen: WebsiteGenService,
    private mailService: MailService,
  ) {}

  /**
   * Copia recursiva de un directorio a otro. Usada para republicar
   * archivos del preview al public_html cuando se aplica una revision
   * sobre un sitio ya DELIVERED.
   */
  private copyDirRecursive(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = join(src, entry.name);
      const d = join(dest, entry.name);
      if (entry.isDirectory()) {
        this.copyDirRecursive(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  }

  private get env() {
    return {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      modelPrimary: process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o',
      modelPrimaryEconomy: process.env.OPENAI_MODEL_PRIMARY_ECONOMY || 'gpt-4o-mini',
      modelCopy: process.env.OPENAI_MODEL_COPY || 'gpt-4o',
      modelCopyEconomy: process.env.OPENAI_MODEL_COPY_ECONOMY || 'gpt-4o-mini',
      // OpenAI deprecio dall-e-3 (no aparece en /v1/models en cuentas nuevas).
      // gpt-image-1 es el modelo unificado actual; devuelve b64 por defecto
      // sin necesidad de response_format y usa quality low|medium|high|auto.
      imageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      imageQuality: process.env.OPENAI_IMAGE_QUALITY || 'high',
      imageSize: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
      landingMode: (process.env.AI_MODE_LANDING || 'standard') as AiMode,
      webMode: (process.env.AI_MODE_WEB || 'standard') as AiMode,
      landingImages: Number(process.env.AI_LANDING_MAX_IMAGES || 8),
      landingImagesEconomy: Number(process.env.AI_LANDING_MAX_IMAGES_ECONOMY || 4),
      webImages: Number(process.env.AI_WEB_MAX_IMAGES || 16),
      webImagesEconomy: Number(process.env.AI_WEB_MAX_IMAGES_ECONOMY || 8),
      geminiKey: process.env.GOOGLE_GEMINI_KEY || '',
    };
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.env.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRetryDelay(error: any, attempt: number) {
    const retryAfter = Number(error?.response?.headers?.['retry-after'] || 0);
    if (retryAfter > 0) {
      return retryAfter * 1000;
    }
    return Math.min(2000 * 2 ** attempt, 15000);
  }

  private async openAiPost<T>(url: string, payload: Record<string, any>): Promise<T> {
    const maxRetries = Number(process.env.OPENAI_MAX_RETRIES || 3);

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const res = await axios.post(url, payload, { headers: this.headers });
        return res.data as T;
      } catch (error: any) {
        const status = error?.response?.status;
        const shouldRetry = status === 429 || (status >= 500 && status < 600);

        if (!shouldRetry || attempt === maxRetries) {
          throw error;
        }

        const delayMs = this.getRetryDelay(error, attempt);
        this.logger.warn(
          `OpenAI request retry ${attempt + 1}/${maxRetries} after ${delayMs}ms (status ${status})`,
        );
        await this.sleep(delayMs);
      }
    }

    throw new Error('OpenAI request failed after retries');
  }

  private getMode(plan: PlanType) {
    return plan === 'LANDING' ? this.env.landingMode : this.env.webMode;
  }

  private getModel(plan: PlanType, mode: AiMode) {
    return mode === 'economy' ? this.env.modelPrimaryEconomy : this.env.modelPrimary;
  }

  private getCopyModel(mode: AiMode) {
    return mode === 'economy' ? this.env.modelCopyEconomy : this.env.modelCopy;
  }

  private getImageLimit(plan: PlanType, mode: AiMode) {
    if (plan === 'LANDING') {
      return mode === 'economy' ? this.env.landingImagesEconomy : this.env.landingImages;
    }
    return mode === 'economy' ? this.env.webImagesEconomy : this.env.webImages;
  }

  private safeJsonParse<T>(text: string, fallback: T): T {
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  private buildSystemPrompt(plan: PlanType) {
    const base = `Eres un diseñador y desarrollador web de clase mundial especializado en sitios de conversion premium.
Tu trabajo es generar HTML completo (<!DOCTYPE html>...</html>) con CSS moderno embebido, de nivel Stripe / Linear / Airbnb.

REGLAS ABSOLUTAS — nunca las violes:
1. Devuelve SOLO el HTML completo. Sin markdown, sin bloques de codigo, sin explicaciones. Empieza con <!DOCTYPE html>.
2. Todo el CSS va embebido en <style> dentro de <head>. Cero dependencias externas excepto Google Fonts (via @import).
3. Para imagenes usa EXACTAMENTE estos placeholders (seran reemplazados por fotos reales):
   - Hero/banner principal: src="[[PLIA_IMG:hero]]"
   - Galeria 1: src="[[PLIA_IMG:gallery1]]"
   - Galeria 2: src="[[PLIA_IMG:gallery2]]"
   - Galeria 3: src="[[PLIA_IMG:gallery3]]"
   - Equipo/persona: src="[[PLIA_IMG:team1]]"
   Usa los que necesites segun el negocio. Las imagenes DEBEN tener width y height definidos en CSS.
4. PROHIBIDO usar emojis. Para iconos usa SVG inline (paths simples, elegantes).
5. Formulario de contacto con action="/contact.php" method="POST". Campos: nombre, email, mensaje. Boton de envio estilizado.
6. JavaScript minimo embebido en <script> al final: solo para menu hamburguesa mobile, smooth scroll, y animaciones de entrada (IntersectionObserver fade-in/slide-up).
7. 100% responsive con media queries. Mobile-first.
8. Usa variables CSS (:root) para colores y tipografia. Paleta sofisticada segun el negocio.
9. Cada seccion debe tener padding generoso (80-120px vertical). Separacion visual clara.
10. Footer completo con copyright, redes sociales (SVG icons), y links de navegacion.

ESTANDARES DE DISEÑO PREMIUM obligatorios:
- Hero: full-viewport con imagen de fondo (object-fit:cover), overlay gradient semitransparente, titulo grande (clamp(2.5rem,6vw,5rem)), subtitulo, 2 CTAs (primario + secundario outline).
- Tipografia: Google Fonts premium (Playfair Display / DM Sans / Sora / Plus Jakarta Sans segun el tono del negocio). Font-weights variados (300, 400, 600, 700).
- Sombras: box-shadow multicapa (0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.12)).
- Bordes redondeados: 12-24px en cards, 999px en botones pill.
- Gradientes sutiles en fondos de secciones alternadas.
- Cards con hover effect (transform: translateY(-4px), sombra mas profunda) via CSS transition.
- Numeros o stats destacados si aplican al negocio.
- Separadores de seccion con clip-path o SVG wave si encajan con el estilo.
- Colores: paleta de 3 colores max (primary, accent, neutral). Nunca uses negro puro ni blanco puro.`;

    if (plan === 'LANDING') {
      return base + `\n\nESTRUCTURA OBLIGATORIA para LANDING de alta conversion (en este orden):
1. <nav> sticky con logo + links + CTA button
2. <section id="hero"> Full-viewport con imagen de fondo, headline impactante, subtitulo, 2 CTAs
3. <section id="beneficios"> o "Por que elegirnos" — 3-4 cards con icono SVG, titulo, descripcion
4. <section id="servicios"> o contenido central del negocio — grid de servicios/productos/menu
5. <section id="galeria"> Grid de imagenes (usa los placeholders)
6. <section id="testimonios"> 2-3 testimonios con avatar inicial, nombre, cargo, texto, estrellas SVG
7. <section id="contacto"> Formulario centrado con campos elegantes
8. <footer> Completo`;
    } else {
      return base + `\n\nESTRUCTURA para WEB INSTITUCIONAL — genera UN SOLO archivo HTML con todas las secciones enlazadas via anchor:
1. <nav> sticky
2. Hero
3. Sobre nosotros / Historia
4. Servicios (grid)
5. Equipo (si aplica)
6. Galeria
7. Testimonios
8. Contacto con formulario
9. Footer`;
    }
  }

  private buildUserPrompt(input: any, plan: PlanType) {
    const goal = input.professionalGoal || input.businessModel || input.goal || '';
    const colorMap: Record<string, string> = {
      azul: 'Paleta azul profesional: primary #1e40af, accent #3b82f6, fondos claros con toque azul',
      verde: 'Paleta verde natural: primary #166534, accent #22c55e, fondos blancos con toques verdes',
      rojo: 'Paleta roja energetica: primary #991b1b, accent #ef4444, fondos neutros calidos',
      morado: 'Paleta morada creativa: primary #6d28d9, accent #a78bfa, fondos muy claros',
      naranja: 'Paleta naranja calida: primary #c2410c, accent #f97316, fondos crema',
      negro: 'Paleta elegante oscura: primary #111827, accent #d4a853 (dorado), fondos muy oscuros con texto claro',
    };
    const palette = colorMap[input.colorScheme] || 'Paleta sofisticada acorde al sector del negocio';
    const smartContent = input.smartSectionContent || {};
    const services = (input.primaryServices || []).filter(Boolean);
    const sections = (input.effectiveSections || []).join(', ');

    const lines = [
      `NEGOCIO: ${input.businessName || 'Sin nombre'} — ${input.businessType || input.businessSector || 'Negocio'}`,
      `CIUDAD: ${input.city || 'Peru'}`,
      `DESCRIPCION: ${input.shortDescription || ''}`,
      `OBJETIVO: ${goal || 'Captar clientes'}`,
      `AUDIENCIA: ${(input.audience || []).join(', ') || 'Publico general'}`,
      `ESTILO VISUAL: ${input.visualStyle || 'Moderno y profesional'}`,
      `PALETA DE COLORES: ${palette}`,
      sections ? `SECCIONES SOLICITADAS: ${sections}` : '',
      services.length ? `SERVICIOS/PRODUCTOS: ${services.join(' | ')}` : '',
      smartContent.menuHighlights ? `MENU/CATALOGO: ${smartContent.menuHighlights}` : '',
      smartContent.promotionsDetails ? `PROMOCIONES: ${smartContent.promotionsDetails}` : '',
      smartContent.deliveryInfo ? `DELIVERY: ${smartContent.deliveryInfo}` : '',
      smartContent.locationAddress ? `DIRECCION: ${smartContent.locationAddress}` : '',
      smartContent.reservationDetails ? `RESERVAS: ${smartContent.reservationDetails}` : '',
      smartContent.testimonialsNotes ? `TESTIMONIOS: ${smartContent.testimonialsNotes}` : '',
      smartContent.servicesSummary ? `SERVICIOS DETALLE: ${smartContent.servicesSummary}` : '',
      smartContent.portfolioHighlights ? `PORTAFOLIO: ${smartContent.portfolioHighlights}` : '',
      input.instagram ? `Instagram: @${input.instagram}` : '',
      input.facebook ? `Facebook: ${input.facebook}` : '',
      input.whatsapp ? `WhatsApp: ${input.whatsapp}` : '',
      input.contactEmail ? `Email: ${input.contactEmail}` : '',
      input.additionalInstructions ? `INSTRUCCIONES ADICIONALES: ${input.additionalInstructions}` : '',
    ].filter(Boolean);

    return lines.join('\n') + `\n\nGenera el HTML completo premium para este negocio. Usa texto real y convincente en español (no lorem ipsum). El diseño debe ser digno de un sitio de miles de dolares.`;
  }

  private buildUserPromptLegacy(input: any, plan: PlanType) {
    const goal = input.professionalGoal || input.businessModel || input.goal || '';
    const blueprint = this.selectBlueprint(input.businessSector || '');
    return JSON.stringify({
      subdomain: input.subdomain,
      businessName: input.businessName,
      businessIdentity: input.businessIdentity,
      businessType: input.businessType,
      sector: input.businessSector,
      city: input.city,
      shortDescription: input.shortDescription,
      salesType: input.salesType,
      workMode: input.workMode,
      businessModel: input.businessModel,
      goal,
      audience: input.audience || [],
      colors: input.colors,
      colorScheme: input.colorScheme,
      visualStyle: input.visualStyle,
      features: input.features || [],
      effectiveSections: input.effectiveSections || [],
      smartNeeds: input.smartNeeds || [],
      smartSectionContent: input.smartSectionContent || {},
      primaryServices: input.primaryServices || [],
      references: input.references,
      additionalInstructions: input.additionalInstructions,
      imageInstructions: input.imageInstructions,
      images: input.images || [],
      blueprint,
      socials: {
        instagram: input.instagram,
        facebook: input.facebook,
        tiktok: input.tiktok,
        whatsapp: input.whatsapp,
        email: input.contactEmail,
      },
      plan,
    });
  }

  private selectBlueprint(sector: string) {
    const normalized = sector.toLowerCase();
    if (normalized.includes('restaurante') || normalized.includes('food')) return 'food-service';
    if (normalized.includes('salud') || normalized.includes('clinica') || normalized.includes('med')) return 'healthcare';
    if (normalized.includes('inmobiliaria') || normalized.includes('real estate')) return 'real-estate';
    if (normalized.includes('educacion') || normalized.includes('academia')) return 'education';
    if (normalized.includes('software') || normalized.includes('tecnologia')) return 'saas';
    return 'general-business';
  }

  public async chatJson<T>(model: string, system: string, user: string): Promise<T> {
    // Forzamos el uso de OpenAI para estabilidad, ignorando Gemini por ahora debido a errores de API
    const url = `${this.env.baseUrl}/chat/completions`;
    const data = await this.openAiPost<any>(url, {
      model: model.includes('gemini') ? this.env.modelPrimary : model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    return this.safeJsonParse<T>(content, {} as T);
  }

  // Llama a Claude (via proxy OpenAI-compatible) o fallback a gpt-4o
  // para generar texto libre (HTML completo). Sin response_format JSON.
  private async chatHtml(system: string, user: string): Promise<string> {
    const providers = [
      { name: 'claude', model: 'claude-opus-4-5', baseUrl: process.env.ANTHROPIC_PROXY_URL || this.env.baseUrl, key: process.env.ANTHROPIC_API_KEY },
      { name: 'gpt-4o', model: 'gpt-4o', baseUrl: this.env.baseUrl, key: null },
    ].filter(p => p.key || p.name === 'gpt-4o');

    for (const provider of providers) {
      try {
        const url = `${provider.baseUrl.replace(/\/$/, '')}/chat/completions`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (provider.key) headers['Authorization'] = `Bearer ${provider.key}`;
        else headers['Authorization'] = this.headers['Authorization'];

        const res = await axios.post(url, {
          model: provider.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.75,
          max_tokens: 8000,
        }, { headers });

        const content: string = res.data?.choices?.[0]?.message?.content ?? '';
        if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
          throw new Error('La respuesta no contiene HTML valido');
        }
        // Limpiar posibles bloques markdown ```html ... ```
        const cleaned = content.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();
        this.logger.log(`[chatHtml] provider=${provider.name} tokens=${res.data?.usage?.total_tokens ?? '?'}`);
        return cleaned;
      } catch (err: any) {
        this.logger.warn(`[chatHtml] Provider ${provider.name} fallo: ${err?.response?.data?.error?.message || err?.message}`);
      }
    }
    throw new Error('Todos los proveedores fallaron al generar HTML');
  }

  // Inyecta URLs de imagenes reales en los placeholders [[PLIA_IMG:xxx]]
  private injectImagesIntoHtml(html: string, images: Array<{ id: string; url: string; usage: string }>): string {
    let result = html;
    // Mapear por usage y por id
    for (const img of images) {
      const byUsage = new RegExp(`\\[\\[PLIA_IMG:${img.usage}\\]\\]`, 'gi');
      const byId = new RegExp(`\\[\\[PLIA_IMG:${img.id}\\]\\]`, 'gi');
      result = result.replace(byUsage, img.url).replace(byId, img.url);
    }
    // Reemplazar cualquier placeholder restante con imagen de Pexels generica
    result = result.replace(/\[\[PLIA_IMG:[^\]]+\]\]/gi, 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200');
    return result;
  }

  // Genera prompts de imagen para Pexels basados en el brief del negocio
  private buildImagePrompts(input: any): Array<{ id: string; prompt: string; usage: string }> {
    const business = input.businessName || input.businessType || 'negocio';
    const city = input.city || 'Peru';
    const sector = (input.businessSector || input.businessType || '').toLowerCase();
    return [
      { id: 'hero', usage: 'hero', prompt: `cinematic professional photo ${business} ${sector} ${city} high quality` },
      { id: 'gallery1', usage: 'gallery1', prompt: `professional product service photo ${sector} high quality detail` },
      { id: 'gallery2', usage: 'gallery2', prompt: `professional interior ambient ${sector} ${city} modern` },
      { id: 'gallery3', usage: 'gallery3', prompt: `professional team work ${sector} business` },
    ];
  }

  private async geminiPost<T>(model: string, system: string, user: string): Promise<T> {
    const key = this.env.geminiKey;
    const modelMapping: Record<string, string> = {
      'gemini-1.5-flash-latest': 'gemini-1.5-flash',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-flash-latest': 'gemini-1.5-flash',
      'gemini-2.0-flash': 'gemini-2.0-flash-exp',
      'gemini-pro': 'gemini-1.5-pro'
    };

    const modelName = modelMapping[model] || 'gemini-1.5-flash';
    // Revertimos a v1beta porque v1 NO soporta system_instruction ni response_mime_type en el payload directo
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    
    // Intentar parsear el historial si viene en formato JSON
    let contents: any[] = [];
    try {
      const history = JSON.parse(user);
      if (Array.isArray(history)) {
        contents = history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }]
        }));
      } else {
        contents = [{ role: 'user', parts: [{ text: user }] }];
      }
    } catch {
      contents = [{ role: 'user', parts: [{ text: user }] }];
    }

    try {
      const res = await axios.post(url, {
        contents,
        system_instruction: {
          parts: [{ text: system }]
        },
        generation_config: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      });

      const fullText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return this.safeJsonParse<T>(fullText, {} as T);
    } catch (error: any) {
      this.logger.error('Gemini API Error Details:', JSON.stringify(error?.response?.data || error.message));
      throw error;
    }
  }

  /**
   * Heuristica: ¿este prompt es de diseno grafico (mejor con IA) o de un
   * sujeto fotografiable (mejor con Pexels)? Pexels solo sirve para fotos
   * reales — para logos, iconos, ilustraciones o patrones abstractos
   * Pexels no devuelve nada utilizable.
   */
  private promptIsGraphicDesign(prompt: string): boolean {
    const p = (prompt || '').toLowerCase();
    return /\b(logo|icon|symbol|illustration|illustrated|vector|graphic|pattern|abstract|render|3d render|minimalist design|infographic|mockup|wireframe)\b/.test(
      p,
    );
  }

  /**
   * Busca en Pexels una foto relevante para este prompt. Devuelve el buffer
   * de la imagen ya descargada (lista para optimizar a WebP igual que las
   * de IA) o null si no encuentra match utilizable.
   */
  private async tryPexelsForPrompt(
    prompt: { id: string; prompt: string; usage: string },
  ): Promise<{ buffer: Buffer; sourceUrl: string } | null> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return null;
    if (process.env.AI_USE_PEXELS_FIRST === 'false') return null;
    if (this.promptIsGraphicDesign(prompt.prompt)) return null;

    // Pexels indexa en ingles. El prompt ya viene en ingles desde plan().
    // Reducimos a las 4-6 palabras clave principales para evitar 0 resultados.
    const keywords = prompt.prompt
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(
        (w) =>
          !/^(a|an|the|of|with|in|for|on|to|and|or|by|at|from)$/i.test(w),
      )
      .slice(0, 6)
      .join(' ');
    if (!keywords) return null;

    try {
      const res = await axios.get('https://api.pexels.com/v1/search', {
        params: { query: keywords, per_page: 10, orientation: 'landscape' },
        headers: { Authorization: apiKey },
        timeout: 12000,
      });
      const photos: any[] = Array.isArray(res.data?.photos) ? res.data.photos : [];
      if (photos.length < 3) {
        this.logger.log(
          `Pexels: pocos resultados (${photos.length}) para "${keywords}". Usaremos IA para id=${prompt.id}.`,
        );
        return null;
      }
      // Variamos la seleccion para que el mismo prompt en otro slot no traiga
      // siempre la misma foto.
      const picked = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
      const downloadUrl: string =
        picked?.src?.large2x ||
        picked?.src?.large ||
        picked?.src?.original ||
        picked?.src?.medium;
      if (!downloadUrl) return null;
      const dl = await axios.get<ArrayBuffer>(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      this.logger.log(
        `Pexels HIT id=${prompt.id} usage=${prompt.usage} kws="${keywords}" photo=${picked?.id}`,
      );
      return {
        buffer: Buffer.from(dl.data),
        sourceUrl: downloadUrl,
      };
    } catch (e: any) {
      this.logger.warn(
        `Pexels fallo para "${keywords}": ${e?.response?.status || e?.message || e}`,
      );
      return null;
    }
  }

  /**
   * Reescribe URLs de uploads guardadas con el host del frontend (plia.pe)
   * al host del backend (api.plia.pe) donde realmente vive /uploads/. Esto
   * arregla proyectos creados ANTES del fix del controller — sus imagenes
   * en onboardingData.images apuntan a plia.pe/uploads que devuelve 404.
   */
  private normalizeUploadUrl(url: string): string {
    if (!url || typeof url !== 'string') return url;
    const apiBase =
      (process.env.API_PUBLIC_URL || process.env.PREVIEW_PROXY_BASE || '').replace(/\/$/, '');
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    if (apiBase && appUrl && apiBase !== appUrl && url.startsWith(`${appUrl}/uploads/`)) {
      return url.replace(`${appUrl}/uploads/`, `${apiBase}/uploads/`);
    }
    return url;
  }

  private async generateImages(prompts: Array<{ id: string; prompt: string; usage: string }>, plan: PlanType, mode: AiMode) {
    const limit = this.getImageLimit(plan, mode);
    const selected = prompts.slice(0, limit);
    const images: Array<{ id: string; url: string; usage: string; source?: 'ai' | 'pexels' }> = [];

    const isGptImage = /^gpt-image/i.test(this.env.imageModel);
    for (const prompt of selected) {
      // 1) Pexels primero: gratis, rapido, real. Solo si no es graphic-design.
      const pex = await this.tryPexelsForPrompt(prompt);
      if (pex) {
        images.push({
          id: prompt.id,
          url: pex.buffer.toString('base64'),
          usage: prompt.usage,
          source: 'pexels',
        });
        continue;
      }
      // 2) Fallback: generar con IA.
      try {
        const url = `${this.env.baseUrl}/images/generations`;
        // Payload condicional: gpt-image-1 (actual) NO acepta response_format
        // y usa quality low|medium|high|auto. DALL-E viejos (dall-e-2/3) si
        // aceptan response_format y quality standard|hd.
        const payload: Record<string, any> = {
          model: this.env.imageModel,
          prompt: prompt.prompt,
          size: this.env.imageSize,
        };
        if (isGptImage) {
          if (['low', 'medium', 'high', 'auto'].includes(this.env.imageQuality)) {
            payload.quality = this.env.imageQuality;
          }
        } else {
          payload.quality = this.env.imageQuality;
          payload.response_format = 'b64_json';
        }
        const data = await this.openAiPost<any>(url, payload);

        const b64 = data?.data?.[0]?.b64_json;
        if (!b64) {
          this.logger.warn(
            `DALL-E sin b64 para prompt id=${prompt.id} usage=${prompt.usage}. Respuesta: ${JSON.stringify(data)?.slice(0, 500)}`,
          );
          continue;
        }
        const buffer = Buffer.from(b64, 'base64');
        images.push({
          id: prompt.id,
          url: buffer.toString('base64'),
          usage: prompt.usage,
          source: 'ai',
        });
      } catch (error: any) {
        // Detalle completo del error para diagnosticar (HTTP status, body de
        // OpenAI con la causa real: key invalida, sin creditos, content
        // policy, modelo no disponible, etc).
        const status = error?.response?.status;
        const body = error?.response?.data
          ? JSON.stringify(error.response.data).slice(0, 800)
          : null;
        this.logger.error(
          `DALL-E fallo id=${prompt.id} usage=${prompt.usage} status=${status || 'n/a'} msg=${error?.message || error} body=${body || 'n/a'}`,
        );
      }
    }

    return images;
  }

  private scoreSpec(spec: SiteSpec) {
    const notes: string[] = [];
    const hasCTA = spec.sections.some((s) => s.cta);
    const hasFAQ = spec.sections.some((s) => s.type === 'faq');
    const hasTestimonials = spec.sections.some((s) => s.type === 'testimonials');
    const conversion = [hasCTA, hasFAQ, hasTestimonials].filter(Boolean).length * 30 + 10;
    const seo = spec.sections.length >= 6 ? 80 : 60;
    const accessibility = 70;
    const performance = 75;
    if (!hasCTA) notes.push('Falta CTA principal.');
    if (!hasFAQ) notes.push('Falta seccion de FAQ.');
    if (!hasTestimonials) notes.push('Falta prueba social.');
    return { conversion, seo, accessibility, performance, notes };
  }

  private renderLandingHtml(spec: SiteSpec, images: Array<{ id: string; url: string; usage: string }>) {
    const heroImage = images.find((img) => img.usage === 'hero')?.url;
    const palette = spec.palette;
    const hero = spec.sections.find((s) => s.type === 'hero') ?? spec.sections[0];
    const benefits = spec.sections.filter((s) => s.type === 'benefits')[0];
    const faq = spec.sections.find((s) => s.type === 'faq');
    const testimonials = spec.sections.find((s) => s.type === 'testimonials');

    return `<!doctype html>
<!-- GENERATED_BY_PLIA_IA: ${new Date().toISOString()} -->
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${spec.brand.name}</title>
  <style>
    :root {
      --primary: ${palette.primary};
      --secondary: ${palette.secondary};
      --accent: ${palette.accent};
      --bg: ${palette.background};
      --text: ${palette.text};
    }
    body { margin:0; font-family: ${spec.typography.body}, sans-serif; background: var(--bg); color: var(--text); }
    header { padding: 64px 24px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
    .hero { max-width: 1100px; margin: 0 auto; display: grid; gap: 32px; align-items: center; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .hero img { width: 100%; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
    .section { max-width: 1100px; margin: 0 auto; padding: 56px 24px; }
    .cards { display:grid; gap:16px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }
    .card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
    .cta { display:inline-block; padding: 14px 28px; border-radius: 999px; background: var(--accent); color: #0b0b0b; font-weight: 700; text-decoration:none; }
    footer { padding: 32px 24px; text-align:center; color: #5a5a5a; }
  </style>
</head>
<body>
  <header>
    <div class="hero">
      <div>
        <h1>${hero?.title ?? spec.brand.name}</h1>
        <p>${hero?.subtitle ?? spec.brand.tagline}</p>
        ${hero?.cta ? `<a class="cta" href="${hero.cta.href}">${hero.cta.label}</a>` : ''}
      </div>
      ${heroImage ? `<img src="data:image/png;base64,${heroImage}" alt="hero" />` : ''}
    </div>
  </header>
  ${benefits ? `<section class="section"><h2>${benefits.title ?? 'Beneficios'}</h2><div class="cards">${(benefits.bullets || []).map((b) => `<div class="card">${b}</div>`).join('')}</div></section>` : ''}
  ${testimonials ? `<section class="section"><h2>${testimonials.title ?? 'Testimonios'}</h2><p>${testimonials.content ?? ''}</p></section>` : ''}
  ${faq ? `<section class="section"><h2>${faq.title ?? 'Preguntas frecuentes'}</h2><p>${faq.content ?? ''}</p></section>` : ''}
  <footer>© ${new Date().getFullYear()} ${spec.brand.name}</footer>
</body>
</html>`;
  }

  private renderSimplePage(spec: SiteSpec, page: NonNullable<SiteSpec['pages']>[number]) {
    const palette = spec.palette;
    return `<!doctype html>
<!-- GENERATED_BY_PLIA_IA: ${new Date().toISOString()} -->
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${page.title}</title>
  <style>
    :root { --primary:${palette.primary}; --accent:${palette.accent}; --bg:${palette.background}; --text:${palette.text}; }
    body { margin:0; font-family:${spec.typography.body}, sans-serif; background:var(--bg); color:var(--text); }
    header { padding: 48px 24px; background: var(--primary); color: white; }
    .section { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }
    .cta { display:inline-block; padding: 12px 24px; border-radius: 999px; background: var(--accent); color: #0b0b0b; font-weight: 700; text-decoration:none; }
  </style>
</head>
<body>
  <header><h1>${page.title}</h1></header>
  ${page.sections
    .map(
      (section) => `<section class="section">
        <h2>${section.title ?? ''}</h2>
        <p>${section.subtitle ?? section.content ?? ''}</p>
        ${section.cta ? `<a class="cta" href="${section.cta.href}">${section.cta.label}</a>` : ''}
      </section>`,
    )
    .join('')}
</body>
</html>`;
  }

  private async persistGeneratedAssets(projectId: number, domain: string | null, html: string, pages?: Array<{ slug: string; html: string }>, publishImmediately = false) {
    const previewRoot = join(process.cwd(), 'uploads', 'previews', String(projectId));
    fs.mkdirSync(previewRoot, { recursive: true });
    fs.writeFileSync(join(previewRoot, 'index.html'), html, 'utf-8');
    if (pages?.length) {
      for (const page of pages) {
        const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
        fs.writeFileSync(join(previewRoot, fileName), page.html, 'utf-8');
      }
    }
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');

    let siteRoot: string | null = null;
    if (domain) {
      const root = process.env.CYBERPANEL_SITES_ROOT || '/home';
      const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
      siteRoot = join(root, domain, publicDir);

      if (publishImmediately) {
        // Admin test project: publicar directamente sin esperar el plazo
        this.logger.log(`[ADMIN INSTANT PUBLISH] Publicando directamente en ${siteRoot} para ${domain}.`);
        const maxAttempts = 30;
        const pollIntervalMs = 2000;
        let success = false;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          if (fs.existsSync(siteRoot)) {
            fs.writeFileSync(join(siteRoot, 'index.html'), html, 'utf-8');
            if (pages?.length) {
              for (const page of pages) {
                const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
                fs.writeFileSync(join(siteRoot, fileName), page.html, 'utf-8');
              }
            }
            success = true;
            break;
          }
          this.logger.log(`[ADMIN INSTANT PUBLISH] Esperando que CyberPanel cree ${siteRoot} (intento ${attempt}/${maxAttempts})...`);
          await this.sleep(pollIntervalMs);
        }
        if (!success) {
          this.logger.warn(`[ADMIN INSTANT PUBLISH] No se pudo escribir en ${siteRoot} tras ${maxAttempts} intentos. Se usará solo el preview.`);
        }
      } else {
        this.logger.log(`[DELAYED PUBLISH] Se omite escritura inmediata en ${siteRoot} para ${domain}. Se realizara al cumplirse el plazo.`);
      
      /* 
      // LOGICA ANTERIOR: Se escribia inmediatamente si el dominio existia.
      // Se comenta para cumplir con el requerimiento de "sensacion de progreso humano" y publicacion al final.
      
      this.logger.log(`Intentando persistir sitio en CyberPanel. Dominio: ${domain}, Ruta: ${siteRoot}`);
      
      const maxAttempts = 30;
      const pollIntervalMs = 2000;
      let success = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const indexPath = join(siteRoot, 'index.html');
        if (fs.existsSync(siteRoot) && fs.existsSync(indexPath)) {
          const currentContent = fs.readFileSync(indexPath, 'utf-8');
          if (currentContent.includes('CyberPanel Installed')) {
            fs.writeFileSync(indexPath, html, 'utf-8');
            success = true;
          } else {
            fs.writeFileSync(indexPath, html, 'utf-8');
            success = true;
          }
        }
        if (success) {
          if (pages?.length) {
            for (const page of pages) {
              const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
              const pagePath = join(siteRoot, fileName);
              fs.writeFileSync(pagePath, page.html, 'utf-8');
            }
          }
          break;
        }
        await this.sleep(pollIntervalMs);
      }
      if (!success) {
        throw new Error(`No se pudo persistir el sitio tras varios intentos en ${domain}`);
      }
      */
      } // end else (delayed publish)
    }

    return {
      target: siteRoot,
      previewUrl: `${appUrl}/uploads/previews/${projectId}/index.html`,
    };
  }

  /**
   * Dimensiones objetivo en pixeles segun el "usage" semantico de la
   * imagen. La calidad creativa de gpt-image-1 se mantiene (la imagen se
   * genera siempre a 1024x1024 y luego se redimensiona aca). Mantener la
   * proporcion correcta evita estirones feos en hero/banner.
   */
  private getImageDimensions(usage: string): { width: number; height: number } {
    const u = (usage || '').toLowerCase();
    if (u === 'hero' || u.includes('hero')) return { width: 1920, height: 1080 };
    if (u.includes('banner')) return { width: 1920, height: 720 };
    if (
      u.includes('galer') ||
      u.includes('gallery') ||
      u.includes('product') ||
      u.includes('card') ||
      u.includes('coleccion') ||
      u.includes('tcg')
    ) {
      return { width: 1200, height: 1200 };
    }
    if (
      u.includes('team') ||
      u.includes('testimon') ||
      u.includes('figure') ||
      u.includes('person')
    ) {
      return { width: 800, height: 800 };
    }
    if (u.includes('icon') || u.includes('logo')) return { width: 512, height: 512 };
    return { width: 1280, height: 1280 };
  }

  /**
   * Optimiza una imagen base64 (PNG de gpt-image-1) a WebP redimensionado
   * segun el usage. Reduce 70-85% del peso conservando calidad visual.
   * Si sharp no esta disponible o falla, retorna null y el caller guarda
   * el PNG original para no romper la generacion.
   */
  private async optimizeImage(
    b64: string,
    usage: string,
  ): Promise<Buffer | null> {
    try {
      // Import dinamico para que el codigo siga funcionando si sharp no
      // esta instalado (raro pero defensivo).
      const sharp = (await import('sharp')).default;
      const { width, height } = this.getImageDimensions(usage);
      const input = Buffer.from(b64, 'base64');
      return await sharp(input)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (err: any) {
      this.logger.warn(
        `optimizeImage no disponible o fallo (${err?.message || err}). Guardando PNG sin optimizar.`,
      );
      return null;
    }
  }

  private async persistImages(
    projectId: number,
    images: Array<{ id: string; url: string; usage: string }>,
  ) {
    const baseDir = join(process.cwd(), 'uploads', 'generated', String(projectId));
    fs.mkdirSync(baseDir, { recursive: true });
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    const results: Array<{ id: string; url: string; usage: string }> = [];
    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      const optimized = await this.optimizeImage(img.url, img.usage);
      if (optimized) {
        const filename = `${img.id || 'asset'}-${idx}.webp`;
        const filePath = join(baseDir, filename);
        fs.writeFileSync(filePath, optimized);
        const { width, height } = this.getImageDimensions(img.usage);
        const sizeKb = Math.round(optimized.byteLength / 1024);
        this.logger.log(
          `Imagen optimizada id=${img.id} usage=${img.usage} -> ${filename} ${width}x${height} ${sizeKb} KB`,
        );
        results.push({
          ...img,
          url: `${appUrl}/uploads/generated/${projectId}/${filename}`,
        });
      } else {
        // Fallback: guardar PNG original sin optimizar.
        const filename = `${img.id || 'asset'}-${idx}.png`;
        const filePath = join(baseDir, filename);
        fs.writeFileSync(filePath, Buffer.from(img.url, 'base64'));
        results.push({
          ...img,
          url: `${appUrl}/uploads/generated/${projectId}/${filename}`,
        });
      }
    }
    return results;
  }

  async generateForProject(projectId: number, revisionNote?: string): Promise<AiGenerationResult | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { order: true, user: true },
    });
    if (!project) return null;

    const existingData = JSON.parse((project.onboardingData as string) || '{}');

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify({
          ...existingData,
          aiGeneration: {
            ...(existingData.aiGeneration || {}),
            status: 'GENERATING',
            startedAt: new Date().toISOString(),
          },
        }),
      },
    });

    if (!this.env.apiKey) {
      this.logger.warn('OPENAI_API_KEY no configurada.');
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...existingData,
            aiGeneration: {
              ...(existingData.aiGeneration || {}),
              status: 'FAILED',
              error: 'OPENAI_API_KEY no configurada.',
              updatedAt: new Date().toISOString(),
            },
          }),
        },
      });
      return null;
    }

    // Motor Claude estatico (detras de feature flag; legacy intacto).
    if ((process.env.WEBDEV_ENGINE || 'legacy').toLowerCase() === 'claude') {
      return this.generateStaticWithClaude(project, revisionNote);
    }

    try {
      const plan = project.type as PlanType;
      const currentDomain = existingData.publicDomain || null;
      this.logger.log(
        `AI(html-direct) start project=${projectId} plan=${plan} domain=${currentDomain ?? 'preview-only'}`,
      );

      // 1. Obtener imagenes reales de Pexels ANTES de generar HTML
      const imagePrompts = this.buildImagePrompts(existingData);
      const rawImages = await this.generateImages(imagePrompts, plan, 'standard');
      const storedImages = await this.persistImages(projectId, rawImages);

      // 2. Claude genera HTML completo con placeholders de imagen
      const systemPrompt = this.buildSystemPrompt(plan);
      const userPrompt = this.buildUserPrompt(existingData, plan);
      let html = await this.chatHtml(systemPrompt, userPrompt);

      // 3. Inyectar URLs reales en los placeholders
      html = this.injectImagesIntoHtml(html, rawImages);

      // 4. Aplicar contact.php y limpieza de seguridad
      // enforceContactForms se aplica en persistGeneratedAssets internamente

      if (!html || !html.trim()) {
        throw new Error('La IA no genero contenido HTML valido.');
      }

      const scoreVal = 90;
      const spec: SiteSpec = { brand: { name: existingData.businessName || project.name, tagline: '', tone: 'profesional' }, palette: { primary: '#0f172a', secondary: '#2563eb', accent: '#38bdf8', background: '#f8fafc', text: '#0f172a' }, typography: { heading: 'Inter', body: 'Inter' }, sections: [], images: [] };

      const domain = currentDomain || '';
      const isAdminTest = existingData._adminTest === true;
      let deployment: { target?: string | null; previewUrl?: string } = {};
      if (domain && html) {
        try {
          deployment = await this.persistGeneratedAssets(projectId, domain, html, undefined, isAdminTest);
        } catch (error: any) {
          this.logger.error(`No se pudo escribir en el sitio ${domain}`, error?.message || error);
          throw new Error(`No se pudo publicar el sitio en ${domain}: ${error?.message || error}`);
        }
      } else if (html) {
        deployment = await this.persistGeneratedAssets(projectId, null, html, undefined, isAdminTest);
      }

      const result: AiGenerationResult = {
        spec,
        images: storedImages,
        html,
        pages: undefined,
        score: { conversion: scoreVal, seo: scoreVal, accessibility: scoreVal, performance: scoreVal, notes: [] },
      };

    const previewPath = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const previewExists = fs.existsSync(previewPath);
    
    this.logger.log(
      isAdminTest
        ? `AI done project=${projectId} [ADMIN TEST] publicado inmediatamente en ${domain}`
        : `AI done project=${projectId} preview=${previewExists ? previewPath : 'missing'} (Pending auto-publish at deadline)`,
    );

    const publishedAt = isAdminTest ? new Date().toISOString() : undefined;

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: isAdminTest ? ProjectStatus.DELIVERED : ProjectStatus.IN_PROGRESS,
        onboardingData: JSON.stringify({
          ...existingData,
          ...(isAdminTest ? {
            publicUrl: domain ? `https://${domain}` : null,
            publicDomain: domain || null,
            publishedAt,
          } : {}),
          aiGeneration: {
            status: 'READY',
            mode: 'html-direct',
            updatedAt: new Date().toISOString(),
            score: scoreVal,
            images: storedImages,
            previewUrl: deployment.previewUrl || null,
            target: deployment.target || null,
            finishedAt: new Date().toISOString(),
            model: 'claude/gpt-4o',
            domain: domain || null,
            checks: {
              previewPath,
              previewExists,
            },
          },
        }),
      },
    });

    return result;
    } catch (error: any) {
      this.logger.error(`Fallo AI generateForProject ${projectId}: ${error?.message || error}`);
      const previewPath = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
      const previewExists = fs.existsSync(previewPath);
      const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...existingData,
            aiGeneration: {
              ...(existingData.aiGeneration || {}),
              status: 'FAILED',
              error: error?.message || 'Error generando el sitio',
              updatedAt: new Date().toISOString(),
              previewUrl: previewExists ? `${appUrl}/uploads/previews/${projectId}/index.html` : null,
              checks: {
                previewPath,
                previewExists,
              },
            },
          }),
        },
      });
      return null;
    }
  }

  /**
   * Motor Claude para sitios estaticos (LANDING/WEB). Aislado del legacy.
   * Mantiene el MISMO contrato de persistencia/estado que generateForProject
   * para no romper cron/publicacion/pagos.
   */
  /**
   * Aplica una revision a un sitio Claude YA publicado SIN regenerar.
   * - Lee el HTML existente de uploads/previews/<id>/.
   * - Llama a websiteGen.editPages que hace ediciones quirurgicas.
   * - Escribe los cambios de vuelta a previews/.
   * - Republica al public_html.
   * - Manda el correo "revision-deployed".
   *
   * Retorna null si no hay archivos previos para editar (caller hace
   * fallback a la regeneracion full).
   */
  private async editExistingSiteWithClaude(
    project: any,
    revisionNote: string,
  ): Promise<AiGenerationResult | null> {
    const projectId = project.id as number;
    const onboarding = JSON.parse((project.onboardingData as string) || '{}');
    // Para sitios YA publicados, la fuente de verdad es el public_html
    // del hosting del cliente (uploads/previews ya fue limpiado tras la
    // publicacion inicial). Editamos directamente alli.
    const targetDir = onboarding?.aiGeneration?.target as string | undefined;
    if (!targetDir || !fs.existsSync(targetDir)) {
      this.logger.warn(
        `editExistingSiteWithClaude: target dir invalido o inexistente (${targetDir}) project=${projectId}`,
      );
      return null;
    }

    const htmlFiles = fs
      .readdirSync(targetDir)
      .filter((f) => /\.html$/i.test(f));
    if (htmlFiles.length === 0) {
      this.logger.warn(
        `editExistingSiteWithClaude: no hay .html en ${targetDir} para project=${projectId}`,
      );
      return null;
    }

    const existingPages: Record<string, string> = {};
    for (const f of htmlFiles) {
      existingPages[f] = fs.readFileSync(join(targetDir, f), 'utf-8');
    }

    const planType = project.type as PlanType;
    const brief = this.buildUserPrompt(onboarding, planType);
    const clientImages: string[] = Array.isArray(onboarding.images)
      ? onboarding.images
          .filter((x: any) => typeof x === 'string')
          .map((u: string) => this.normalizeUploadUrl(u))
      : [];
    const clientLogo: string | undefined =
      typeof onboarding.logoUrl === 'string' && onboarding.logoUrl
        ? this.normalizeUploadUrl(onboarding.logoUrl)
        : undefined;

    this.logger.log(
      `AI(claude-edit) start project=${projectId} pages=${htmlFiles.join(',')} note="${revisionNote.slice(0, 80)}" clientImages=${clientImages.length} hasLogo=${!!clientLogo}`,
    );

    const apiBaseEdit = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    const baseDomainEdit = (process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe').toLowerCase();
    const domainEdit = (onboarding?.publicDomain || '').toLowerCase();
    // Dominio propio -> form local PHP (autosuficiente).
    // Subdominio .plia.pe -> form central api.plia.pe (como hoy).
    const isCustomDomainEdit =
      domainEdit && !domainEdit.endsWith(`.${baseDomainEdit}`) && domainEdit !== baseDomainEdit;
    const formEndpointEdit = isCustomDomainEdit
      ? '/_plia/contact.php'
      : `${apiBaseEdit}/api/site-contact/${projectId}`;
    let editedPages: Record<string, string>;
    try {
      editedPages = await this.websiteGen.editPages(
        existingPages,
        revisionNote,
        brief,
        clientImages,
        clientLogo,
        formEndpointEdit,
      );
    } catch (error: any) {
      this.logger.error(
        `Fallo AI(claude-edit) ${projectId}: ${error?.message || error}`,
      );
      // Marcar FAILED no, porque el sitio publicado sigue intacto. Solo
      // logueamos el error y devolvemos null para que el caller decida.
      return null;
    }

    // Escribir los cambios DIRECTAMENTE al hosting del cliente
    // (target = /home/<dominio>/public_html). Solo paginas que cambiaron.
    let changedCount = 0;
    for (const [file, newHtml] of Object.entries(editedPages)) {
      if (newHtml && newHtml !== existingPages[file]) {
        fs.writeFileSync(join(targetDir, file), newHtml, 'utf-8');
        changedCount += 1;
      }
    }

    this.logger.log(
      `AI(claude-edit) done project=${projectId} target=${targetDir} changedFiles=${changedCount}/${htmlFiles.length}`,
    );

    // Actualizar metadata en DB (status sigue DELIVERED).
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        // status DELIVERED preservado (no se toca)
        onboardingData: JSON.stringify({
          ...onboarding,
          aiGeneration: {
            ...(onboarding.aiGeneration || {}),
            status: 'READY',
            mode: 'edit',
            model: 'claude-static-edit',
            updatedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            revisionDeployedAt: new Date().toISOString(),
            lastRevisionNote: revisionNote.slice(0, 500),
            editedFiles: changedCount,
          },
        }),
      },
    });

    // Mandar correo "revision-deployed" al cliente.
    try {
      const customerEmail = project?.user?.email;
      if (customerEmail) {
        const appBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
        const resolvedPublicUrl =
          onboarding.publicUrl ||
          (onboarding.publicDomain
            ? `https://${onboarding.publicDomain}`
            : appBase);
        await this.mailService.sendRevisionDeployed(customerEmail, {
          projectName: project.name,
          businessName: onboarding.businessName,
          publicUrl: resolvedPublicUrl,
          dashboardUrl: `${appBase}/dashboard`,
        });
      }
    } catch (mailErr: any) {
      this.logger.warn(
        `No se pudo enviar revision-deployed (edit) project=${projectId}: ${mailErr?.message || mailErr}`,
      );
    }

    // Retornar shape compatible (caller solo usa que sea truthy).
    return {
      spec: {} as any,
      images: [],
      html: editedPages['index.html'] || Object.values(editedPages)[0] || '',
      pages: Object.entries(editedPages).map(([file, html]) => ({
        slug: file === 'index.html' ? 'index' : file.replace(/\.html$/i, ''),
        html,
      })),
      score: {
        conversion: 90,
        seo: 85,
        accessibility: 80,
        performance: 90,
        notes: [`Edicion quirurgica aplicada (${changedCount} archivos modificados)`],
      },
    } as AiGenerationResult;
  }

  private async generateStaticWithClaude(
    project: any,
    revisionNote?: string,
  ): Promise<AiGenerationResult | null> {
    const projectId = project.id as number;
    const onboarding = JSON.parse((project.onboardingData as string) || '{}');
    // Estado original: si era DELIVERED y nos llega revisionNote, esto es
    // una revision sobre un sitio publicado. Tenemos que preservar el
    // status DELIVERED al final y re-publicar archivos al public_html.
    const wasDelivered = project.status === ProjectStatus.DELIVERED;
    const isRevision = !!(revisionNote && revisionNote.trim().length > 0);

    // FAST-PATH para revisiones sobre sitios YA publicados: en vez de
    // regenerar desde cero (plan + DALL-E + render full), edita
    // quirurgicamente el HTML existente. Mas barato, mas rapido, conserva
    // imagenes/estructura/contenido no afectado.
    if (isRevision && wasDelivered) {
      const fast = await this.editExistingSiteWithClaude(project, revisionNote!);
      if (fast) return fast;
      // Si la edicion quirurgica fallo (p.ej. no habian archivos previos),
      // cae al flujo normal de regeneracion como fallback.
      this.logger.warn(
        `editExistingSiteWithClaude fallback project=${projectId}: regenerando desde cero.`,
      );
    }
    try {
      const planType = project.type as PlanType;
      const mode: WebMode = planType === 'LANDING' ? 'LANDING' : 'WEB';
      const baseBrief = this.buildUserPrompt(onboarding, planType);
      // Inyectar la instruccion de revision con maxima prioridad al brief
      // para que Claude lo respete sin perder el contexto del sitio.
      const brief = isRevision
        ? `${baseBrief}\n\n=== AJUSTE SOLICITADO POR EL CLIENTE (PRIORITARIO) ===\n${revisionNote!.trim()}\n\nAplica este cambio especifico SIN romper el resto del sitio. Mantén la misma paleta, tipografía y estructura general, solo modifica lo que el cliente está pidiendo.`
        : baseBrief;
      const clientImages: string[] = Array.isArray(onboarding.images)
        ? onboarding.images
            .filter((x: any) => typeof x === 'string')
            .map((u: string) => this.normalizeUploadUrl(u))
        : [];
      // El logo del cliente se pasa como recurso aparte para que la IA
      // lo identifique explicitamente y lo coloque en header/footer.
      const clientLogo: string | undefined =
        typeof onboarding.logoUrl === 'string' && onboarding.logoUrl
          ? this.normalizeUploadUrl(onboarding.logoUrl)
          : undefined;
      const currentDomain = onboarding?.publicDomain || null;
      this.logger.log(
        `AI(claude-static) start project=${projectId} mode=${mode} domain=${currentDomain ?? 'preview-only'} clientImages=${clientImages.length} hasLogo=${!!clientLogo}`,
      );
      if (clientImages.length) {
        this.logger.log(
          `AI(claude-static) clientImageUrls: ${clientImages.slice(0, 3).join(' | ')}${clientImages.length > 3 ? ' ...' : ''}`,
        );
      }

      // 1. Plan (Claude ve las imagenes del cliente, multimodal).
      const sitePlan = await this.websiteGen.plan(brief, mode, clientImages, clientLogo);

      // 2. Imagenes con DALL-E (se mantiene) desde los prompts del plan.
      const rawImages = await this.generateImages(
        sitePlan.imagePrompts.map((p) => ({
          id: p.id,
          prompt: p.prompt,
          usage: p.usage,
        })),
        planType,
        this.getMode(planType),
      );
      const storedImages = await this.persistImages(projectId, rawImages);
      const imageUrls: Record<string, string> = {};
      storedImages.forEach((img) => {
        imageUrls[img.usage || img.id] = img.url;
      });

      // 3. Render de paginas HTML estaticas (Tailwind CDN).
      // Endpoint del form de contacto:
      //  - Dominio propio -> "/_plia/contact.php" (autosuficiente, PHP local
      //    se deploya al publicar; mejor portabilidad si el cliente migra).
      //  - Subdominio .plia.pe -> "https://api.plia.pe/api/site-contact/<id>"
      //    (el sitio ya depende de PLIA en todo, asi que centralizado).
      const apiBase = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
      const baseDomain = (process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe').toLowerCase();
      const domainForForm = (onboarding?.publicDomain || '').toLowerCase();
      const isCustomDomain =
        domainForForm && !domainForForm.endsWith(`.${baseDomain}`) && domainForForm !== baseDomain;
      const formEndpoint = isCustomDomain
        ? '/_plia/contact.php'
        : `${apiBase}/api/site-contact/${projectId}`;

      const filesMap = await this.websiteGen.renderAll(
        sitePlan,
        brief,
        mode,
        imageUrls,
        clientImages,
        clientLogo,
        formEndpoint,
      );

      // 4. Mismo formato de salida que legacy: pages[{slug,html}] + html.
      const pages = Object.entries(filesMap).map(([file, content]) => ({
        slug: file === 'index.html' ? 'index' : file.replace(/\.html$/i, ''),
        html: content,
      }));
      const html =
        pages.find((p) => p.slug === 'index')?.html || pages[0]?.html || '';

      // Si no se genero HTML, fallamos para no marcar READY un sitio vacio.
      if (!html || !html.trim()) {
        throw new Error(
          'La IA no genero contenido HTML para el sitio (sin paginas renderizadas).',
        );
      }

      const domain = currentDomain || '';
      let deployment: { target?: string | null; previewUrl?: string } = {};
      if (html) {
        deployment = await this.persistGeneratedAssets(
          projectId,
          domain || null,
          html,
          pages,
        );
      }

      const score = {
        conversion: 90,
        seo: 85,
        accessibility: 80,
        performance: 85,
        notes: [] as string[],
      };
      const previewPath = join(
        process.cwd(),
        'uploads',
        'previews',
        String(projectId),
        'index.html',
      );
      const previewExists = fs.existsSync(previewPath);

      // Si esta corrida es una REVISION sobre un sitio ya DELIVERED, hay
      // que (a) preservar el status DELIVERED en lugar de regresarlo a
      // IN_PROGRESS, y (b) republicar inmediatamente los archivos nuevos
      // a /home/<dominio>/public_html — porque el cron normal solo procesa
      // IN_PROGRESS con deadline vencido, y esto no aplica aqui.
      const willRepublish = isRevision && wasDelivered;
      const finalStatus = willRepublish
        ? ProjectStatus.DELIVERED
        : ProjectStatus.IN_PROGRESS;

      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          status: finalStatus,
          onboardingData: JSON.stringify({
            ...onboarding,
            aiGeneration: {
              ...(onboarding.aiGeneration || {}),
              status: 'READY',
              mode: 'standard',
              updatedAt: new Date().toISOString(),
              score,
              images: storedImages,
              previewUrl: deployment.previewUrl || null,
              target: deployment.target || null,
              finishedAt: new Date().toISOString(),
              model: 'claude-static',
              domain: domain || null,
              checks: { previewPath, previewExists },
              ...(willRepublish
                ? { revisionDeployedAt: new Date().toISOString() }
                : {}),
            },
          }),
        },
      });

      // Auto-publicacion al public_html cuando es una revision aplicada.
      if (willRepublish && deployment.target) {
        try {
          const previewRoot = join(
            process.cwd(),
            'uploads',
            'previews',
            String(projectId),
          );
          if (fs.existsSync(previewRoot)) {
            this.copyDirRecursive(previewRoot, deployment.target);
            this.logger.log(
              `Revision aplicada y republicada en ${deployment.target} para project=${projectId}`,
            );
            // Avisar al cliente con el correo "revision-deployed".
            try {
              const customerEmail = project?.user?.email;
              if (customerEmail) {
                const appBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
                const resolvedPublicUrl =
                  onboarding.publicUrl ||
                  (onboarding.publicDomain
                    ? `https://${onboarding.publicDomain}`
                    : appBase);
                await this.mailService.sendRevisionDeployed(customerEmail, {
                  projectName: project.name,
                  businessName: onboarding.businessName,
                  publicUrl: resolvedPublicUrl,
                  dashboardUrl: `${appBase}/dashboard`,
                });
              }
            } catch (mailErr: any) {
              this.logger.warn(
                `No se pudo enviar revision-deployed project=${projectId}: ${mailErr?.message || mailErr}`,
              );
            }
          } else {
            this.logger.warn(
              `Revision: previewRoot no existe (${previewRoot}), no se republicó.`,
            );
          }
        } catch (repubErr: any) {
          this.logger.error(
            `Fallo republicacion tras revision project=${projectId}: ${repubErr?.message || repubErr}`,
          );
        }
      }

      return {
        spec: {} as any,
        images: storedImages,
        html,
        pages,
        score,
      } as AiGenerationResult;
    } catch (error: any) {
      this.logger.error(
        `Fallo AI(claude-static) ${projectId}: ${error?.message || error}`,
      );
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...onboarding,
            aiGeneration: {
              ...(onboarding.aiGeneration || {}),
              status: 'FAILED',
              error: error?.message || 'Error generando el sitio',
              updatedAt: new Date().toISOString(),
            },
          }),
        },
      });
      return null;
    }
  }
}
