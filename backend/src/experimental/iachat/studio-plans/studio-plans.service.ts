import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Identificador de cada API/herramienta creativa que PLIA Studio puede usar.
 * Coincide 1:1 con las columnas `canUse*` en StudioPlanLimits.
 */
export type CreativeTool =
  | 'claude'
  | 'dalle'
  | 'flux'
  | 'tripo3d'
  | 'meshy'
  | 'higsfield'
  | 'runway'
  | 'luma'
  | 'lottieLib';

/**
 * Nivel de complejidad visual que el usuario pidió en el chat conversacional.
 * Determina qué herramientas son recomendables (no necesariamente permitidas).
 */
export type VisualComplexity = 'simple' | 'modern' | 'clean' | 'premium';

/**
 * Resumen de capacidades del plan activo del usuario.
 * Lo usa el frontend para mostrar/ocultar features y el backend para validar.
 */
export interface StudioPlanCapabilities {
  planSlug: string;
  planName: string;
  isPaid: boolean;
  limits: {
    maxProjects: number; // -1 = ilimitado
    maxGenerationsPerMonth: number; // -1 = ilimitado
    generationsUsedThisMonth: number;
    projectsCount: number;
  };
  tools: Record<CreativeTool, boolean>;
  editor: {
    canEditCode: boolean;
    canUseAdvancedCanvas: boolean;
    canUseInlineEditing: boolean;
    canUse3DTemplates: boolean;
  };
  publishing: {
    canUseCustomDomain: boolean;
    hasWatermark: boolean;
    whiteLabelEnabled: boolean;
  };
  supportTier: 'community' | 'email' | 'priority';
}

/**
 * Decisión del AI Router sobre qué stack usar para una generación.
 * Se la pasa al CodegenService para que sepa qué APIs invocar.
 */
export interface GenerationStackDecision {
  tools: CreativeTool[];
  estimatedCostUsd: number;
  reasoning: string;
  warnings: string[]; // Ej: "Cliente pidió 3D pero su plan no incluye Tripo3D, se generó imagen 2D en su lugar"
}

/**
 * Costos estimados por uso (USD). Calibrados con tarifas reales aprox 2026.
 * Conservadores (alto) para presupuestar bien.
 */
const TOOL_COST_USD: Record<CreativeTool, number> = {
  claude: 0.05, // Una sesión de chat + código completa
  dalle: 0.08, // Una imagen HD
  flux: 0.05, // Una imagen
  tripo3d: 0.35, // Un modelo 3D
  meshy: 0.4,
  higsfield: 1.5, // Un video corto cinematográfico
  runway: 1.0, // Un video transition
  luma: 0.8,
  lottieLib: 0, // Librería propia
};

