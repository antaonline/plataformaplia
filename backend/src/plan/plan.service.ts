import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async createDefaultPlans() {
    return this.prisma.plan.createMany({
      data: [
        {
          name: 'Landing Page',
          description: 'Landing page profesional + hosting gratis 1 año',
          price: 390,
          hostingYear: true,
        },
        {
          name: 'Web Institucional',
          description: 'Web institucional completa + hosting gratis 1 año',
          price: 690,
          hostingYear: true,
        },
      ],
      skipDuplicates: true,
    })
  }

  async getPlans() {
    return this.prisma.plan.findMany()
  }
}

