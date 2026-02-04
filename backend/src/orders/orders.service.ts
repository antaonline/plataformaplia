import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    return this.prisma.order.create({
      data: {
        userId: dto.userId ?? undefined,
        email: dto.email ?? null,
        planId: dto.planId,
        amount: plan.price,
        currency: "PEN",
        status: OrderStatus.PENDING
      }
    });
  }

  async markAsPaid(orderId: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.APPROVED },
    });
  }
}
