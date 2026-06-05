import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StudioPlansService } from '../studio-plans/studio-plans.service';
import type { ProductShowcaseInput, Template3DMeta } from './scene-3d.types';
import {
  renderProductShowcase,
  productShowcaseMeta,
} from './product-showcase.template';

/**
 * Servicio que orquesta los templates 3D pre-armados de PLIA Studio.
 *
 * Cada template:
 *   - Recibe un input tipado (datos del cliente: nombre, modelo, paleta...).
 *   - Devuelve un HTML completo listo para servir (con Three.js+GSAP via CDN).
 *
 * El servicio valida el plan del usuario antes de devolver el HTML: templates
 * marcados como minPlan='pro' solo se renderizan para usuarios Pro o Studio.
 */
@Injectable()
export class Templates3DService {
  constructor(private readonly studioPlans: StudioPlansService) {}

  /**
   * Catalogo publico de todos los templates 3D disponibles.
   * El minPlan se respeta al renderizar, no al listar.
   */
  listTemplates(): Template3DMeta[] {
    return [
      productShowcaseMeta,
      // futuros: hero-particle, parallax-mountains, holographic-card, etc.
    ];
  }

  /**
   * Renderiza un template a HTML. Valida que el usuario tenga acceso segun
   * su plan. El input se valida segun el slug del template.
   */
  async render(
    userId: number,
    slug: string,
    input: any,
  ): Promise<{ html: string; meta: Template3DMeta }> {
    const meta = this.listTemplates().find((t) => t.slug === slug);
    if (!meta) throw new NotFoundException(`Template "${slug}" no existe.`);

    await this.assertPlanAllows(userId, meta.minPlan);

    if (slug === 'product-showcase') {
      const parsed = this.parseProductShowcaseInput(input);
      const html = renderProductShowcase(parsed);
      return { html, meta };
    }

    throw new NotFoundException(`Template "${slug}" no tiene renderer.`);
  }

  /**
   * Valida que el plan del usuario sea >= minPlan del template. Tiers:
   *  free < starter < pro < studio
   */
  private async assertPlanAllows(
    userId: number,
    minPlan: Template3DMeta['minPlan'],
  ): Promise<void> {
    const order = { free: 0, starter: 1, pro: 2, studio: 3 } as const;
    const caps = await this.studioPlans.getCapabilities(userId);
    const userTier = caps.planSlug.replace(/^studio-/, '') as keyof typeof order;
    const userLevel = order[userTier] ?? 0;
    const required = order[minPlan] ?? 0;
    if (userLevel < required) {
      throw new ForbiddenException(
        `Este template 3D requiere plan ${minPlan.toUpperCase()} o superior. ` +
          `Tu plan actual es ${caps.planName}.`,
      );
    }
    // Tambien validar la flag canUse3DTemplates por si acaso.
    if (!caps.editor.canUse3DTemplates && minPlan !== 'free') {
      throw new ForbiddenException(
        `Tu plan ${caps.planName} no incluye templates 3D. ` +
          `Mejora a Pro o Studio para usarlos.`,
      );
    }
  }

  /**
   * Sanitiza y normaliza el input del template Product Showcase. Aplica
   * defaults razonables a campos opcionales y valida los obligatorios.
   */
  private parseProductShowcaseInput(raw: any): ProductShowcaseInput {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Input invalido para product-showcase');
    }
    const palette = raw.palette || {};
    const fonts = raw.fonts || {};
    const model = raw.model || { kind: 'placeholder', shape: 'torusKnot', primaryColor: palette.primary || '#6366f1' };

    return {
      productName: String(raw.productName || 'Producto').slice(0, 80),
      tagline: String(raw.tagline || 'Descubrelo ahora').slice(0, 200),
      description: String(
        raw.description ||
          'Una experiencia disenada al detalle, pensada para quienes buscan algo mas que un producto.',
      ).slice(0, 1000),
      ctaText: String(raw.ctaText || 'Comprar ahora').slice(0, 30),
      ctaHref: String(raw.ctaHref || '#contacto').slice(0, 500),
      model:
        model.kind === 'gltf' && typeof model.url === 'string' && model.url
          ? { kind: 'gltf', url: model.url }
          : {
              kind: 'placeholder',
              shape: ['box', 'sphere', 'torus', 'torusKnot'].includes(model.shape)
                ? model.shape
                : 'torusKnot',
              primaryColor: model.primaryColor || palette.primary || '#6366f1',
              accentColor: model.accentColor || palette.accent,
            },
      palette: {
        primary: palette.primary || '#0f172a',
        secondary: palette.secondary || '#1e293b',
        accent: palette.accent || '#6366f1',
        bg: palette.bg || '#ffffff',
        text: palette.text || '#0f172a',
      },
      fonts: {
        heading: fonts.heading || 'Inter',
        body: fonts.body || 'Inter',
      },
      features: Array.isArray(raw.features)
        ? raw.features
            .slice(0, 6)
            .filter((f: any) => f && typeof f.label === 'string')
            .map((f: any) => ({ icon: f.icon, label: String(f.label).slice(0, 40) }))
        : [],
    };
  }
}
