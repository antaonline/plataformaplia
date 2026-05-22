import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { addMonths, formatDistanceToNowStrict } from 'date-fns';
import { HostingAccount, HostingAccountStatus, HostedSiteType, PlanServiceType, Prisma } from '@prisma/client';
import * as fs from 'fs';
import { dirname, join, resolve, sep } from 'path';

import { CyberpanelService, StoredCyberpanelAccount } from '../integrations/cyberpanel/cyberpanel.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { IzipayService } from '../payments/izipay.service';
import { CreateHostedSiteDto } from './dto/create-hosted-site.dto';
import { InstallWordPressDto } from './dto/install-wordpress.dto';
import { PrepareHostingCheckoutDto } from './dto/prepare-hosting-checkout.dto';
import {
  HOSTING_PLAN_DEFINITIONS,
  HOSTING_TERM_OPTIONS,
  HostingPlanDefinition,
  getHostingPlanDefinition,
} from './hosting.catalog';

type UploadFile = {
  path: string;
  originalname: string;
};

@Injectable()
export class HostingService {
  private readonly logger = new Logger(HostingService.name);

  constructor(
    private prisma: PrismaService,
    private cyberpanelService: CyberpanelService,
    private mailService: MailService,
    @Inject(forwardRef(() => IzipayService))
    private izipay: IzipayService,
  ) {}

  private get baseDomain() {
    return (process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe').trim().toLowerCase();
  }

  private get sitesRoot() {
    return process.env.CYBERPANEL_SITES_ROOT || '/home';
  }

  private get publicDir() {
    return process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
  }

  private toMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private getPlanDefinitionOrThrow(slug: string) {
    const definition = getHostingPlanDefinition(slug);
    if (!definition) {
      throw new BadRequestException('Plan de hosting invalido.');
    }
    return definition;
  }

  private buildPlanPayload(plan: HostingPlanDefinition) {
    return {
      name: plan.name,
      description: plan.description,
      price: plan.monthlyPricing[12],
      hostingYear: false,
      slug: `hosting-${plan.slug}`,
      serviceType: PlanServiceType.HOSTING_ONLY,
    };
  }

  private async queryCount(sql: string) {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ count?: bigint | number | string }>>(sql);
    const value = rows?.[0]?.count ?? 0;
    return Number(value);
  }

  private async assertHostingSchemaReady() {
    const requiredChecks = [
      {
        ok: await this.queryCount(
          "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plan' AND COLUMN_NAME = 'slug'",
        ),
        label: 'plan.slug',
      },
      {
        ok: await this.queryCount(
          "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plan' AND COLUMN_NAME = 'serviceType'",
        ),
        label: 'plan.serviceType',
      },
      {
        ok: await this.queryCount(
          "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hostingaccount'",
        ),
        label: 'hostingaccount',
      },
      {
        ok: await this.queryCount(
          "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hostedsite'",
        ),
        label: 'hostedsite',
      },
      {
        ok: await this.queryCount(
          "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hostedmailbox'",
        ),
        label: 'hostedmailbox',
      },
    ];

    const missing = requiredChecks.filter((check) => !check.ok).map((check) => check.label);
    if (missing.length) {
      throw new BadRequestException(
        `El modulo de hosting aun no esta instalado en la base de datos. Faltan: ${missing.join(', ')}. Ejecuta "npx prisma db push" y luego "npx prisma generate" en backend.`,
      );
    }
  }

  async ensureCatalogPlans() {
    await this.assertHostingSchemaReady();

    for (const definition of Object.values(HOSTING_PLAN_DEFINITIONS)) {
      const data = this.buildPlanPayload(definition);
      try {
        await this.prisma.plan.upsert({
          where: { slug: data.slug },
          update: data,
          create: data,
        });
      } catch (error: any) {
        this.logger.error(
          `No se pudo sincronizar el plan de hosting ${data.slug}: ${error?.message || error}`,
        );
        throw new BadRequestException(
          `No se pudo sincronizar el catalogo de hosting en la base de datos: ${error?.message || 'error desconocido'}`,
        );
      }
    }
  }

