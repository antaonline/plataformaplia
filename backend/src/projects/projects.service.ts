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

    // AHORA: Verificamos que exista la salida en la carpeta de previsualizacion
    // ya que la escritura en public_html se pospone hasta la publicacion oficial.
    const previewIndex = join(process.cwd(), 'uploads', 'previews', String(projectId), 'index.html');
    const hasPreview = fs.existsSync(previewIndex);
    
    return hasPreview;
  }

  private copyFolderRecursive(source: string, target: string) {
    if (!fs.existsSync(source)) {
      this.logger.error(`Source directory does not exist: ${source}`);
      return;
    }
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
      const curSource = join(source, file);
      const curTarget = join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        this.copyFolderRecursive(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
        // this.logger.log(`Copied ${file} to ${target}`);
      }
    }
  }

  private buildPreviewUrl(projectId: number) {
    // Los /uploads los sirve el backend, no el frontend (APP_URL).
    const appUrl = (process.env.PREVIEW_PROXY_BASE || 'http://localhost:3002').replace(/\/$/, '');
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
    const onboardingData = JSON.parse((project.onboardingData as string) || '{}');
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

    if (reprovision || !JSON.parse((project.onboardingData as string) || '{}')?.publicDomain) {
      const provision = await this.cyberpanelService.ensureSite(projectId);
      project = await this.getProjectOrThrow(projectId, userId, isAdmin);
      const projectData = JSON.parse((project.onboardingData as string) || '{}');
      if (!provision.domain && !projectData?.publicDomain) {
        const cyberpanelError =
          projectData?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación no puede publicarse.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...projectData,
              aiGeneration: {
                ...(projectData.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            }),
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
        order: { include: { plan: true } },
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const existingData = JSON.parse((project.onboardingData as string) || '{}');

    const normalizedSubdomain = this.normalizeSubdomain(
      dto?.data?.subdomain ?? existingData?.subdomain,
    );

    const mergedData = {
      ...existingData,
      ...dto.data,
      ...(normalizedSubdomain ? { subdomain: normalizedSubdomain } : {}),
    };

    const shouldStart = dto.completed === true;
    const startedAt = project.startedAt ?? (shouldStart ? new Date() : null);
    let deadline = project.deadline ?? null;

    if (shouldStart) {
      const isLanding =
        project.type === 'LANDING' ||
        project.order?.plan?.slug?.toLowerCase().includes('landing') ||
        project.order?.plan?.name?.toLowerCase().includes('landing');

      if (isLanding) {
        deadline = addHours(new Date(), LANDING_DEVELOPMENT_HOURS);
      } else {
        deadline = addDays(new Date(), WEB_DEVELOPMENT_DAYS);
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
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
      let cyberpanelProvision: any;
      try {
        cyberpanelProvision = await this.cyberpanelService.ensureSite(projectId);
      } catch (cpErr: any) {
        // Si ensureSite lanza (no debe tras los try/catch internos, pero por
        // si acaso), persistimos el error visible para no dejar el proyecto
        // mudo en "En progreso".
        const errMsg = cpErr?.message || 'Error desconocido en CyberPanel.';
        this.logger.error(
          `saveOnboarding project=${projectId}: ensureSite lanzo: ${errMsg}`,
          cpErr?.stack,
        );
        const currentRaw = (await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { onboardingData: true },
        }))?.onboardingData;
        const current = JSON.parse((currentRaw as string) || JSON.stringify(mergedData));
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...current,
              cyberpanel: {
                ...(current?.cyberpanel || {}),
                status: 'FAILED',
                stage: 'saveOnboarding.ensureSite',
                error: errMsg,
                updatedAt: new Date().toISOString(),
              },
              aiGeneration: {
                ...(current?.aiGeneration || {}),
                status: 'FAILED',
                error: `No se pudo crear el subdominio en CyberPanel: ${errMsg}`,
                updatedAt: new Date().toISOString(),
              },
            }),
          },
        });
        throw new BadRequestException(
          `No se pudo crear el subdominio en CyberPanel: ${errMsg}`,
        );
      }
      const refreshedProject = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { onboardingData: true },
      });
      const refreshedData = JSON.parse((refreshedProject?.onboardingData as string) || JSON.stringify(mergedData));
      const resolvedDomain = cyberpanelProvision.domain || refreshedData.publicDomain || null;
      if (!resolvedDomain) {
        const cyberpanelError =
          refreshedData?.cyberpanel?.error ||
          'No se pudo crear el subdominio en CyberPanel. La generación IA se detuvo.';
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            onboardingData: JSON.stringify({
              ...refreshedData,
              aiGeneration: {
                ...(refreshedData.aiGeneration || {}),
                status: 'FAILED',
                error: cyberpanelError,
                updatedAt: new Date().toISOString(),
              },
            }),
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
    const order =
      typeof orderOrId === 'number'
        ? await this.prisma.order.findUnique({ where: { id: orderOrId }, include: { plan: true } })
        : orderOrId;

    if (!order) {
      throw new NotFoundException('Order no encontrada');
    }
    if (!order.userId) {
      throw new BadRequestException('Order sin usuario');
    }

    // Si el order llego como objeto sin la relacion plan (p.ej. desde
    // payments.service), la cargamos por planId para poder detectar
    // correctamente si el plan es LANDING. Sin esto el proyecto quedaba
    // como WEB por defecto y la generacion de IA fallaba.
    let plan = order.plan;
    if (!plan && order.planId) {
      plan = await this.prisma.plan.findUnique({
        where: { id: order.planId },
      });
    }

    // Determinar tipo por slug o nombre if available
    const planSlug = plan?.slug?.toLowerCase() || '';
    const planName = plan?.name?.toLowerCase() || '';
    const isLanding =
      planSlug.includes('landing') || planName.includes('landing') || order.planId === 1;

    return this.prisma.project.create({
      data: {
        name: `Proyecto ${order.id}`,
        type: isLanding ? 'LANDING' : 'WEB',
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

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    if (!this.hasGeneratedOutput(project.id, currentData)) {
      throw new BadRequestException(
        'El sitio aun no fue generado y verificado correctamente. No se puede publicar.',
      );
    }

    const publishedAt = new Date();
    const revisionsAllowed = project.type === 'LANDING' ? 1 : 2;
    const revisionWindowEndsAt = addHours(publishedAt, 48);

    // LOGICA DE PUBLICACION FISICA: Copiar de previews a public_html
    const aiGeneration = currentData.aiGeneration || {};
    const previewRoot = join(process.cwd(), 'uploads', 'previews', String(id));
    const targetDir = aiGeneration.target;

    if (targetDir && fs.existsSync(previewRoot)) {
      try {
        this.logger.log(`Publicando archivos fisicos para proyecto ${id} en ${targetDir}...`);
        this.copyFolderRecursive(previewRoot, targetDir);
        this.logger.log(`Publicacion fisica exitosa para proyecto ${id}.`);
      } catch (err: any) {
        this.logger.error(`Error al copiar archivos a public_html para proyecto ${id}: ${err.message}`);
        // No lanzamos error para permitir que el estado se actualice, 
        // o podriamos lanzarlo si queremos que reintente en el proximo cron.
        // Por ahora lanzamos para que el cron lo capture y lo registre.
        throw new Error(`Fallo la copia fisica de archivos: ${err.message}`);
      }
    } else {
      this.logger.warn(`Proyecto ${id} no tiene targetDir (${targetDir}) o previewRoot (${previewRoot}) no existe. Se omite copia fisica.`);
    }

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
        onboardingData: JSON.stringify(mergedData),
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

    const existingData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = {
      ...existingData,
      dbConfigured: true,
      dbName: data.dbName ?? null,
      dbUser: data.dbUser ?? null,
      dbPassword: data.dbPassword ?? null,
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: JSON.stringify(mergedData),
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

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = { ...currentData, logoUrl };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
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

    if (urls.length > 5) {
      throw new BadRequestException('Solo puedes subir hasta 5 imagenes en total.');
    }
    const data = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = { ...data, images: urls };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
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

    const currentData = JSON.parse((project.onboardingData as string) || '{}');
    const mergedData = {
      ...currentData,
      [fieldKey]: documentUrl,
    };

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: JSON.stringify(mergedData),
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

    const data = JSON.parse((project.onboardingData as string) || '{}');
    const publishedAtRaw = data.publishedAt;
    if (!publishedAtRaw) {
      throw new BadRequestException('El proyecto aun no esta publicado.');
    }

    const publishedAt = new Date(publishedAtRaw);
    const windowEndsAt = addHours(publishedAt, 48);
    if (new Date() > windowEndsAt) {
      throw new BadRequestException('El periodo de cambios ya vencio.');
    }

    const allowed = project.type === 'LANDING' ? 1 : 2;
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
        onboardingData: JSON.stringify(mergedData),
      },
    });

    void this.aiService.generateForProject(projectId, message);

    return updated;
  }

  async autoPublishReadyProjects() {
    const readyProjects = await this.prisma.project.findMany({
      where: {
        status: ProjectStatus.IN_PROGRESS,
        deadline: { lte: new Date() },
      },
      include: {
        user: true,
      },
    });

    for (const project of readyProjects) {
      try {
        const data = JSON.parse((project.onboardingData as string) || '{}');

        this.logger.log(`Procesando auto-publicacion para proyecto ${project.id} (${project.name})...`);

        // AUTO-REPARACION: si la IA no quedo lista (fallo, nunca corrio por
        // un reinicio, o no dejo preview), en vez de saltar para siempre
        // RE-DISPARAMOS la generacion. Con tope de intentos para no loopear.
        const aiReady =
          data.aiGeneration?.status === 'READY' &&
          this.hasGeneratedOutput(project.id, data);

        if (!aiReady) {
          const MAX_RETRIES = 3;
          const retries = Number(data.aiGeneration?.autoRetries || 0);

          if (retries >= MAX_RETRIES) {
            this.logger.error(
              `Proyecto ${project.id}: IA no se completo tras ${retries} reintentos. Marcado FAILED.`,
            );
            await this.prisma.project.update({
              where: { id: project.id },
              data: {
                onboardingData: JSON.stringify({
                  ...data,
                  aiGeneration: {
                    ...(data.aiGeneration || {}),
                    status: 'FAILED',
                    error:
                      'La generacion automatica no pudo completarse tras varios intentos. Reintenta o contacta soporte.',
                    updatedAt: new Date().toISOString(),
                  },
                }),
              },
            });
            continue;
          }

          this.logger.warn(
            `Proyecto ${project.id}: IA status=${data.aiGeneration?.status}, sin salida lista. Reintento ${retries + 1}/${MAX_RETRIES}.`,
          );
          await this.prisma.project.update({
            where: { id: project.id },
            data: {
              onboardingData: JSON.stringify({
                ...data,
                aiGeneration: {
                  ...(data.aiGeneration || {}),
                  status: 'GENERATING',
                  autoRetries: retries + 1,
                  updatedAt: new Date().toISOString(),
                },
              }),
            },
          });
          try {
            // Awaited (no fire-and-forget): si el backend se reinicia, el
            // proximo cron reintenta; si termina, publicamos abajo.
            await this.aiService.generateForProject(project.id);
          } catch (genErr: any) {
            this.logger.error(
              `Reintento de generacion fallo para proyecto ${project.id}: ${genErr?.message || genErr}`,
            );
            continue;
          }
          const fresh = await this.prisma.project.findUnique({
            where: { id: project.id },
          });
          const freshData = JSON.parse((fresh?.onboardingData as string) || JSON.stringify(data));
          if (
            freshData.aiGeneration?.status !== 'READY' ||
            !this.hasGeneratedOutput(project.id, freshData)
          ) {
            this.logger.warn(
              `Proyecto ${project.id}: tras reintento sigue sin estar listo; se reintentara el proximo ciclo.`,
            );
            continue;
          }
          // Quedo listo en este reintento: continuamos a publicar con datos frescos.
          Object.assign(data, freshData);
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
        this.logger.log(`Proyecto ${project.id} publicado exitosamente por el cron.`);
      } catch (error: any) {
        this.logger.error(`Error procesando auto-publicacion para proyecto ${project.id}: ${error.message}`);
        // Continuamos con el siguiente proyecto
      }
    }
  }

  /**
   * Elimina un proyecto por completo: el sitio en CyberPanel, los archivos de
   * preview en disco y el registro en la base de datos. El Order asociado se
   * conserva como historial de compra.
   */
  async deleteProject(projectId: number, userId: number, isAdmin = false) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    if (!isAdmin && project.userId !== userId) {
      throw new BadRequestException('No tienes acceso a este proyecto.');
    }

    // 1. Eliminar el sitio en CyberPanel (libera el slot del paquete). No
    // bloqueamos el borrado de DB si CyberPanel falla; solo lo registramos.
    try {
      await this.cyberpanelService.deleteSiteByProject(projectId);
    } catch (err: any) {
      this.logger.error(
        `deleteProject project=${projectId}: fallo al eliminar sitio en CyberPanel: ${err?.message || err}`,
      );
    }

    // 2. Limpiar archivos de preview generados en disco.
    try {
      const previewDir = join(
        process.cwd(),
        'uploads',
        'previews',
        String(projectId),
      );
      if (fs.existsSync(previewDir)) {
        fs.rmSync(previewDir, { recursive: true, force: true });
      }
    } catch (err: any) {
      this.logger.warn(
        `deleteProject project=${projectId}: no se pudo limpiar previews: ${err?.message || err}`,
      );
    }

    // 3. Eliminar el proyecto de la base de datos.
    await this.prisma.project.delete({ where: { id: projectId } });

    this.logger.log(
      `deleteProject project=${projectId} eliminado correctamente.`,
    );
    return { success: true, id: projectId };
  }
}
