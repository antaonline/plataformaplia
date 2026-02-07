import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { ProjectStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { addDays, addHours } from 'date-fns';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ✅ ONBOARDING POR PASOS (CORRECTO)
  async saveOnboarding(projectId: number, dto: SaveOnboardingDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const mergedData = {
      ...(project.onboardingData as any || {}),
      ...dto.data,
    };

    const shouldStart = dto.completed === true;
    const startedAt = project.startedAt ?? (shouldStart ? new Date() : null);
    let deadline = project.deadline ?? null;

    if (shouldStart && project.order?.planId) {
      const planId = project.order.planId;
      if (planId === 1) {
        deadline = addHours(new Date(), 48);
      } else {
        deadline = addDays(new Date(), 7);
      }
    }

    return this.prisma.project.update({
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

  async findByUser(userId: number) {
    return this.prisma.project.findFirst({
      where: { userId },
      include: {
        order: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    });
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }

    const mergedData = {
      ...(project.onboardingData as any || {}),
      ...(data.publicUrl ? { publicUrl: data.publicUrl } : {}),
      publishedAt: new Date().toISOString(),
    };

    return this.prisma.project.update({
      where: { id },
      data: {
        onboardingData: mergedData,
        status: ProjectStatus.DELIVERED,
        completed: true,
        completedAt: new Date(),
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

}