@Injectable()
export class StudioPlansService {
  private readonly logger = new Logger(StudioPlansService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene las capacidades del plan activo del usuario.
   * Si el usuario no tiene plan activo o el plan no es STUDIO, devuelve
   * el plan Free como fallback (igual al freemium actual).
   */
  async getCapabilities(userId: number): Promise<StudioPlanCapabilities> {
    // Buscar la suscripción activa más reciente del usuario que sea
    // STUDIO_SUBSCRIPTION. El schema de hostingSubscription usa startDate
    // como fecha de inicio (no createdAt — pifié al asumirlo cuando armé
    // este service). Si el usuario no tiene suscripción Studio activa,
    // cae al fallback de studio-free abajo.
    const sub = await (this.prisma as any).hostingSubscription.findFirst({
      where: {
        userId,
        plan: { serviceType: 'STUDIO_SUBSCRIPTION' },
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: {
        plan: { include: { studioLimits: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    let plan = sub?.plan;
    if (!plan) {
      plan = await (this.prisma as any).plan.findFirst({
        where: { slug: 'studio-free' },
        include: { studioLimits: true },
      });
    }
    if (!plan?.studioLimits) {
      throw new Error(
        'No se encontró configuración de planes de Studio. ¿Corriste la migration?',
      );
    }

    const limits = plan.studioLimits;

    // Contar uso actual del mes
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [projectsCount, generationsUsedThisMonth] = await Promise.all([
      (this.prisma as any).aiChat.count({ where: { userId } }),
      this.countGenerationsThisMonth(userId, monthStart),
    ]);

    return {
      planSlug: plan.slug,
      planName: plan.name,
      isPaid: plan.price > 0,
      limits: {
        maxProjects: limits.maxProjects,
        maxGenerationsPerMonth: limits.maxGenerationsPerMonth,
        generationsUsedThisMonth,
        projectsCount,
      },
      tools: {
        claude: limits.canUseClaude,
        dalle: limits.canUseDalle,
        flux: limits.canUseFlux,
        tripo3d: limits.canUseTripo3D,
        meshy: limits.canUseMeshy,
        higsfield: limits.canUseHigsfield,
        runway: limits.canUseRunway,
        luma: limits.canUseLumaAI,
        lottieLib: limits.canUseLottieLib,
      },
      editor: {
        canEditCode: limits.canEditCode,
        canUseAdvancedCanvas: limits.canUseAdvancedCanvas,
        canUseInlineEditing: limits.canUseInlineEditing,
        canUse3DTemplates: limits.canUse3DTemplates,
      },
      publishing: {
        canUseCustomDomain: limits.canUseCustomDomain,
        hasWatermark: limits.hasWatermark,
        whiteLabelEnabled: limits.whiteLabelEnabled,
      },
      supportTier: limits.supportTier as 'community' | 'email' | 'priority',
    };
  }

  /**
   * Cuenta cuántas generaciones consumió el usuario este mes.
   * Por ahora cuenta mensajes con role=assistant en sus chats. Cuando agreguemos
   * tabla `generation_log` se cambia a contar de ahí (más preciso).
   */
  private async countGenerationsThisMonth(
    userId: number,
    monthStart: Date,
  ): Promise<number> {
    // Solución temporal: contamos mensajes del bot en chats del usuario este mes.
    // Es una aproximación, pero refleja uso real bastante bien.
    try {
      const chats = await (this.prisma as any).aiChat.findMany({
        where: { userId },
        select: { id: true },
      });
      const chatIds = chats.map((c: any) => c.id);
      if (!chatIds.length) return 0;
      // El modelo se llama AiMessage en schema.prisma (no AiChatMessage —
      // segunda pifia mía al armar el service).
      const count = await (this.prisma as any).aiMessage.count({
        where: {
          chatId: { in: chatIds },
          role: 'assistant',
          createdAt: { gte: monthStart },
        },
      });
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * AI Router: decide qué herramientas usar según la intención del cliente
   * y el plan que tiene. Devuelve el stack óptimo + costo estimado + warnings.
   *
   * Lógica de decisión por complejidad:
   *   - 'simple'  → solo Claude + DALL-E (~$0.50)
   *   - 'modern'  → Claude + DALL-E + Lottie library (~$1.20)
   *   - 'clean'   → Claude + DALL-E + GSAP estático (~$1.50, sin video/3D)
   *   - 'premium' → Claude + Flux + Tripo3D + Higsfield + Runway (~$5-8)
   */
  decideStack(params: {
    capabilities: StudioPlanCapabilities;
    complexity: VisualComplexity;
    wants3D?: boolean;
    wantsVideo?: boolean;
    wantsCinematic?: boolean;
  }): GenerationStackDecision {
    const { capabilities, complexity, wants3D, wantsVideo, wantsCinematic } =
      params;
    const t = capabilities.tools;
    const warnings: string[] = [];

    // Base universal: Claude para chat + código.
    const tools: CreativeTool[] = [];
    if (t.claude) tools.push('claude');

    // Imágenes: preferir Flux si está habilitado (mejor calidad/costo en 2026),
    // si no DALL-E. Si no tiene ninguno, no hay imágenes (caso raro).
    if (complexity === 'premium' && t.flux) {
      tools.push('flux');
    } else if (t.dalle) {
      tools.push('dalle');
    } else if (t.flux) {
      tools.push('flux');
    }

    // Lottie: si está habilitado y la complejidad lo justifica, usar.
    if (t.lottieLib && complexity !== 'simple') {
      tools.push('lottieLib');
    }

    // 3D: solo si cliente lo pidió o complexity=premium Y plan lo permite.
    const needs3D = wants3D || complexity === 'premium';
    if (needs3D) {
      if (t.tripo3d) tools.push('tripo3d');
      else if (t.meshy) tools.push('meshy');
      else if (wants3D) {
        warnings.push(
          'El cliente pidió contenido 3D pero su plan no lo incluye. Se usará una imagen 2D en su lugar. Sugerir upgrade a Pro.',
        );
      }
    }

    // Video cinematográfico: solo si pidió Y plan lo permite.
    const needsVideo = wantsVideo || (complexity === 'premium' && wantsCinematic);
    if (needsVideo) {
      if (t.higsfield) tools.push('higsfield');
      else if (t.luma) tools.push('luma');
      else if (wantsVideo) {
        warnings.push(
          'El cliente pidió video cinematográfico pero su plan no lo incluye. Se usará una imagen estática. Sugerir upgrade a Studio.',
        );
      }
    }

    // Video transitions (Runway): solo para premium + Studio.
    if (complexity === 'premium' && t.runway) {
      tools.push('runway');
    }

    // Calcular costo estimado
    const estimatedCostUsd = tools.reduce(
      (acc, tool) => acc + (TOOL_COST_USD[tool] || 0),
      0,
    );

    const reasoning = this.buildReasoning(tools, complexity, capabilities);

    return { tools, estimatedCostUsd, reasoning, warnings };
  }

  private buildReasoning(
    tools: CreativeTool[],
    complexity: VisualComplexity,
    caps: StudioPlanCapabilities,
  ): string {
    const labels: Record<CreativeTool, string> = {
      claude: 'Claude para el código y textos',
      dalle: 'DALL-E para las imágenes',
      flux: 'Flux Pro para imágenes premium',
      tripo3d: 'Tripo3D para generar modelos 3D',
      meshy: 'Meshy para modelos 3D',
      higsfield: 'Higsfield para el video cinematográfico',
      runway: 'Runway para las transiciones',
      luma: 'Luma para video',
      lottieLib: 'animaciones Lottie de la librería propia',
    };
    const parts = tools.map((t) => labels[t]).join(', ');
    return `Plan ${caps.planName}: para complejidad "${complexity}" voy a usar ${parts}.`;
  }

  /**
   * Valida si el usuario puede crear un nuevo proyecto (no excedió maxProjects).
   * Lanza ForbiddenException con mensaje claro si no.
   */
  async assertCanCreateProject(userId: number): Promise<void> {
    const caps = await this.getCapabilities(userId);
    if (caps.limits.maxProjects === -1) return; // ilimitado
    if (caps.limits.projectsCount >= caps.limits.maxProjects) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${caps.limits.maxProjects} proyecto(s) del plan ${caps.planName}. Mejora tu plan para crear más.`,
      );
    }
  }

  /**
   * Valida si el usuario puede ejecutar una generación más este mes.
   */
  async assertCanGenerate(userId: number): Promise<void> {
    const caps = await this.getCapabilities(userId);
    if (caps.limits.maxGenerationsPerMonth === -1) return; // ilimitado
    if (
      caps.limits.generationsUsedThisMonth >=
      caps.limits.maxGenerationsPerMonth
    ) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${caps.limits.maxGenerationsPerMonth} generaciones mensuales del plan ${caps.planName}. Mejora tu plan o espera al próximo mes.`,
      );
    }
  }

  /**
   * Devuelve la lista pública de planes para mostrar en /planes.
   */
  async listPublicPlans() {
    return (this.prisma as any).plan.findMany({
      where: { serviceType: 'STUDIO_SUBSCRIPTION' },
      include: { studioLimits: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * SOLO ADMIN/DEV: cambia el plan Studio activo del usuario para hacer
   * pruebas con distintos tiers. Cancela las suscripciones Studio activas
   * previas y crea una nueva ACTIVE apuntando al plan elegido. Si el slug
   * es 'studio-free', solo cancela (el fallback de getCapabilities ya
   * devuelve free cuando no hay suscripción activa).
   *
   * Verificación de admin: role=ADMIN o userId en IACHAT_UNLIMITED_USER_IDS.
   */
  async devSetPlan(userId: number, slug: string): Promise<{ ok: boolean; planSlug: string }> {
    // Verificar admin.
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const envList = (process.env.IACHAT_UNLIMITED_USER_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isAdmin =
      user?.role === 'ADMIN' || envList.includes(String(userId));
    if (!isAdmin) {
      throw new ForbiddenException(
        'Solo cuentas admin pueden cambiar de plan manualmente.',
      );
    }

    const validSlugs = [
      'studio-free',
      'studio-starter',
      'studio-pro',
      'studio-agency',
    ];
    if (!validSlugs.includes(slug)) {
      throw new Error(`Slug de plan inválido: ${slug}`);
    }

    // Cancelar suscripciones Studio activas previas para que getCapabilities
    // no tome una vieja.
    await (this.prisma as any).hostingSubscription.updateMany({
      where: {
        userId,
        plan: { serviceType: 'STUDIO_SUBSCRIPTION' },
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      data: { status: 'CANCELLED' },
    });

    // studio-free no necesita suscripción (es el fallback).
    if (slug === 'studio-free') {
      return { ok: true, planSlug: 'studio-free' };
    }

    // Crear la nueva suscripción ACTIVE apuntando al plan elegido.
    const plan = await (this.prisma as any).plan.findFirst({
      where: { slug, serviceType: 'STUDIO_SUBSCRIPTION' },
    });
    if (!plan) {
      throw new Error(`Plan ${slug} no existe en la BD. ¿Corriste la migration?`);
    }

    const now = new Date();
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    await (this.prisma as any).hostingSubscription.create({
      data: {
        userId,
        planId: plan.id,
        serviceType: 'STUDIO_SUBSCRIPTION',
        status: 'ACTIVE',
        startDate: now,
        endDate: oneYear,
        nextBillingAt: oneYear,
        billingCycleMonths: 12,
        metadata: JSON.stringify({ devOverride: true, setAt: now.toISOString() }),
      },
    });

    return { ok: true, planSlug: slug };
  }
}
