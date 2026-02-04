import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { IzipayService } from './izipay.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { addHours } from 'date-fns';
import { OrderStatus } from '@prisma/client';


@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private izipay: IzipayService,
    private projectsService: ProjectsService,
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  // ✅ SOLO crea la sesión de pago
  async createPayment(dto: CreatePaymentDto) {
    const orderId = Number(dto.orderId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order no está pendiente');
    }

    const session = await this.izipay.createSession({
      amount: Number(order.amount),
      orderNumber: order.id.toString(),
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: Number(order.amount),
        status: 'PENDING',
        provider: 'IZIPAY',
        transactionId: session.transactionId ?? null,
        rawResponse: JSON.stringify(session),
        providerResponse: JSON.stringify(session),
      },
    });

    return session;
  }

  async approveOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order no encontrada');
    }

    if (order.status === OrderStatus.APPROVED) {
      return { message: 'Order ya aprobada', orderId: order.id };
    }

    if (order.status === OrderStatus.DECLINED || order.status === OrderStatus.FAILED) {
      throw new BadRequestException('Order rechazada');
    }

    let user = order.user;
    let createdUser = false;

    if (!user) {
      if (!order.email) {
        throw new BadRequestException('Order sin email');
      }

      const existing = await this.usersService.findByEmail(order.email);
      if (existing) {
        user = existing;
      } else {
        const tempPassword = randomUUID();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        user = await this.prisma.user.create({
          data: {
            email: order.email,
            name: order.email.split('@')[0],
            password: hashedPassword,
            role: 'USER',
          },
        });
        createdUser = true;
      }

      await this.prisma.order.update({
        where: { id: order.id },
        data: { userId: user.id },
      });
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.APPROVED,
        transactionId: order.transactionId ?? `APPROVED-${Date.now()}`,
      },
    });

    let project = await this.prisma.project.findUnique({
      where: { orderId: order.id },
    });

    if (!project) {
      project = await this.projectsService.createFromOrder({
        id: order.id,
        userId: user.id,
        planId: order.planId,
      });
    }

    const existingSubscription = await this.prisma.hostingSubscription.findFirst({
      where: { projectId: project.id },
    });

    if (!existingSubscription) {
      await this.subscriptionsService.createAnnual(
        project.id,
        order.planId === 1 ? 'LANDING' : 'WEB',
        '',
      );
    }

    if (createdUser) {
      const token = randomUUID();
      await this.prisma.passwordSetupToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: addHours(new Date(), 24),
        },
      });

      await this.mailService.sendAccountSetup(order.email!, token);
    }

    return {
      message: 'Pago aprobado y proyecto creado',
      project,
    };
  }

  async mockPay(orderId?: number) {
    if (!orderId) {
      const approved = Math.random() > 0.2;
      return approved
        ? { status: 'APPROVED', transactionId: 'MOCK-' + Date.now() }
        : { status: 'DECLINED' };
    }

    const approved = Math.random() > 0.2;
    if (!approved) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DECLINED },
      });
      return { status: 'DECLINED' };
    }

    return this.approveOrder(orderId);
  }



  // ✅ wrapper (no se rompe)
  async createPaymentSession(dto: CreatePaymentDto) {
    return this.createPayment(dto);
  }

  // ✅ webhook / confirmación
  async confirmPayment(payload: any) {
    if (payload.status !== 'AUTHORIZED') {
      await this.prisma.order.update({
        where: { id: Number(payload.orderId) },
        data: { status: OrderStatus.DECLINED },
      });
      throw new BadRequestException('Pago rechazado');
    }

    await this.approveOrder(Number(payload.orderId));

    return { ok: true };
  }

  async handleWebhook(body: any) {
    console.log('Webhook Izipay recibido:', body);
    return { ok: true };
  }
}