  async getPublicPlans() {
    return Object.values(HOSTING_PLAN_DEFINITIONS).map((plan) => ({
      slug: plan.slug,
      name: plan.name.replace(/^Hosting\s+/i, ''),
      description: plan.description,
      regularMonthlyPrice: plan.regularMonthlyPrice,
      monthlyPricing: plan.monthlyPricing,
      features: plan.features,
      storageMb: plan.storageMb,
      maxSites: plan.maxSites,
      termOptions: HOSTING_TERM_OPTIONS,
    }));
  }

  async getUpgradePreview(userId: number, targetSlug: string) {
    const targetDef = getHostingPlanDefinition(targetSlug);
    if (!targetDef) throw new NotFoundException('Plan no encontrado.');

    const sub = await this.prisma.hostingSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (!sub) throw new BadRequestException('No tienes una suscripcion activa para mejorar.');
    const currentSlug = sub.plan.slug;
    if (!currentSlug) throw new BadRequestException('El plan actual no es valido.');

    const currentDef = getHostingPlanDefinition(currentSlug.replace(/^hosting-/, ''));
    if (!currentDef) throw new BadRequestException('No se pudo determinar tu plan actual.');

    // Calcular dias restantes
    const now = new Date();
    const end = new Date(sub.endDate);
    if (now >= end) throw new BadRequestException('Tu suscripcion ha expirado o esta por renovarse.');

    const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Asumimos ciclo de 12 meses (anual) que es lo comun en los registros actuales
    const currentYearly = (currentDef.monthlyPricing[12] || currentDef.regularMonthlyPrice) * 12;
    const targetYearly = (targetDef.monthlyPricing[12] || targetDef.regularMonthlyPrice) * 12;

    if (targetYearly <= currentYearly) {
      throw new BadRequestException('El plan seleccionado no es superior al actual.');
    }

    const diffPerDay = (targetYearly - currentYearly) / 365;
    const upgradeCost = Math.max(0, Math.round(diffPerDay * remainingDays * 100) / 100);

    return {
      currentPlan: sub.plan.name,
      targetPlan: targetDef.name,
      remainingDays,
      upgradeCost,
      currency: 'PEN',
      hasSavedCard: !!sub.cardToken,
    };
  }

