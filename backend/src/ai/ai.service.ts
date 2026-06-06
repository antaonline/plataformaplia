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
import { enforceContactForms } from './contact-form-enforcer';

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
    const base = `Eres el mejor diseñador y desarrollador frontend del mundo. Creas sitios web que ganan premios Awwwards, que valen millones de dólares. Tu código es impecable, tu diseño es de lujo.

SALIDA: SOLO el HTML completo (<!DOCTYPE html> hasta </html>). Cero markdown. Cero explicaciones. El primer caracter es "<".

⚠️ LÍMITE DE TOKENS — MUY IMPORTANTE:
Tienes máximo 8000 tokens de salida. El HTML DEBE terminar con </body></html>.
Para lograrlo: CSS compacto (combina selectores, una propiedad por línea solo si necesario), omite comentarios, y si te acercas al final, cierra el HTML aunque falten secciones secundarias. El orden de prioridad si falta espacio: nav + hero + contact + footer son OBLIGATORIOS, las demás secciones son opcionales.

═══════════════════════════════════════════
REGLAS DE IMÁGENES — CRÍTICO — NUNCA VIOLAR
═══════════════════════════════════════════
Las imágenes se inyectan DESPUÉS. Usa EXACTAMENTE estos placeholders como atributo src:
  Hero de fondo:  src="[[PLIA_IMG:hero]]"
  Galería foto 1: src="[[PLIA_IMG:gallery1]]"
  Galería foto 2: src="[[PLIA_IMG:gallery2]]"
  Galería foto 3: src="[[PLIA_IMG:gallery3]]"

Para el hero full-bleed con imagen:
<section class="hero">
  <img src="[[PLIA_IMG:hero]]" class="hero-bg" alt="" aria-hidden="true" fetchpriority="high">
  <div class="hero-overlay"></div>
  <div class="hero-content">...</div>
</section>

CSS obligatorio para el hero:
.hero { position:relative; min-height:100vh; display:flex; align-items:center; overflow:hidden; }
.hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; z-index:0; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.65) 0%,rgba(0,0,0,.25) 100%); z-index:1; }
.hero-content { position:relative; z-index:2; max-width:900px; margin:0 auto; padding:0 24px; }

Para imágenes de galería: <img src="[[PLIA_IMG:gallery1]]" loading="lazy" alt="descripcion" class="gallery-img">
NUNCA uses background-image:url() con estos placeholders.

═══════════════════════════════════════════
CSS PREMIUM — PATRONES OBLIGATORIOS
═══════════════════════════════════════════
Elige el par de fuentes apropiado para el sector y úsalas en el @import. Ejemplo:
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
(Reemplaza con las fuentes que elijas según el sector del negocio)

:root {
  --primary: #HEX;       /* color principal de la marca */
  --primary-dark: #HEX;  /* versión oscura para hovers */
  --accent: #HEX;        /* color de acento/CTA */
  --surface: #HEX;       /* fondo de cards (blanco cálido o gris muy claro) */
  --bg: #HEX;            /* fondo general de la página */
  --text: #HEX;          /* texto principal (nunca #000 puro) */
  --text-muted: #HEX;    /* texto secundario */
  --border: rgba(0,0,0,.08);
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.08);
  --shadow-md: 0 4px 6px rgba(0,0,0,.05), 0 10px 30px rgba(0,0,0,.12);
  --shadow-lg: 0 10px 15px rgba(0,0,0,.04), 0 20px 50px rgba(0,0,0,.16);
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  --transition: all .25s cubic-bezier(.4,0,.2,1);
}

Botones:
.btn-primary { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; background:var(--accent); color:#fff; border:none; border-radius:var(--radius-full); font-weight:600; font-size:1rem; text-decoration:none; cursor:pointer; transition:var(--transition); }
.btn-primary:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); filter:brightness(1.08); }
.btn-outline { display:inline-flex; align-items:center; gap:8px; padding:13px 31px; border:2px solid rgba(255,255,255,.7); color:#fff; border-radius:var(--radius-full); font-weight:600; font-size:1rem; text-decoration:none; cursor:pointer; transition:var(--transition); backdrop-filter:blur(4px); }
.btn-outline:hover { background:rgba(255,255,255,.15); border-color:#fff; }

Cards:
.card { background:var(--surface); border-radius:var(--radius-md); padding:32px; box-shadow:var(--shadow-sm); border:1px solid var(--border); transition:var(--transition); }
.card:hover { transform:translateY(-6px); box-shadow:var(--shadow-lg); }

Nav sticky:
nav { position:sticky; top:0; z-index:100; background:rgba(255,255,255,.92); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:16px 24px; display:flex; align-items:center; justify-content:space-between; }

Animaciones de entrada — IMPORTANTE: los elementos deben ser VISIBLES por defecto. La animación es opcional:
CSS: .fade-up{opacity:1;transform:none;transition:opacity .7s ease,transform .7s ease;}
JS al final del body (opcional, mejora si el JS carga):
document.querySelectorAll('.fade-up').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(28px)';});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='none';}}),{threshold:.1});
document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));

Inputs de formulario:
input,textarea { width:100%; padding:14px 18px; border:2px solid var(--border); border-radius:var(--radius-sm); font-size:1rem; font-family:inherit; transition:var(--transition); background:var(--surface); color:var(--text); }
input:focus,textarea:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent); }

═══════════════════════════════════════════
ICONOS SVG — obligatorio en lugar de emojis
═══════════════════════════════════════════
Usa SVGs inline de 24x24px. Ejemplos:
Checkmark: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
Flecha: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
Teléfono: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
Crea SVGs apropiados para el sector del negocio.

═══════════════════════════════════════════
TIPOGRAFÍA PREMIUM según el sector
═══════════════════════════════════════════
Gastronómico/elegante: Playfair Display (heading) + DM Sans (body)
Tecnología/startup: Sora (heading) + Inter (body)
Salud/bienestar: Plus Jakarta Sans (heading) + Nunito (body)
Profesional/corporativo: Manrope (heading) + Inter (body)
Creativo/artístico: Fraunces (heading) + DM Sans (body)
Local/amigable: Poppins (heading) + Lato (body)

REGLAS tipográficas:
- Heading hero: font-size: clamp(2.8rem, 6vw, 5.5rem); line-height:1.1; font-weight:800; letter-spacing:-0.02em;
- Subheading secciones: font-size: clamp(1.8rem, 4vw, 3rem); font-weight:700;
- Body: font-size: clamp(1rem, 1.5vw, 1.125rem); line-height:1.7;
- Nunca uses menos de 16px para texto de contenido.

═══════════════════════════════════════════
EFECTOS VISUALES NIVEL AWWWARDS
═══════════════════════════════════════════
- Hero: palabra clave en color accent con font-style:italic (contraste dramático)
- Stats section: números grandes (font-size:4rem, font-weight:900) con línea decorativa arriba
- Cards de servicios: borde izquierdo de 3px en color accent, no cuadradas sino con padding asimétrico
- Galería: CSS Grid con grid-template-areas para layout asimétrico (imagen hero grande + 2 pequeñas)
- Testimonios: comilla decorativa gigante (font-size:8rem, opacity:.08) en posición absoluta detrás del texto
- Separadores de sección: usar <div class="divider"> con clip-path:polygon(0 0,100% 0,100% 60%,0 100%) en el color de la sección siguiente
- Footer: columnas bien espaciadas, línea superior sutil, copyright centrado abajo
- CSS para glassmorphism en la nav al hacer scroll: ya está en el nav sticky con backdrop-filter:blur(12px)
- NO uses emojis. Cada icono SVG debe ser único y apropiado para el contenido que acompaña.`;

    const landingStructure = `

═══════════════════════════════════════════
ESTRUCTURA LANDING DE ALTA CONVERSIÓN
═══════════════════════════════════════════
1. <nav> — sticky, logo + links de navegacion + CTA button verde/accent
2. <section class="hero"> — min-height:100vh, imagen de fondo con overlay, headline IMPACTANTE (clamp grande), subtitulo, 2 CTAs lado a lado, scroll-down indicator SVG
3. <section class="stats"> — 3-4 números destacados (stats/logros del negocio) con línea separadora superior. Fondo ligeramente diferente.
4. <section class="benefits"> — "¿Por qué elegirnos?" — 3-4 cards con icono SVG grande (48px), título, descripción. Grid responsivo.
5. <section class="services"> — Servicios/productos/menú específicos del negocio. Cards con imagen o icono, nombre, descripción corta, precio si aplica.
6. <section class="gallery"> — Mosaico de 3 imágenes con los placeholders. Layout asimétrico si es posible (CSS Grid con diferentes tamaños).
7. <section class="testimonials"> — 2-3 testimonios. Cards con comilla SVG decorativa, texto entrecomillado, avatar circular (inicial del nombre con color de fondo), nombre en bold, cargo/tipo de cliente, 5 estrellas SVG.
8. <section class="cta-banner"> — Banner de llamada a acción final. Fondo con gradiente del color primario. Texto grande + botón contrastante.
9. <section class="contact"> — Formulario: nombre, email, teléfono, mensaje. Layout 2 columnas en desktop (info de contacto izq + form der). action="/contact.php" method="POST".
10. <footer> — Logo, descripción corta, links de navegación en columnas, redes sociales con SVG icons, copyright. Fondo oscuro contrastante.

IMPORTANTE: añade class="fade-up" a cada section para las animaciones de entrada.`;

    const webStructure = `

═══════════════════════════════════════════
ESTRUCTURA WEB INSTITUCIONAL
═══════════════════════════════════════════
Mismas secciones que landing pero añade:
- Sección "Sobre nosotros" con historia/misión/visión y foto del equipo
- Sección "Equipo" si aplica (cards con foto circular, nombre, cargo)
- Navbar con más links de navegación
Todo en un solo HTML con anchors.`;

    return base + (plan === 'LANDING' ? landingStructure : webStructure);
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
      // Identidad del negocio
      `NEGOCIO: ${input.businessName || 'Sin nombre'} — ${input.businessType || input.businessSector || 'Negocio'}`,
      input.businessIdentity ? `TIPO DE CLIENTE: ${input.businessIdentity === 'local-business' ? 'Negocio local con atención al público' : input.businessIdentity === 'professional' ? 'Profesional independiente' : 'Empresa o proyecto digital'}` : '',
      `CIUDAD: ${input.city || 'Peru'}`,
      `DESCRIPCION: ${input.shortDescription || ''}`,

      // Modelo de negocio y operación
      input.salesType ? `MODELO DE VENTA: ${input.salesType}` : '',
      input.workMode ? `MODO DE TRABAJO: ${input.workMode}` : '',
      input.businessModel ? `MODELO DE NEGOCIO: ${input.businessModel}` : '',
      `OBJETIVO WEB: ${goal || 'Captar clientes'}`,
      `AUDIENCIA: ${(input.audience || []).join(', ') || 'Publico general'}`,

      // Qué necesita la web
      (input.smartNeeds || []).length ? `QUÉ NECESITA LA WEB: ${(input.smartNeeds || []).join(', ')}` : '',
      (input.features || []).length ? `FUNCIONALIDADES: ${(input.features || []).join(', ')}` : '',
      sections ? `SECCIONES REQUERIDAS: ${sections}` : '',

      // Servicios y contenido específico
      services.length ? `SERVICIOS/PRODUCTOS PRINCIPALES: ${services.join(' | ')}` : '',
      smartContent.menuHighlights ? `MENÚ/CATÁLOGO: ${smartContent.menuHighlights}` : '',
      smartContent.promotionsDetails ? `PROMOCIONES VIGENTES: ${smartContent.promotionsDetails}` : '',
      smartContent.deliveryInfo ? `INFO DELIVERY: ${smartContent.deliveryInfo}` : '',
      smartContent.locationAddress ? `DIRECCIÓN FÍSICA: ${smartContent.locationAddress}` : '',
      smartContent.reservationDetails ? `SISTEMA DE RESERVAS: ${smartContent.reservationDetails}` : '',
      smartContent.servicesSummary ? `DETALLE DE SERVICIOS: ${smartContent.servicesSummary}` : '',
      smartContent.portfolioHighlights ? `PORTAFOLIO/TRABAJOS: ${smartContent.portfolioHighlights}` : '',
      smartContent.testimonialsNotes ? `TESTIMONIOS REALES: ${smartContent.testimonialsNotes}` : '',
      smartContent.agendaDetails ? `AGENDA/CITAS: ${smartContent.agendaDetails}` : '',
      smartContent.teamInfo ? `EQUIPO: ${smartContent.teamInfo}` : '',
      smartContent.contactPrompt ? `CTA DE CONTACTO: ${smartContent.contactPrompt}` : '',
      smartContent.benefitsList ? `BENEFICIOS: ${smartContent.benefitsList}` : '',
      smartContent.ctaText ? `TEXTO CTA PRINCIPAL: ${smartContent.ctaText}` : '',

      // Estilo visual
      `ESTILO VISUAL: ${input.visualStyle || 'Moderno y profesional'}`,
      `PALETA DE COLORES: ${palette}`,
      input.colors ? `COLORES ESPECÍFICOS DEL CLIENTE: ${input.colors}` : '',
      input.references ? `SITIOS DE REFERENCIA (inspiración): ${input.references}` : '',
      input.imageInstructions ? `INSTRUCCIONES DE IMÁGENES: ${input.imageInstructions}` : '',
      input.hasLogo === 'si' ? 'TIENE LOGO PROPIO: Sí — úsalo en nav y footer' : '',

      // Contacto y redes sociales
      input.instagram ? `Instagram: @${input.instagram}` : '',
      input.facebook ? `Facebook: ${input.facebook}` : '',
      input.whatsapp ? `WhatsApp: ${input.whatsapp}` : '',
      input.tiktok ? `TikTok: @${input.tiktok}` : '',
      input.contactEmail ? `Email de contacto: ${input.contactEmail}` : '',

      // Instrucciones adicionales del cliente (máxima prioridad)
      input.additionalInstructions ? `⚡ INSTRUCCIONES ESPECIALES DEL CLIENTE (RESPETAR AL PIE DE LA LETRA): ${input.additionalInstructions}` : '',
    ].filter(Boolean);

    return lines.join('\n') + `\n\nGenera el HTML completo premium. Texto real y convincente en español (CERO lorem ipsum). Incorpora TODA la información anterior en las secciones correspondientes. Diseño ganador de premios Awwwards.`;
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

  // Genera HTML premium — Claude directo (Anthropic) con imágenes del cliente multimodal
  private async chatHtml(system: string, user: string, logoUrl?: string, clientImages: string[] = []): Promise<string> {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

    if (anthropicKey) {
      try {
        this.logger.log(`[chatHtml] Claude ${anthropicModel} — logo=${!!logoUrl} clientImgs=${clientImages.length}`);

        // Construir bloques de imagen para multimodal (logo + fotos del cliente)
        const imageBlocks: any[] = [];
        const imagesToSend = [logoUrl, ...clientImages].filter(Boolean).slice(0, 5) as string[];
        for (const url of imagesToSend) {
          if (/^https?:\/\//.test(url)) {
            imageBlocks.push({ type: 'image', source: { type: 'url', url } });
          }
        }

        const userContent: any[] = [
          ...imageBlocks,
          { type: 'text', text: imageBlocks.length > 0
            ? `${user}\n\nLas imágenes adjuntas son: ${logoUrl ? 'logo del negocio (úsalo en el nav y footer)' : ''}${clientImages.length ? ', fotos reales del negocio (úsalas como referencia de estilo e inclúyelas si encajan)' : ''}. Intégralos en el diseño.`
            : user
          },
        ];

        const res = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: anthropicModel,
            max_tokens: 16000,
            temperature: 0.68,
            system,
            messages: [{ role: 'user', content: userContent }],
          },
          {
            headers: {
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
              'anthropic-beta': 'output-128k-2025-02-19',
              'Content-Type': 'application/json',
            },
            timeout: 180000,
          },
        );
        const content: string = res.data?.content?.[0]?.text ?? '';
        this.logger.log(`[chatHtml] Claude OK — input=${res.data?.usage?.input_tokens} output=${res.data?.usage?.output_tokens} tokens`);
        return content.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();
      } catch (err: any) {
        this.logger.warn(`[chatHtml] Claude fallo: ${err?.response?.data?.error?.message || err?.message}. Fallback GPT-4o.`);
      }
    }

    // Fallback: GPT-4o
    this.logger.log(`[chatHtml] fallback GPT-4o`);
    const url = `${this.env.baseUrl}/chat/completions`;
    const messages: any[] = [{ role: 'system', content: system }];
    const userParts: any[] = [];
    if (logoUrl) userParts.push({ type: 'image_url', image_url: { url: logoUrl } });
    clientImages.slice(0, 3).forEach(img => userParts.push({ type: 'image_url', image_url: { url: img } }));
    userParts.push({ type: 'text', text: user });
    messages.push({ role: 'user', content: userParts.length > 1 ? userParts : user });

    const data = await this.openAiPost<any>(url, {
      model: this.env.modelPrimary,
      messages,
      temperature: 0.68,
      max_tokens: 14000,
    });
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    this.logger.log(`[chatHtml] GPT-4o tokens=${data?.usage?.total_tokens ?? '?'}`);
    return content.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();
  }

  // Reescribe URLs de imágenes generadas a rutas relativas y las copia al public_html
  private rewriteImageUrlsToRelative(
    html: string,
    images: Array<{ id: string; url: string; usage: string }>,
    projectId: number,
  ): string {
    let result = html;
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    for (const img of images) {
      if (img.url.startsWith(appUrl)) {
        const filename = img.url.split('/').pop() ?? '';
        if (filename) {
          result = result.split(img.url).join(`assets/images/${filename}`);
        }
      }
    }
    return result;
  }

  // Copia imágenes generadas a assets/images/ dentro del preview/public_html
  private copyImagesToSiteAssets(projectId: number, images: Array<{ id: string; url: string; usage: string }>, targetDir: string) {
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    const srcDir = join(process.cwd(), 'uploads', 'generated', String(projectId));
    const destDir = join(targetDir, 'assets', 'images');
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(destDir, { recursive: true });
    for (const img of images) {
      if (img.url.startsWith(appUrl)) {
        const filename = img.url.split('/').pop() ?? '';
        const src = join(srcDir, filename);
        const dest = join(destDir, filename);
        if (filename && fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  }

  // Inyecta meta tags SEO básicos en el <head>
  // Reemplaza hrefs de redes sociales inventados por Claude con los reales del cliente
  private injectSocialLinks(html: string, data: any): string {
    let result = html;
    const socials: Record<string, string> = {
      instagram: data.instagram ? `https://instagram.com/${data.instagram.replace('@', '')}` : '',
      facebook: data.facebook ? (data.facebook.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`) : '',
      whatsapp: data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}` : '',
      tiktok: data.tiktok ? `https://tiktok.com/@${data.tiktok.replace('@', '')}` : '',
    };
    // Reemplazar hrefs genéricos que Claude suele inventar
    const genericPatterns: Record<string, RegExp[]> = {
      instagram: [/href="https?:\/\/(www\.)?instagram\.com\/[^"]*"/g],
      facebook: [/href="https?:\/\/(www\.)?facebook\.com\/[^"]*"/g],
      whatsapp: [/href="https?:\/\/(wa\.me|api\.whatsapp\.com|whatsapp\.com)\/[^"]*"/g],
      tiktok: [/href="https?:\/\/(www\.)?tiktok\.com\/[^"]*"/g],
    };
    for (const [network, url] of Object.entries(socials)) {
      if (!url) continue;
      for (const pattern of genericPatterns[network] || []) {
        result = result.replace(pattern, `href="${url}"`);
      }
    }
    return result;
  }

  private injectSeoMeta(html: string, data: any): string {
    const title = `${data.businessName || 'Bienvenidos'} — ${data.city || 'Peru'}`;
    const description = (data.shortDescription || `${data.businessName} en ${data.city}`).slice(0, 160);
    const canonical = data.subdomain ? `https://${data.subdomain}.plia.pe` : '';
    const metaTags = [
      `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`,
      `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`,
      `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">`,
      `<meta property="og:type" content="website">`,
      canonical ? `<link rel="canonical" href="${canonical}">` : '',
      `<meta name="robots" content="index, follow">`,
    ].filter(Boolean).join('\n    ');
    return html.replace('</head>', `    ${metaTags}\n</head>`);
  }

  // Inyecta URLs reales en TODOS los patrones [[PLIA_IMG:xxx]] — en src=, url(), background, etc.
  private injectImagesIntoHtml(html: string, images: Array<{ id: string; url: string; usage: string }>): string {
    let result = html;
    for (const img of images) {
      // Reemplaza [[PLIA_IMG:usage]] y [[PLIA_IMG:id]] en cualquier contexto (src=, url(), CSS, etc.)
      [img.usage, img.id].forEach(key => {
        result = result.split(`[[PLIA_IMG:${key}]]`).join(img.url);
        result = result.split(`[[PLIA_IMG:${key.toUpperCase()}]]`).join(img.url);
      });
    }
    // Cualquier placeholder restante → imagen genérica de Pexels
    result = result.replace(/\[\[PLIA_IMG:[^\]]+\]\]/gi,
      'https://images.pexels.com/photos/302893/pexels-photo-302893.jpeg?auto=compress&cs=tinysrgb&w=1200');
    return result;
  }

  // Modelo híbrido de imágenes: Pexels para ambientales, IA para únicas/específicas
  // strategy: 'pexels' = solo Pexels | 'ai' = solo IA generativa | 'hybrid' = Pexels primero, IA fallback
  private buildImagePrompts(input: any): Array<{ id: string; prompt: string; usage: string; strategy: 'pexels' | 'ai' | 'hybrid' }> {
    const business = input.businessName || input.businessType || 'professional business';
    const city = input.city || 'Peru';
    const sectorRaw = (input.businessSector || input.businessType || '').toLowerCase();
    const style = (input.visualStyle || '').toLowerCase();
    const isLuxury = style.includes('elegante') || style.includes('sofisticado') || style.includes('lujo');

    // Traducción español→inglés para mejor búsqueda en Pexels
    const sectorMap: Record<string, string> = {
      cafeteria: 'coffee shop cafe', cafetería: 'coffee shop cafe',
      restaurante: 'restaurant food', polleria: 'chicken restaurant food',
      panaderia: 'bakery bread', pasteleria: 'pastry bakery',
      gimnasio: 'gym fitness', salon: 'beauty salon', peluqueria: 'hair salon',
      medico: 'medical clinic doctor', dentista: 'dental clinic',
      abogado: 'law office professional', arquitecto: 'architecture design',
      fotógrafo: 'photography studio', fotografo: 'photography studio',
      tienda: 'retail store shop', boutique: 'fashion boutique clothing',
      hotel: 'hotel luxury accommodation', hostal: 'hostel accommodation',
      spa: 'spa wellness relaxation', yoga: 'yoga wellness studio',
      inmobiliaria: 'real estate property', construccion: 'construction building',
      software: 'technology software office', startup: 'startup technology modern',
      marketing: 'marketing agency creative office', diseño: 'design creative studio',
    };
    const sectorEn = Object.entries(sectorMap).find(([k]) => sectorRaw.includes(k))?.[1] || sectorRaw || 'professional business';

    return [
      {
        id: 'hero', usage: 'hero', strategy: 'pexels',
        prompt: `${isLuxury ? 'luxury elegant' : 'modern professional'} ${sectorEn} interior wide shot high quality`,
      },
      {
        id: 'gallery1', usage: 'gallery1', strategy: 'pexels',
        prompt: `${sectorEn} product service detail close up professional photo`,
      },
      {
        id: 'gallery2', usage: 'gallery2', strategy: 'ai',
        prompt: `Professional photorealistic marketing image for ${business}, a ${sectorEn} in ${city}. Premium quality, modern aesthetic, suitable for luxury website hero section.`,
      },
      {
        id: 'gallery3', usage: 'gallery3', strategy: 'pexels',
        prompt: `${sectorEn} ambient lifestyle interior modern clean professional`,
      },
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

  private async generateImages(prompts: Array<{ id: string; prompt: string; usage: string; strategy?: string }>, plan: PlanType, mode: AiMode) {
    const limit = this.getImageLimit(plan, mode);
    const selected = prompts.slice(0, limit);
    const images: Array<{ id: string; url: string; usage: string; source?: 'ai' | 'pexels' }> = [];

    const isGptImage = /^gpt-image/i.test(this.env.imageModel);
    for (const prompt of selected) {
      const strategy = (prompt as any).strategy || 'hybrid';

      // Pexels para estrategias 'pexels' o 'hybrid'
      if (strategy !== 'ai') {
        const pex = await this.tryPexelsForPrompt(prompt);
        if (pex) {
          images.push({
            id: prompt.id,
            url: pex.sourceUrl,
            usage: prompt.usage,
            source: 'pexels',
            buffer: pex.buffer,
          } as any);
          continue;
        }
        // Si strategy es 'pexels' y Pexels falló, usar fallback genérico en vez de gastar IA
        if (strategy === 'pexels') {
          this.logger.warn(`[images] Pexels fallo para ${prompt.id}, usando imagen de reserva`);
          images.push({
            id: prompt.id,
            url: `https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200`,
            usage: prompt.usage,
            source: 'pexels',
            isPexelsFallback: true,
          } as any);
          continue;
        }
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
        // Helper que escribe el index + páginas extra
        const writeAll = () => {
          fs.writeFileSync(join(siteRoot!, 'index.html'), html, 'utf-8');
          if (pages?.length) {
            for (const page of pages) {
              const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
              fs.writeFileSync(join(siteRoot!, fileName), page.html, 'utf-8');
            }
          }
        };
        const MARKER = 'GENERATED_BY_PLIA_IA';
        const taggedHtml = html.includes(MARKER) ? html : `<!-- ${MARKER} -->\n${html}`;
        html = taggedHtml;

        // 1. Esperar a que el directorio del sitio exista (CyberPanel lo crea)
        let dirReady = false;
        for (let i = 0; i < 30; i++) {
          if (fs.existsSync(siteRoot)) { dirReady = true; break; }
          await this.sleep(2000);
        }
        if (!dirReady) {
          this.logger.warn(`[ADMIN INSTANT PUBLISH] ${siteRoot} no existe. No se pudo publicar.`);
        } else {
          // 2. Escribir nuestro HTML
          this.logger.log(`[ADMIN INSTANT PUBLISH] Escribiendo HTML en ${siteRoot}.`);
          writeAll();
          // 3. Defender contra la race condition: CyberPanel puede sobreescribir
          //    su index.html default unos segundos después. Re-verificamos 3 veces.
          for (let check = 1; check <= 3; check++) {
            await this.sleep(4000);
            const current = fs.existsSync(join(siteRoot, 'index.html'))
              ? fs.readFileSync(join(siteRoot, 'index.html'), 'utf-8')
              : '';
            if (!current.includes(MARKER)) {
              this.logger.warn(`[ADMIN INSTANT PUBLISH] CyberPanel sobreescribió (check ${check}), reescribiendo...`);
              writeAll();
            } else {
              this.logger.log(`[ADMIN INSTANT PUBLISH] HTML confirmado en ${siteRoot} (check ${check}).`);
              break;
            }
          }
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
    images: Array<{ id: string; url: string; usage: string; source?: string; buffer?: Buffer }>,
  ) {
    const baseDir = join(process.cwd(), 'uploads', 'generated', String(projectId));
    fs.mkdirSync(baseDir, { recursive: true });
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
    const results: Array<{ id: string; url: string; usage: string }> = [];

    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      try {
        // Pexels fallback URL directa (sin buffer): usar la URL de Pexels directamente
        if (img.source === 'pexels' && (img as any).isPexelsFallback) {
          results.push({ ...img });
          continue;
        }

        // Pexels: tiene buffer real (JPEG/PNG descargado). Guardarlo directamente.
        if (img.source === 'pexels' && img.buffer) {
          let savedBuf: Buffer = img.buffer;
          try {
            const sharp = (await import('sharp')).default;
            const { width, height } = this.getImageDimensions(img.usage);
            savedBuf = await sharp(img.buffer).resize(width, height, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
          } catch { /* sharp no disponible, usar original */ }
          const ext = img.buffer && savedBuf !== img.buffer ? 'webp' : 'jpg';
          const filename = `${img.id}-${idx}.${ext}`;
          fs.writeFileSync(join(baseDir, filename), savedBuf);
          const sizeKb = Math.round(savedBuf.byteLength / 1024);
          this.logger.log(`Imagen optimizada id=${img.id} usage=${img.usage} -> ${filename} ${sizeKb} KB`);
          results.push({ ...img, url: `${appUrl}/uploads/generated/${projectId}/${filename}` });
          continue;
        }

        // DALL-E / IA: url es base64 string
        const optimized = await this.optimizeImage(img.url, img.usage);
        if (optimized) {
          const filename = `${img.id}-${idx}.webp`;
          fs.writeFileSync(join(baseDir, filename), optimized);
          const sizeKb = Math.round(optimized.byteLength / 1024);
          this.logger.log(`Imagen optimizada id=${img.id} usage=${img.usage} -> ${filename} ${sizeKb} KB`);
          results.push({ ...img, url: `${appUrl}/uploads/generated/${projectId}/${filename}` });
        } else {
          const filename = `${img.id}-${idx}.png`;
          fs.writeFileSync(join(baseDir, filename), Buffer.from(img.url, 'base64'));
          results.push({ ...img, url: `${appUrl}/uploads/generated/${projectId}/${filename}` });
        }
      } catch (e: any) {
        this.logger.warn(`persistImages error id=${img.id}: ${e?.message}`);
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

    // Motor principal: generateStaticWithClaude (Tailwind CDN + GSAP + two-phase plan+render)
    // Es el mismo motor que usa PliaStudio y genera webs de alta calidad.
    return this.generateStaticWithClaude(project, revisionNote);
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
      const isAdminTest = onboarding._adminTest === true;
      let deployment: { target?: string | null; previewUrl?: string } = {};
      if (html) {
        deployment = await this.persistGeneratedAssets(
          projectId,
          domain || null,
          html,
          pages,
          isAdminTest,
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
      const finalStatus = (willRepublish || isAdminTest)
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
