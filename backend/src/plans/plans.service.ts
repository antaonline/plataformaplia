import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

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