  async upgradePlan(userId: number, targetSlug: string, useSavedCard = true) {
    const preview = await this.getUpgradePreview(userId, targetSlug);
    const targetDef = getHostingPlanDefinition(targetSlug)!;
    
    const sub = await this.prisma.hostingSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true, account: true, user: true },
    });

    if (!sub) throw new BadRequestException('Suscripcion no encontrada.');

    // 1. Procesar Pago
    if (useSavedCard && sub.cardToken) {
      // Intento de cobro tokenizado
      try {
        const charge = await this.izipay.chargeTokenized({
          amount: preview.upgradeCost,
          cardToken: sub.cardToken,
          orderId: sub.id, // O crear una orden especifica
        });
        
        const state = charge?.order?.[0]?.status ?? charge?.status;
        if (state !== 'PAID' && state !== 'APPROVED' && state !== 'AUTHORIZED' && state !== 'SUCCESS') {
          throw new Error('Pago tokenizado rechazado');
        }
      } catch (err: any) {
        this.logger.error(`Error en cobro tokenizado para upgrade: ${err.message}`);
        throw new BadRequestException('No se pudo procesar el pago con tu tarjeta guardada. Por favor usa una nueva.');
      }
    } else {
      // Generar sesion para pago manual (Izipay pop-up)
      const session = await this.izipay.createSession({
        amount: preview.upgradeCost,
        orderNumber: `UPG-${sub.id}-${Date.now()}`,
      });
      return {
        requiresManualPayment: true,
        session,
        upgradeData: { targetSlug, cost: preview.upgradeCost },
      };
    }

    // 2. Aplicar Upgrade (Si el pago fue exitoso o tokenizado)
    return this.executeUpgradeLogic(sub, targetDef, preview.upgradeCost);
  }

  async confirmUpgrade(userId: number, payload: any, targetSlug: string) {
    const response = payload?.response ?? payload;
    const signature = payload?.signature ?? payload?.hash ?? '';
    if (signature && !this.izipay.validateResponse(response, signature)) {
      throw new BadRequestException('Firma invalida');
    }

    const state = response?.order?.[0]?.status ?? response?.status;
    const successCodes = ['00', 'AUTHORIZED', 'APPROVED', 'PAID', 'SUCCESS'];
    if (state && !successCodes.includes(state)) {
      throw new BadRequestException('Pago de mejora rechazado');
    }

    const sub = await this.prisma.hostingSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true, account: true },
    });
    if (!sub) throw new NotFoundException('Suscripcion no encontrada');

    const targetDef = getHostingPlanDefinition(targetSlug);
    if (!targetDef) throw new NotFoundException('Plan destino no encontrado');

    const cardToken = response?.token?.cardToken ?? response?.cardToken ?? null;
    if (cardToken) {
      await this.prisma.hostingSubscription.update({
        where: { id: sub.id },
        data: { cardToken },
      });
    }

    const preview = await this.getUpgradePreview(userId, targetSlug);
    return this.executeUpgradeLogic(sub, targetDef, preview.upgradeCost);
  }

  private async executeUpgradeLogic(sub: any, targetDef: HostingPlanDefinition, cost: number) {
    const targetPlan = await this.prisma.plan.findUnique({ where: { slug: `hosting-${targetDef.slug}` } });
    if (!targetPlan) throw new NotFoundException('Plan destino no encontrado en DB.');

    // 1. Actualizar Suscripcion
    await this.prisma.hostingSubscription.update({
      where: { id: sub.id },
      data: {
        planId: targetPlan.id,
        cycleAmount: (targetDef.monthlyPricing[12] || targetDef.regularMonthlyPrice) * 12,
        metadata: {
          ...(sub.metadata as any || {}),
          planSlug: targetDef.slug,
          upgradedAt: new Date().toISOString(),
          upgradeCostPaid: cost,
          previousPlan: sub.plan.slug,
        },
      },
    });

    // 2. Actualizar HostingAccount (limites)
    if (sub.account) {
      await this.prisma.hostingAccount.update({
        where: { id: sub.account.id },
        data: {
          packageName: targetDef.packageName,
          maxSites: targetDef.maxSites,
          storageMb: targetDef.storageMb,
          bandwidthMb: targetDef.bandwidthMb,
          mailboxesPerSite: targetDef.mailboxesPerSite,
        },
      });

      // 3. CyberPanel Sync
      try {
        await this.cyberpanelService.changePackage(
          sub.account.cyberpanelUsername,
          targetDef.packageName,
        );
      } catch (err: any) {
        this.logger.error(`Error actualizando paquete en CyberPanel para ${sub.account.cyberpanelUsername}: ${err.message}`);
      }
    }

    return {
      ok: true,
      message: `Tu plan ha sido mejorado a ${targetDef.name} correctamente.`,
      costPaid: cost,
    };
  }

  async prepareCheckout(dto: PrepareHostingCheckoutDto, userId?: number) {
    try {
      await this.assertHostingSchemaReady();
      await this.ensureCatalogPlans();

      const billingCycleMonths = Number(dto.billingCycleMonths);
      if (!HOSTING_TERM_OPTIONS.includes(billingCycleMonths as any)) {
        throw new BadRequestException('Plazo de hosting invalido.');
      }

      const definition = this.getPlanDefinitionOrThrow(dto.planSlug);
      const monthlyPrice = definition.monthlyPricing[billingCycleMonths as 1 | 12 | 24 | 48];
      const total = this.toMoney(monthlyPrice * billingCycleMonths);
      const regularTotal = this.toMoney(definition.regularMonthlyPrice * billingCycleMonths);
      const planRecord = await this.prisma.plan.findUnique({
        where: { slug: `hosting-${definition.slug}` },
      });

      if (!planRecord) {
        throw new BadRequestException('No se pudo preparar el plan de hosting.');
      }

      const order = await this.prisma.order.create({
        data: {
          userId,
          email: dto.email,
          planId: planRecord.id,
          amount: total,
          currency: 'PEN',
          billingCycleMonths,
          metadata: JSON.stringify({
            service: 'hosting-only',
            planSlug: definition.slug,
            planName: definition.name,
            monthlyPrice,
            regularMonthlyPrice: definition.regularMonthlyPrice,
            regularTotal,
            packageName: definition.packageName,
            maxSites: definition.maxSites,
            storageMb: definition.storageMb,
            bandwidthMb: definition.bandwidthMb,
            mailboxesPerSite: definition.mailboxesPerSite,
          }),
        },
      });

      return {
        orderId: order.id,
        service: 'hosting-only',
        plan: {
          id: planRecord.id,
          slug: definition.slug,
          name: definition.name,
          monthlyPrice,
          regularMonthlyPrice: definition.regularMonthlyPrice,
          billingCycleMonths,
        },
        summary: {
          subtotal: total,
          taxes: 0,
          total,
          currency: 'PEN',
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `prepareCheckout fallo para plan=${dto?.planSlug} term=${dto?.billingCycleMonths}: ${error?.message || error}`,
      );
      throw new BadRequestException(
        `No se pudo preparar el checkout de hosting: ${error?.message || 'error en backend'}`,
      );
    }
  }

  private computeStorageUsageMb(sites: Array<{ storageUsedMb: number }>) {
    return sites.reduce((acc, site) => acc + Number(site.storageUsedMb || 0), 0);
  }

  private computeMailboxesUsed(
    sites: Array<{
      mailboxes?: Array<{ id: number }>;
    }>,
  ) {
    return sites.reduce((acc, site) => acc + (site.mailboxes?.length ?? 0), 0);
  }

  private getSiteRoot(domain: string) {
    return join(this.sitesRoot, domain, this.publicDir);
  }

  private normalizeSubdomain(value: string) {
    const raw = (value || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(new RegExp(`\\.${this.baseDomain}$`), '');

    const cleaned = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    return cleaned.slice(0, 30);
  }

  private normalizeCustomDomain(value: string) {
    const raw = (value || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(raw)) {
      return '';
    }
    return raw;
  }

  private sanitizeSiteName(value: string) {
    const cleaned = (value || '').trim().replace(/\s+/g, ' ');
    return cleaned.slice(0, 80) || 'Nuevo sitio';
  }

  private getResolvedDomain(dto: CreateHostedSiteDto) {
    if (dto.mode === 'subdomain') {
      const subdomain = this.normalizeSubdomain(dto.subdomain || '');
      if (!subdomain || subdomain.length < 3) {
        throw new BadRequestException('Debes indicar un subdominio valido.');
      }
      return {
        domain: `${subdomain}.${this.baseDomain}`,
        siteType: HostedSiteType.SUBDOMAIN,
      };
    }

    const domain = this.normalizeCustomDomain(dto.domain || '');
    if (!domain) {
      throw new BadRequestException('Debes indicar un dominio valido.');
    }
    return {
      domain,
      siteType: HostedSiteType.CUSTOM_DOMAIN,
    };
  }

  private async assertDomainAvailable(domain: string) {
    const existingHostedSite = await this.prisma.hostedSite.findUnique({
      where: { domain },
    });
    if (existingHostedSite) {
      throw new BadRequestException('Ese dominio ya esta en uso dentro de hosting.');
    }

    const existingProject = await this.prisma.project.findFirst({
      where: {
        onboardingData: { contains: `"publicDomain":"${domain}"` },
      },
      select: { id: true },
    });

    if (existingProject) {
      throw new BadRequestException('Ese dominio ya esta siendo usado por otro proyecto.');
    }
  }

  private async getAccountOrThrow(userId: number) {
    const account = await this.prisma.hostingAccount.findUnique({
      where: { userId },
      include: {
        activeSubscription: {
          include: { plan: true },
        },
        sites: {
          include: { mailboxes: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('No tienes una cuenta de hosting activa.');
    }

    return account;
  }

  private assertWritableAccount(account: HostingAccount & { activeSubscription: any }) {
    if (!account.activeSubscription) {
      throw new BadRequestException('Tu cuenta de hosting no tiene una suscripcion activa.');
    }
    if (account.status !== HostingAccountStatus.ACTIVE) {
      throw new BadRequestException('Tu cuenta de hosting no esta habilitada para cambios.');
    }
  }

  private buildDashboardPayload(account: Awaited<ReturnType<HostingService['getAccountOrThrow']>>) {
    const sites = account.sites;
    const storageUsedMb = this.computeStorageUsageMb(sites);
    const mailboxesUsed = this.computeMailboxesUsed(sites);
    const maxMailboxes = account.maxSites * account.mailboxesPerSite;
    const wordpressCount = sites.filter((site) => site.appType === 'WORDPRESS').length;
    const sslActiveCount = sites.filter((site) => site.sslStatus === 'ACTIVE').length;
    const decryptedPassword = this.cyberpanelService.revealStoredPassword(account.encryptedPassword ?? undefined);

    const metadata = account.metadata ? JSON.parse(account.metadata) : {};
    const subMetadata = account.activeSubscription?.metadata ? JSON.parse(account.activeSubscription.metadata) : {};

    return {
      account: {
        id: account.id,
        status: account.status,
        packageName: account.packageName,
        technicalAccess: {
          panelUrl: account.panelUrl,
          username:
            metadata.ownerType === 'shared-admin'
              ? null
              : account.cyberpanelUsername,
          password:
            metadata.ownerType === 'shared-admin'
              ? null
              : decryptedPassword || null,
          managedByPlia: metadata.ownerType === 'shared-admin',
        },
      },
      plan: {
        name: account.activeSubscription?.plan?.name ?? 'Hosting PLIA',
        slug: subMetadata.planSlug ?? 
              (account.activeSubscription?.plan?.slug ? account.activeSubscription.plan.slug.replace(/^hosting-/, '') : null),
        billingCycleMonths: account.activeSubscription?.billingCycleMonths ?? 12,
        renewsAt: account.activeSubscription?.endDate ?? null,
        price: Number(account.activeSubscription?.cycleAmount ?? 0),
      },
      usage: {
        websites: {
          used: sites.length,
          max: account.maxSites,
        },
        storage: {
          usedMb: storageUsedMb,
          maxMb: account.storageMb,
        },
        emails: {
          used: mailboxesUsed,
          max: maxMailboxes,
        },
        bandwidth: {
          usedMb: 0,
          maxMb: account.bandwidthMb,
        },
        wordpress: {
          used: wordpressCount,
          max: sites.length,
        },
        ssl: {
          active: sslActiveCount,
          total: sites.length,
        },
      },
      sites: sites.map((site) => ({
        id: site.id,
        name: site.name,
        domain: site.domain,
        publicUrl: site.publicUrl,
        status: site.status,
        appType: site.appType,
        sslStatus: site.sslStatus,
        storageUsedMb: site.storageUsedMb,
        storageLimitMb: account.storageMb,
        uploadCount: site.uploadCount,
        lastUploadedAt: site.lastUploadedAt,
        lastDeployedAt: site.lastDeployedAt,
        createdAt: site.createdAt,
        createdAgo: formatDistanceToNowStrict(new Date(site.createdAt), { addSuffix: true }),
        mailboxesUsed: site.mailboxes.length,
        mailboxesLimit: account.mailboxesPerSite,
      })),
    };
  }

  async getDashboard(userId: number) {
    await this.assertHostingSchemaReady();
    const account = await this.getAccountOrThrow(userId);
    return this.buildDashboardPayload(account);
  }

  private cleanDirectoryPreserving(rootPath: string, preserve: string[] = []) {
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
      return;
    }

    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (preserve.includes(entry.name)) {
        continue;
      }
      const fullPath = join(rootPath, entry.name);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }

  private computeDirectorySizeMb(rootPath: string) {
    if (!fs.existsSync(rootPath)) {
      return 0;
    }

    let totalBytes = 0;
    const queue = [rootPath];

    while (queue.length > 0) {
      const current = queue.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const fullPath = join(current, entry.name);
        if (entry.isDirectory()) {
          queue.push(fullPath);
        } else {
          totalBytes += fs.statSync(fullPath).size;
        }
      }
    }

    return Math.max(1, Math.ceil(totalBytes / (1024 * 1024)));
  }

  private normalizeUploadPaths(relativePaths: string[]) {
    const parts = relativePaths.map((path) =>
      path
        .replace(/\\/g, '/')
        .split('/')
        .filter(Boolean),
    );
    const hasSharedTopFolder =
      parts.length > 0 &&
      parts.every((segments) => segments.length > 1 && segments[0] === parts[0][0]);

    return parts.map((segments) => {
      const normalized = hasSharedTopFolder ? segments.slice(1) : segments;
      return normalized.join('/');
    });
  }

  private sanitizeUploadRelativePath(pathValue: string) {
    const normalized = (pathValue || '')
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean)
      .join('/');

    if (!normalized) {
      throw new BadRequestException('Uno de los archivos subidos no tiene ruta valida.');
    }

    if (normalized.startsWith('/') || normalized.includes('..')) {
      throw new BadRequestException('Se detecto una ruta de archivo invalida.');
    }

    return normalized;
  }

  private ensureChildPath(parentPath: string, relativePath: string) {
    const parent = resolve(parentPath);
    const target = resolve(parent, relativePath);

    if (target !== parent && !target.startsWith(`${parent}${sep}`)) {
      throw new BadRequestException('Se detecto una ruta insegura al publicar archivos.');
    }

    return target;
  }

  private cleanupTemporaryUploads(files: UploadFile[]) {
    for (const file of files) {
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.rmSync(file.path, { force: true });
        }
      } catch {
        // ignore temp cleanup errors
      }
    }
  }

  async provisionApprovedOrder(orderId: number, userId: number, cardToken?: string) {
    await this.assertHostingSchemaReady();
    await this.ensureCatalogPlans();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        plan: true,
        user: true,
      },
    });

    if (!order || !order.plan) {
      throw new NotFoundException('Orden de hosting no encontrada.');
    }

    if (order.plan.serviceType !== PlanServiceType.HOSTING_ONLY || !order.plan.slug) {
      throw new BadRequestException('La orden no corresponde a un servicio de hosting.');
    }

    const existingSubscription = await this.prisma.hostingSubscription.findUnique({
      where: { sourceOrderId: order.id },
    });

    if (existingSubscription) {
      return this.getDashboard(userId);
    }

    const planSlug = order.plan.slug;
    const definition = this.getPlanDefinitionOrThrow(planSlug.replace(/^hosting-/, ''));
    const cycleMonths = order.billingCycleMonths || 12;
    const cycleAmount = Number(order.amount);
    const endDate = addMonths(new Date(), cycleMonths);
    const provision = await this.cyberpanelService.ensureHostingAccountForUser(
      {
        id: userId,
        name: order.user?.name || order.email?.split('@')[0] || `cliente${userId}`,
        email: order.user?.email || order.email || `cliente${userId}@${this.baseDomain}`,
      },
      {
        packageName: definition.packageName,
        maxSites: definition.maxSites,
        sourceLabel: `hosting-order-${order.id}`,
      },
    );

    const subscription = await this.prisma.hostingSubscription.create({
      data: {
        projectId: null,
        userId,
        planId: order.planId,
        sourceOrderId: order.id,
        serviceType: PlanServiceType.HOSTING_ONLY,
        billingCycleMonths: cycleMonths,
        cycleAmount,
        metadata: JSON.stringify({
          planSlug: definition.slug,
          packageName: definition.packageName,
          maxSites: definition.maxSites,
          storageMb: definition.storageMb,
          bandwidthMb: definition.bandwidthMb,
          mailboxesPerSite: definition.mailboxesPerSite,
        }),
        startDate: new Date(),
        endDate,
        nextBillingAt: endDate,
        renewalDueAt: endDate,
        cardToken: cardToken ?? null,
        status: 'ACTIVE',
      },
    });

    await this.prisma.hostingAccount.upsert({
      where: { userId },
      update: {
        activeSubscriptionId: subscription.id,
        packageName: definition.packageName,
        status: HostingAccountStatus.ACTIVE,
        maxSites: definition.maxSites,
        storageMb: definition.storageMb,
        bandwidthMb: definition.bandwidthMb,
        mailboxesPerSite: definition.mailboxesPerSite,
        cyberpanelUsername: provision.account.username,
        email: provision.account.email,
        panelUrl: provision.account.panelUrl,
        encryptedPassword: provision.account.encryptedPassword ?? undefined,
        metadata: JSON.stringify({
          source: 'hosting-order',
          sourceOrderId: order.id,
          ownerType: provision.account.ownerType,
        }),
      },
      create: {
        userId,
        activeSubscriptionId: subscription.id,
        packageName: definition.packageName,
        status: HostingAccountStatus.ACTIVE,
        maxSites: definition.maxSites,
        storageMb: definition.storageMb,
        bandwidthMb: definition.bandwidthMb,
        mailboxesPerSite: definition.mailboxesPerSite,
        cyberpanelUsername: provision.account.username,
        email: provision.account.email,
        panelUrl: provision.account.panelUrl,
        encryptedPassword: provision.account.encryptedPassword,
        metadata: JSON.stringify({
          source: 'hosting-order',
          sourceOrderId: order.id,
          ownerType: provision.account.ownerType,
        }),
      },
    });

    if (
      order.user?.email &&
      provision.account.ownerType === 'customer' &&
      (provision.accountCreated || provision.plainPassword)
    ) {
      await this.mailService.sendHostingPanelReady(order.user.email, {
        planName: definition.name,
        loginUrl: `${(process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '')}/dashboard/hosting`,
        hostingAccess: {
          panelUrl: provision.account.panelUrl,
          username: provision.account.username,
          password: provision.plainPassword ?? this.cyberpanelService.revealStoredPassword(provision.account.encryptedPassword) ?? '',
        },
      });
    }

    return this.getDashboard(userId);
  }

  async createSite(userId: number, dto: CreateHostedSiteDto) {
    await this.assertHostingSchemaReady();
    const account = await this.getAccountOrThrow(userId);
    this.assertWritableAccount(account);

    if (account.sites.length >= account.maxSites) {
      throw new BadRequestException('Ya alcanzaste el limite de sitios de tu plan.');
    }

    const { domain, siteType } = this.getResolvedDomain(dto);
    await this.assertDomainAvailable(domain);

    const rootPath = this.getSiteRoot(domain);
    const publicUrl = `https://${domain}`;
    const site = await this.prisma.hostedSite.create({
      data: {
        hostingAccountId: account.id,
        name: this.sanitizeSiteName(dto.name),
        domain,
        siteType,
        status: 'PROVISIONING',
        sslStatus: siteType === HostedSiteType.SUBDOMAIN ? 'ACTIVE' : 'PENDING',
        rootPath,
        publicUrl,
      },
    });

    try {
      const ownerPassword =
        this.cyberpanelService.revealStoredPassword(account.encryptedPassword ?? undefined) ||
        process.env.CYBERPANEL_EXISTING_USER_PASSWORD ||
        '';

      if (!ownerPassword) {
        throw new BadRequestException(
          'No se pudo recuperar la credencial tecnica del usuario de hosting.',
        );
      }

      const storedAccount: StoredCyberpanelAccount = {
        username: account.cyberpanelUsername,
        email: account.email,
        panelUrl: account.panelUrl,
        ownerType: 'customer',
        createdAt: account.createdAt.toISOString(),
        encryptedPassword: account.encryptedPassword ?? undefined,
      };

      await this.cyberpanelService.createSiteForAccount(
        domain,
        storedAccount,
        ownerPassword,
        account.packageName,
      );

      return this.prisma.hostedSite.update({
        where: { id: site.id },
        data: {
          status: 'ACTIVE',
          metadata: JSON.stringify({
            createdVia: 'plia-hosting-dashboard',
          }),
        },
      });
    } catch (error: any) {
      await this.prisma.hostedSite.update({
        where: { id: site.id },
        data: {
          status: 'ERROR',
          metadata: JSON.stringify({
            error: error?.message || 'No se pudo crear el sitio en CyberPanel.',
          }),
        },
      });
      throw error;
    }
  }

  async deleteSite(userId: number, siteId: number) {
    await this.assertHostingSchemaReady();
    const site = await this.prisma.hostedSite.findUnique({
      where: { id: siteId },
      include: {
        hostingAccount: true,
      },
    });

    if (!site || site.hostingAccount.userId !== userId) {
      throw new NotFoundException('Sitio no encontrado.');
    }

    await this.cyberpanelService.deleteSiteByDomain(site.domain);
    await this.prisma.hostedMailbox.deleteMany({
      where: { hostedSiteId: site.id },
    });
    await this.prisma.hostedSite.delete({
      where: { id: site.id },
    });

    return { ok: true };
  }

  async uploadSiteFiles(
    userId: number,
    siteId: number,
    files: UploadFile[],
    rawPaths: string[],
  ) {
    await this.assertHostingSchemaReady();
    const site = await this.prisma.hostedSite.findUnique({
      where: { id: siteId },
      include: {
        hostingAccount: {
          include: {
            activeSubscription: true,
          },
        },
      },
    });

    if (!site || site.hostingAccount.userId !== userId) {
      this.cleanupTemporaryUploads(files);
      throw new NotFoundException('Sitio no encontrado.');
    }

    this.assertWritableAccount(site.hostingAccount as any);

    if (!files.length) {
      throw new BadRequestException('Debes subir al menos un archivo.');
    }

    if (!rawPaths.length || rawPaths.length !== files.length) {
      this.cleanupTemporaryUploads(files);
      throw new BadRequestException('La carga no incluyo rutas validas para los archivos.');
    }

    const normalizedPaths = this.normalizeUploadPaths(rawPaths);
    const targetRoot = resolve(site.rootPath);

    try {
      fs.mkdirSync(targetRoot, { recursive: true });

      // Si había WordPress, intentamos leer la BD para borrarla y dejar el entorno limpio.
      const wpConfigPath = join(targetRoot, 'wp-config.php');
      if (fs.existsSync(wpConfigPath)) {
        try {
          const wpConfig = fs.readFileSync(wpConfigPath, 'utf8');
          const dbNameMatch = wpConfig.match(/define\(\s*'DB_NAME'\s*,\s*'([^']+)'\s*\);/);
          if (dbNameMatch && dbNameMatch[1]) {
            await this.cyberpanelService.deleteDatabase(dbNameMatch[1]);
            this.logger.log(`Base de datos ${dbNameMatch[1]} eliminada tras sobreescribir WordPress.`);
          }
        } catch (e) {
          this.logger.warn(`No se pudo eliminar la base de datos de WordPress del sitio ${site.domain}: ${e.message}`);
        }
      }

      this.cleanDirectoryPreserving(targetRoot, ['.well-known']);

      normalizedPaths.forEach((relativePath, index) => {
        const safeRelativePath = this.sanitizeUploadRelativePath(relativePath);
        const destination = this.ensureChildPath(targetRoot, safeRelativePath);
        fs.mkdirSync(dirname(destination), { recursive: true });
        fs.copyFileSync(files[index].path, destination);
      });

      const indexPath = join(targetRoot, 'index.html');
      if (!fs.existsSync(indexPath)) {
        throw new BadRequestException(
          'Tu carga no contiene un index.html en la raiz del sitio exportado.',
        );
      }

      const storageUsedMb = this.computeDirectorySizeMb(targetRoot);
      const updated = await this.prisma.hostedSite.update({
        where: { id: site.id },
        data: {
          appType: 'STATIC_UPLOAD',
          status: 'ACTIVE',
          storageUsedMb,
          uploadCount: { increment: 1 },
          lastUploadedAt: new Date(),
          lastDeployedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(site.metadata || '{}'),
            lastUploadFiles: files.length,
            lastUploadAt: new Date().toISOString(),
          }),
        },
      });

      return updated;
    } finally {
      this.cleanupTemporaryUploads(files);
    }
  }

  async installWordPress(userId: number, siteId: number, dto: InstallWordPressDto) {
    await this.assertHostingSchemaReady();
    const site = await this.prisma.hostedSite.findUnique({
      where: { id: siteId },
      include: {
        hostingAccount: {
          include: {
            activeSubscription: true,
          },
        },
      },
    });

    if (!site || site.hostingAccount.userId !== userId) {
      throw new NotFoundException('Sitio no encontrado.');
    }

    this.assertWritableAccount(site.hostingAccount as any);

    try {
      await this.cyberpanelService.installWordPress({
        domainName: site.domain,
        blogTitle: dto.blogTitle,
        wpUser: dto.wpUser,
        wpPass: dto.wpPass,
        wpEmail: dto.wpEmail,
        websiteOwner: site.hostingAccount.cyberpanelUsername,
        installPath: dto.installPath,
      });

      return this.prisma.hostedSite.update({
        where: { id: site.id },
        data: {
          appType: 'WORDPRESS',
          status: 'ACTIVE',
          lastDeployedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(site.metadata || '{}'),
            wordpressInstalledAt: new Date().toISOString(),
            wordpressUser: dto.wpUser,
          }),
        },
      });
    } catch (error: any) {
      this.logger.error(`Error instalando WordPress en ${site.domain}: ${error.message}`);
      throw new BadRequestException(
        `No se pudo instalar WordPress: ${error.message || 'error en CyberPanel'}`,
      );
    }
  }
}
