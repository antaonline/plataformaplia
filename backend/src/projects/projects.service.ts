import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { ProjectStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { addDays, addHours } from 'date-fns';
import { AiService } from '../ai/ai.service';
import { CyberpanelService } from '../integrations/cyberpanel/cyberpanel.service';
import { MailService } from '../mail/mail.service';
import * as fs from 'fs';
import { join } from 'path';

const LANDING_DEVELOPMENT_HOURS = 24;
const WEB_DEVELOPMENT_DAYS = 2;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private cyberpanelService: CyberpanelService,
    private mailService: MailService,
  ) {}

  private normalizeSubdomain(value: unknown, baseDomain?: string) {
    let raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const suffix = (baseDomain || process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe')
      .trim()
      .toLowerCase();

    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (suffix && raw.endsWith(`.${suffix}`)) {
      raw = raw.slice(0, -(`.${suffix}`.length));
    }

    const cleaned = raw
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    if (!cleaned || cleaned.length < 3) return '';
    return cleaned.slice(0, 30);
  }

  private hasGeneratedOutput(projectId: number, onboardingData: any) {
    const aiGeneration = onboardingData?.aiGeneration || {};
    if (aiGeneration.status !== 'READY') {
      return false;
    }

    const previewIndex = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const hasPreview = fs.existsSync(previewIndex);
    const targetDir =
      typeof aiGeneration.target === 'string' && aiGeneration.target.trim()
        ? aiGeneration.target.trim()
        : '';
    const targetIndex = targetDir ? join(targetDir, 'index.html') : '';
    const hasPublishedTarget = targetIndex ? fs.existsSync(targetIndex) : false;

    if (onboardingData?.publicDomain) {
      return hasPublishedTarget;
    }

    return hasPublishedTarget || hasPreview;
  }

  private buildPreviewUrl(projectId: number) {
    const appUrl = (process.env.APP_URL || 'http://localhost:3001').replace(/\/$/, '');
    return `${appUrl}/uploads/previews/${projectId}/index.html`;
  }

  private getTargetDirectory(projectId: number, onboardingData: any) {
    const aiGeneration = onboardingData?.aiGeneration || {};
    if (typeof aiGeneration.target === 'string' && aiGeneration.target.trim()) {
      return aiGeneration.target.trim();
    }

    const domain = typeof onboardingData?.publicDomain === 'string' ? onboardingData.publicDomain.trim() : '';
    if (!domain) {
      return null;
    }

    const root = process.env.CYBERPANEL_SITES_ROOT || '/home';
    const publicDir = process.env.CYBERPANEL_PUBLIC_DIR || 'public_html';
    return join(root, domain, publicDir);
  }

  private async getProjectOrThrow(projectId: number, userId?: number, isAdmin = false) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: { include: { plan: true } },
        user: true,
        subscription: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    if (!isAdmin && userId && project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    return project;
  }

  async getGenerationDiagnostics(projectId: number, userId?: number, isAdmin = false) {
    const project = await this.getProjectOrThrow(projectId, userId, isAdmin);
    const onboardingData = (project.onboardingData as any) || {};
    const aiGeneration = onboardingData.aiGeneration || {};
    const cyberpanel = onboardingData.cyberpanel || {};
    const previewPath = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const previewExists = fs.existsSync(previewPath);
    const targetDir = this.getTargetDirectory(projectId, onboardingData);
    const targetIndexPath = targetDir ? join(targetDir, 'index.html') : null;
    const targetExists = targetIndexPath ? fs.existsSync(targetIndexPath) : false;

    return {
      projectId: project.id,
      projectName: project.name,
      type: project.type,
      status: project.status,
      publicDomain: onboardingData.publicDomain ?? null,
      publicUrl: onboardingData.publicUrl ?? null,
      aiGeneration: {
        status: aiGeneration.status ?? null,
        error: aiGeneration.error ?? null,
        mode: aiGeneration.mode ?? null,
        model: aiGeneration.model ?? null,
        startedAt: aiGeneration.startedAt ?? null,
        updatedAt: aiGeneration.updatedAt ?? null,
        finishedAt: aiGeneration.finishedAt ?? null,
        previewUrl: aiGeneration.previewUrl ?? (previewExists ? this.buildPreviewUrl(projectId) : null),
      },
      cyberpanel: {
        status: cyberpanel.status ?? null,
        error: cyberpanel.error ?? null,
        owner: cyberpanel.owner ?? null,
        requestedDomain: cyberpanel.requestedDomain ?? null,
      },
      filesystem: {
        previewPath,
        previewExists,
        targetDir,
        targetIndexPath,
        targetExists,
      },
      outputVerified: this.hasGeneratedOutput(projectId, onboardingData),
    };
  }

  async runManualGeneration(projectId: number, userId?: number, isAdmin = false, reprovision = false) {
    let project = await this.getProjectOrThrow(projectId, userId, isAdmin);

    if (reprovision || !(project.onboardingData as any)?.publicDomain) {
      const provision = await this.cyberpanelService.ensureSite(projectId);
      project = await this.getProjectOrThrow(projectId, userId, isAdmin);
      if (!provision.domain && !(project.onboardingData as any)?.publicDomain) {
        const data = (project.onboardingData as any) || {};
        const cyberpanelError =
          data?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación no puede publicarse.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: {
              ...data,
              aiGeneration: {
                ...(data.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });
        throw new BadRequestException(cyberpanelError);
      }
    }

    await this.aiService.generateForProject(projectId);
    return this.getGenerationDiagnostics(projectId, userId, isAdmin);
  }

  // ✅ ONBOARDING POR PASOS (CORRECTO)
  async saveOnboarding(projectId: number, dto: SaveOnboardingDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: true,
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const normalizedSubdomain = this.normalizeSubdomain(
      dto?.data?.subdomain ?? (project.onboardingData as any)?.subdomain,
    );

    const mergedData = {
      ...(project.onboardingData as any || {}),
      ...dto.data,
      ...(normalizedSubdomain ? { subdomain: normalizedSubdomain } : {}),
    };

    const shouldStart = dto.completed === true;
    const startedAt = project.startedAt ?? (shouldStart ? new Date() : null);
    let deadline = project.deadline ?? null;

    if (shouldStart && project.order?.planId) {
      const planId = project.order.planId;
      if (planId === 1) {
        deadline = addHours(new Date(), LANDING_DEVELOPMENT_HOURS);
      } else {
        deadline = addDays(new Date(), WEB_DEVELOPMENT_DAYS);
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
        onboardingStep: dto.step,
        status: dto.completed
          ? ProjectStatus.IN_PROGRESS
          : ProjectStatus.IN_PROGRESS,
        startedAt,
        deadline,
        completedAt: null,
      } as Prisma.ProjectUpdateInput,
    });

    if (shouldStart) {
      this.logger.log(
        `Onboarding project=${projectId} rawSubdomain=${JSON.stringify(
          dto?.data?.subdomain ?? null,
        )} normalizedSubdomain=${JSON.stringify(normalizedSubdomain || null)} storedSubdomain=${JSON.stringify(
          (mergedData as any).subdomain ?? null,
        )}`,
      );
      const cyberpanelProvision = await this.cyberpanelService.ensureSite(projectId);
      const refreshedProject = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { onboardingData: true },
      });
      const refreshedData = (refreshedProject?.onboardingData as any) || mergedData;
      const resolvedDomain = cyberpanelProvision.domain || refreshedData.publicDomain || null;
      if (!resolvedDomain) {
        const cyberpanelError =
          refreshedData?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación IA se detuvo.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: {
              ...refreshedData,
              aiGeneration: {
                ...(refreshedData.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });
        throw new BadRequestException(cyberpanelError);
      }
      if (
        cyberpanelProvision.createdWebsite &&
        cyberpanelProvision.accountCreated &&
        cyberpanelProvision.account &&
        cyberpanelProvision.plainPassword &&
        project.user?.email
      ) {
        const loginUrl = `${process.env.APP_URL ?? 'http://localhost:3001'}/login`;
        await this.mailService.sendProjectReady(project.user.email, {
          projectName: project.name,
          loginUrl,
          hostingAccess: {
            panelUrl: cyberpanelProvision.account.panelUrl,
            username: cyberpanelProvision.account.username,
            password: cyberpanelProvision.plainPassword,
          },
        });
      }
      void this.aiService.generateForProject(projectId).catch((err) => {
        this.logger.error(`Error en la generación automática de IA para el proyecto ${projectId}: ${err.message}`, err.stack);
      });
    }

    return updated;
  }

  // ✅ CREAR PROYECTO DESDE ORDEN (CORRECTO)
  async createFromOrder(orderOrId: any) {
    const order = typeof orderOrId === 'number'
      ? await this.prisma.order.findUnique({ where: { id: orderOrId } })
      : orderOrId;

    if (!order) {
      throw new NotFoundException('Order no encontrada');
    }
    if (!order.userId) {
      throw new BadRequestException('Order sin usuario');
    }

    return this.prisma.project.create({
      data: {
        name: `Proyecto ${order.id}`,
        type: order.planId === 1 ? 'LANDING' : 'WEB',
        status: ProjectStatus.WAITING_INFO,

        user: {
          connect: { id: order.userId },
        },

        order: {
          connect: { id: order.id },
        },
      },
    });
  }


  async listByUser(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        order: { include: { plan: true } },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.project.findFirst({
      where: { userId },
      include: {
        order: {
          include: {
            plan: true,
          },
        },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProjectByUser(projectId: number, userId: number) {
    return this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        order: {
          include: {
            plan: true,
          },
        },
        subscription: true,
      },
    });
  }

  async listForAdmin() {
    return this.prisma.project.findMany({
      include: {
        user: true,
        order: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForAdmin(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        order: {
          include: { plan: true },
        },
      },
    });
  }

  async publishProject(id: number, data: { publicUrl?: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    if (project.status === ProjectStatus.DELIVERED) {
      return project;
    }

    const currentData = (project.onboardingData as any) || {};
    if (!this.hasGeneratedOutput(project.id, currentData)) {
      throw new BadRequestException(
        'El sitio aun no fue generado y verificado correctamente. No se puede publicar.',
      );
    }

    const publishedAt = new Date();
    const revisionsAllowed = project.order?.planId === 1 ? 1 : 2;
    const revisionWindowEndsAt = addHours(publishedAt, 48);

    const mergedData = {
      ...currentData,
      ...(data.publicUrl
        ? { publicUrl: data.publicUrl }
        : currentData.publicDomain
          ? { publicUrl: `https://${currentData.publicDomain}` }
          : {}),
      publishedAt: publishedAt.toISOString(),
      revisionsAllowed,
      revisionWindowEndsAt: revisionWindowEndsAt.toISOString(),
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: mergedData,
        status: ProjectStatus.DELIVERED,
        completed: true,
        completedAt: publishedAt,
      },
    });
  }

  async configureDb(id: number, data: { dbName?: string; dbUser?: string; dbPassword?: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const mergedData = {
      ...(project.onboardingData as any || {}),
      dbConfigured: true,
      dbName: data.dbName ?? null,
      dbUser: data.dbUser ?? null,
      dbPassword: data.dbPassword ?? null,
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: mergedData,
      },
    });
  }

  async saveLogo(projectId: number, userId: number, logoUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const mergedData = {
      ...(project.onboardingData as any || {}),
      logoUrl,
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
      },
    });
  }

  async saveMedia(projectId: number, userId: number, urls: string[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const data = (project.onboardingData as any) || {};
    const existing = Array.isArray(data.images) ? data.images : [];
    const total = existing.length + urls.length;
    if (total > 5) {
      throw new BadRequestException('Solo puedes subir hasta 5 imagenes en total.');
    }
    const combined = [...existing, ...urls];
    const mergedData = {
      ...data,
      images: combined,
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
      },
    });
  }

  async saveDocument(projectId: number, userId: number, fieldKey: string, documentUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const mergedData = {
      ...(project.onboardingData as any || {}),
      [fieldKey]: documentUrl,
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
      },
    });
  }

  async requestRevision(projectId: number, userId: number, message: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { order: true },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    const data = (project.onboardingData as any) || {};
    const publishedAtRaw = data.publishedAt;
    if (!publishedAtRaw) {
      throw new BadRequestException('El proyecto aun no esta publicado.');
    }

    const publishedAt = new Date(publishedAtRaw);
    const windowEndsAt = addHours(publishedAt, 48);
    if (new Date() > windowEndsAt) {
      throw new BadRequestException('El periodo de cambios ya vencio.');
    }

    const allowed = project.order?.planId === 1 ? 1 : 2;
    const existing = Array.isArray(data.revisionRequests) ? data.revisionRequests : [];
    if (existing.length >= allowed) {
      throw new BadRequestException('Ya alcanzaste el limite de revisiones.');
    }

    const next = [
      ...existing,
      {
        message,
        createdAt: new Date().toISOString(),
      },
    ];

    const mergedData = {
      ...data,
      revisionRequests: next,
      revisionWindowEndsAt: windowEndsAt.toISOString(),
      revisionsAllowed: allowed,
    };

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
      },
    });

    void this.aiService.generateForProject(projectId, message);

    return updated;
  }

  async autoPublishReadyProjects() {
    const ready = await this.prisma.project.findMany({
      where: {
        status: ProjectStatus.READY,
        deadline: { lte: new Date() },
      },
      include: {
        user: true,
      },
    });

    for (const project of ready) {
      const data = (project.onboardingData as any) || {};
      if (!this.hasGeneratedOutput(project.id, data)) {
        this.logger.warn(
          `Auto publish omitido para project=${project.id}: no existe salida verificada para publicar.`,
        );
        continue;
      }
      const publicUrl = data.publicUrl;
      await this.publishProject(project.id, { publicUrl });
      if (project.user?.email) {
        const loginUrl = `${process.env.APP_URL ?? 'http://localhost:3001'}/login`;
        await this.mailService.sendProjectReady(project.user.email, {
          projectName: project.name,
          loginUrl,
        });
      }
    }
  }
}
