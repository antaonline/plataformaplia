import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { ProjectStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

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

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        onboardingData: mergedData,
        onboardingStep: dto.step,
        status: dto.completed
          ? ProjectStatus.READY
          : ProjectStatus.IN_PROGRESS,
        startedAt: project.startedAt ?? new Date(),
        completedAt: dto.completed ? new Date() : null,
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

}
