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
    return [
      'Eres un generador de sitios web premium.',
      'Devuelve SOLO JSON valido.',
      'Incluye secciones de conversion, prueba social, beneficios, FAQs y CTA.',
      plan === 'LANDING'
        ? 'El sitio debe ser una landing de alta conversion.'
        : 'El sitio debe tener hasta 5 paginas (home, servicios, nosotros, contacto y otra opcional).',
    ].join(' ');
  }

  private buildUserPrompt(input: any, plan: PlanType) {
    const goal =
      input.professionalGoal ||
      input.businessModel ||
      input.goal ||
      '';
    const tone =
      goal === 'Conseguir clientes' || goal === 'vender'
        ? 'ventas'
        : goal === 'Reservar citas' || goal === 'leads'
          ? 'captacion'
          : 'informativo';
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
      tone,
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

  private async generateImages(prompts: Array<{ id: string; prompt: string; usage: string }>, plan: PlanType, mode: AiMode) {
    const limit = this.getImageLimit(plan, mode);
    const selected = prompts.slice(0, limit);
    const images: Array<{ id: string; url: string; usage: string }> = [];

    const isGptImage = /^gpt-image/i.test(this.env.imageModel);
    for (const prompt of selected) {
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
        images.push({ id: prompt.id, url: buffer.toString('base64'), usage: prompt.usage });
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

  private async persistGeneratedAssets(projectId: number, domain: string | null, html: string, pages?: Array<{ slug: string; html: string }>) {
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
      const mode = this.getMode(plan);
      const systemPrompt = this.buildSystemPrompt(plan);
      const userPrompt = this.buildUserPrompt(existingData, plan);
      const model = this.getModel(plan, mode);
      const currentDomain = existingData.publicDomain || null;
      this.logger.log(
        `AI start project=${projectId} plan=${plan} mode=${mode} model=${model} domain=${currentDomain ?? 'preview-only'}`,
      );
      const spec = await this.chatJson<SiteSpec>(model, systemPrompt, userPrompt);
    if (!spec.brand) {
      spec.brand = {
        name: existingData.businessName || project.name,
        tagline: 'Soluciones que convierten',
        tone: 'profesional',
      };
    }
    if (!spec.palette) {
      spec.palette = {
        primary: '#0f172a',
        secondary: '#2563eb',
        accent: '#38bdf8',
        background: '#f8fafc',
        text: '#0f172a',
      };
    }
    if (!spec.typography) {
      spec.typography = { heading: 'Sora', body: 'Inter' };
    }
    if (!spec.sections?.length) {
      spec.sections = [
        {
          id: 'hero',
          type: 'hero',
          title: `${spec.brand.name}`,
          subtitle: spec.brand.tagline,
          cta: { label: 'Hablemos', href: '#contacto' },
        },
      ];
    }
    if (!spec.images) {
      spec.images = [];
    }

    if (revisionNote) {
      const copyModel = this.getCopyModel(mode);
      const revised = await this.chatJson<SiteSpec>(
        copyModel,
        'Ajusta el contenido segun la solicitud. Devuelve JSON valido.',
        JSON.stringify({ spec, revisionNote }),
      );
      Object.assign(spec, revised);
    }

    const rawImages = await this.generateImages(spec.images || [], plan, mode);
    const storedImages = await this.persistImages(projectId, rawImages);
    const score = this.scoreSpec(spec);

    let html = '';
    let pages: Array<{ slug: string; html: string }> | undefined;
    if (plan === 'LANDING') {
      html = this.renderLandingHtml(spec, rawImages);
    } else {
      pages = (spec.pages || []).map((page) => ({
        slug: page.slug,
        html: this.renderSimplePage(spec, page),
      }));
      html = pages.find((p) => p.slug === 'index')?.html || pages[0]?.html || '';
    }

    // Si la IA no produjo HTML (p.ej. spec sin pages/sections), no tiene
    // sentido marcar READY: lanzamos para que el catch lo registre como
    // FAILED y el cron lo reintente en vez de publicar un sitio vacio.
    if (!html || !html.trim()) {
      throw new Error(
        'La IA no genero contenido HTML para el sitio (spec sin paginas ni secciones).',
      );
    }

    const domain = currentDomain || '';
    let deployment: { target?: string | null; previewUrl?: string } = {};
    if (domain && html) {
      try {
        if (plan === 'WEB') {
          deployment = this.nextExportService.exportSite(projectId, spec, domain);
        } else {
          deployment = await this.persistGeneratedAssets(projectId, domain, html, pages);
        }
      } catch (error: any) {
        this.logger.error(`No se pudo escribir en el sitio ${domain}`, error?.message || error);
        throw new Error(`No se pudo publicar el sitio en ${domain}: ${error?.message || error}`);
      }
    } else if (html) {
      deployment = await this.persistGeneratedAssets(projectId, null, html, pages);
    }

    const result: AiGenerationResult = {
      spec,
      images: storedImages,
      html,
      pages,
      score,
    };

    const previewPath = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const previewExists = fs.existsSync(previewPath);
    
    this.logger.log(
      `AI done project=${projectId} preview=${previewExists ? previewPath : 'missing'} (Pending auto-publish at deadline)`,
    );

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.IN_PROGRESS, // Mantener en progreso hasta el deadline
        onboardingData: JSON.stringify({
          ...existingData,
          aiGeneration: {
            status: 'READY', // La IA ya terminó su parte
            mode,
            updatedAt: new Date().toISOString(),
            score,
            images: storedImages,
            previewUrl: deployment.previewUrl || null,
            target: deployment.target || null,
            finishedAt: new Date().toISOString(),
            model,
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
    const previewRoot = join(
      process.cwd(),
      'uploads',
      'previews',
      String(projectId),
    );

    // Si por alguna razon no hay archivos previos, devolver null para que
    // el caller caiga al flujo normal de regeneracion.
    if (!fs.existsSync(previewRoot)) {
      this.logger.warn(
        `editExistingSiteWithClaude: no existe ${previewRoot} para project=${projectId}`,
      );
      return null;
    }

    const htmlFiles = fs
      .readdirSync(previewRoot)
      .filter((f) => /\.html$/i.test(f));
    if (htmlFiles.length === 0) {
      this.logger.warn(
        `editExistingSiteWithClaude: no hay .html en ${previewRoot} para project=${projectId}`,
      );
      return null;
    }

    const existingPages: Record<string, string> = {};
    for (const f of htmlFiles) {
      existingPages[f] = fs.readFileSync(join(previewRoot, f), 'utf-8');
    }

    const planType = project.type as PlanType;
    const brief = this.buildUserPrompt(onboarding, planType);
    const clientImages: string[] = Array.isArray(onboarding.images)
      ? onboarding.images.filter((x: any) => typeof x === 'string')
      : [];
    const clientLogo: string | undefined =
      typeof onboarding.logoUrl === 'string' && onboarding.logoUrl
        ? onboarding.logoUrl
        : undefined;

    this.logger.log(
      `AI(claude-edit) start project=${projectId} pages=${htmlFiles.join(',')} note="${revisionNote.slice(0, 80)}"`,
    );

    let editedPages: Record<string, string>;
    try {
      editedPages = await this.websiteGen.editPages(
        existingPages,
        revisionNote,
        brief,
        clientImages,
        clientLogo,
      );
    } catch (error: any) {
      this.logger.error(
        `Fallo AI(claude-edit) ${projectId}: ${error?.message || error}`,
      );
      // Marcar FAILED no, porque el sitio publicado sigue intacto. Solo
      // logueamos el error y devolvemos null para que el caller decida.
      return null;
    }

    // Escribir los cambios de vuelta (solo paginas que realmente cambiaron).
    let changedCount = 0;
    for (const [file, newHtml] of Object.entries(editedPages)) {
      if (newHtml && newHtml !== existingPages[file]) {
        fs.writeFileSync(join(previewRoot, file), newHtml, 'utf-8');
        changedCount += 1;
      }
    }

    this.logger.log(
      `AI(claude-edit) done project=${projectId} changedFiles=${changedCount}/${htmlFiles.length}`,
    );

    // Actualizar metadata en DB (status sigue DELIVERED).
    const target = onboarding?.aiGeneration?.target as string | undefined;
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

    // Republicar al public_html.
    if (target) {
      try {
        if (fs.existsSync(previewRoot)) {
          this.copyDirRecursive(previewRoot, target);
          this.logger.log(
            `Edicion publicada en ${target} para project=${projectId}`,
          );
        }
      } catch (repubErr: any) {
        this.logger.error(
          `Fallo republicacion tras edicion project=${projectId}: ${repubErr?.message || repubErr}`,
        );
      }
    }

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
        ? onboarding.images.filter((x: any) => typeof x === 'string')
        : [];
      // El logo del cliente se pasa como recurso aparte para que la IA
      // lo identifique explicitamente y lo coloque en header/footer.
      const clientLogo: string | undefined =
        typeof onboarding.logoUrl === 'string' && onboarding.logoUrl
          ? onboarding.logoUrl
          : undefined;
      const currentDomain = onboarding?.publicDomain || null;
      this.logger.log(
        `AI(claude-static) start project=${projectId} mode=${mode} domain=${currentDomain ?? 'preview-only'}`,
      );

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
      // Endpoint propio para los formularios de contacto generados por la IA.
      // Reemplaza la dependencia de formsubmit.co u otros servicios externos.
      const apiBase = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
      const formEndpoint = `${apiBase}/api/site-contact/${projectId}`;

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
