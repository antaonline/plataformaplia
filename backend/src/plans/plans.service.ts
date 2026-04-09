import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import { PlanServiceType } from '@prisma/client'

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async ensureWebsitePlans() {
    await this.prisma.plan.upsert({
      where: { slug: 'landing' },
      update: {
        name: 'LANDING',
        description: 'Landing page + hosting anual',
        price: 390,
        hostingYear: true,
        slug: 'landing',
        serviceType: PlanServiceType.WEBSITE_BUILD,
      },
      create: {
        name: 'LANDING',
        description: 'Landing page + hosting anual',
        price: 390,
        hostingYear: true,
        slug: 'landing',
        serviceType: PlanServiceType.WEBSITE_BUILD,
      },
    })

    await this.prisma.plan.upsert({
      where: { slug: 'web' },
      update: {
        name: 'WEB INSTITUCIONAL',
        description: 'Web completa + hosting anual',
        price: 690,
        hostingYear: true,
        slug: 'web',
        serviceType: PlanServiceType.WEBSITE_BUILD,
      },
      create: {
        name: 'WEB INSTITUCIONAL',
        description: 'Web completa + hosting anual',
        price: 690,
        hostingYear: true,
        slug: 'web',
        serviceType: PlanServiceType.WEBSITE_BUILD,
      },
    })
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.plan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.plan.count(),
    ])

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    }
  }

  async findPublicWebsitePlans() {
    await this.ensureWebsitePlans()

    return this.prisma.plan.findMany({
      where: {
        serviceType: PlanServiceType.WEBSITE_BUILD,
      },
      orderBy: { id: 'asc' },
    })
  }

  create(dto: CreatePlanDto) {
    return this.prisma.plan.create({ data: dto })
  }

  update(id: number, dto: UpdatePlanDto) {
    return this.prisma.plan.update({
      where: { id },
      data: dto,
    })
  }

  remove(id: number) {
    return this.prisma.plan.delete({
      where: { id },
    })
  }
}

