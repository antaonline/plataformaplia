
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createAnnual(projectId: number, type: 'LANDING' | 'WEB', cardToken: string) {
    const amount = type === 'LANDING' ? 13500 : 16500;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: true,
      },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    return this.prisma.hostingSubscription.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        planId: project.order.planId,

        startDate: new Date(),
        endDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),

        nextBillingAt: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),

        status: 'ACTIVE',
      },
    });


  }
}
