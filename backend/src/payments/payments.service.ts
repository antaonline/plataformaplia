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
import { OrderStatus, PlanServiceType } from '@prisma/client';
import { HostingService } from '../hosting/hosting.service';


@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private izipay: IzipayService,
    private projectsService: ProjectsService,
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
    private mailService: MailService,
    private hostingService: HostingService,
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

  async approveOrder(orderId: number, cardToken?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, plan: true },
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
    let passwordSetupToken: string | null = null;

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
    let project: any = null;
    let hostingAccount: any = null;

    if (order.plan?.serviceType === PlanServiceType.HOSTING_ONLY) {
      hostingAccount = await this.hostingService.provisionApprovedOrder(order.id, user.id, cardToken);
    } else {
      project = await this.prisma.project.findUnique({
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
          cardToken,
        );
      } else {
        const nextPlanId = order.planId === 1 ? existingSubscription.planId : 2;
        const update: any = {
          ...(cardToken ? { cardToken } : {}),
        };
        if (nextPlanId && nextPlanId !== existingSubscription.planId) {
          update.planId = nextPlanId;
        }
        if (Object.keys(update).length) {
          await this.prisma.hostingSubscription.update({
            where: { id: existingSubscription.id },
            data: update,
          });
        }
      }
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
      passwordSetupToken = token;
    }

    return {
      message:
        order.plan?.serviceType === PlanServiceType.HOSTING_ONLY
          ? 'Pago aprobado y hosting activado'
          : 'Pago aprobado y proyecto creado',
      project,
      hostingAccount,
      passwordSetupToken,
      redirectTo:
        order.plan?.serviceType === PlanServiceType.HOSTING_ONLY
          ? '/dashboard/hosting'
          : '/dashboard',
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

  async createIzipaySession(orderId: number, payload: any = {}) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order no esta pendiente');
    }

    const transactionId = order.transactionId ?? `TRX-${Date.now()}`;
    if (!order.transactionId) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { transactionId },
      });
    }

    const orderNumber = order.id.toString().padStart(5, '0');
    const session = await this.izipay.createSession({
      amount: Number(order.amount),
      orderNumber,
      transactionId,
    });

    if (session?.status && session.status !== 'SUCCESS') {
      const message =
        session?.answer?.detailedErrorMessage ??
        session?.answer?.errorMessage ??
        'Error al crear sesion en Micuentaweb';
      throw new BadRequestException(message);
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: order.id },
    });
    if (!existingPayment) {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: Number(order.amount),
          status: 'PENDING',
          provider: 'IZIPAY',
          transactionId: session.transactionId ?? transactionId,
          rawResponse: JSON.stringify(session),
          providerResponse: JSON.stringify(session),
        },
      });
    }

    return {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      email: payload?.email ?? order.email,
      session: {
        ...session,
        orderNumber: session?.orderNumber ?? orderNumber,
        formToken: session?.answer?.formToken ?? session?.formToken,
        publicKey: session?.publicKey ?? process.env.IZIPAY_PUBLIC_KEY,
      },
    };
  }

  async confirmIzipayPayment(payload: any) {
    const rawAnswer =
      payload?.['kr-answer'] ??
      payload?.answer ??
      payload?.response ??
      payload;
    const response =
      typeof rawAnswer === 'string'
        ? (() => {
            try {
              return JSON.parse(rawAnswer);
            } catch {
              return rawAnswer;
            }
          })()
        : rawAnswer;
    const signature =
      payload?.signature ?? payload?.hash ?? payload?.['kr-hash'] ?? '';
    if (signature && !this.izipay.validateResponse(rawAnswer, signature)) {
      throw new BadRequestException('Firma invalida');
    }

    const orderNumber =
      response?.orderDetails?.orderId ??
      response?.orderId ??
      response?.order?.[0]?.orderNumber ??
      response?.orderNumber ??
      response?.order?.orderNumber;

    if (!orderNumber) {
      throw new BadRequestException('Order no identificada');
    }

    const orderId = Number(orderNumber);
    const state =
      response?.orderStatus ??
      response?.order?.[0]?.status ??
      response?.status ??
      response?.responseCode;
    const successCodes = ['00', 'AUTHORIZED', 'APPROVED', 'PAID', 'SUCCESS'];
    if (state && !successCodes.includes(state)) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DECLINED },
      });
      throw new BadRequestException('Pago rechazado');
    }

    const cardToken = response?.token?.cardToken ?? response?.cardToken ?? null;

    await this.prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: 'PAID',
        providerResponse: JSON.stringify(response),
        rawResponse: JSON.stringify(response),
        paidAt: new Date(),
      },
    });

    const approval = await this.approveOrder(orderId, cardToken ?? undefined);

    return {
      ok: true,
      passwordSetupToken: approval?.passwordSetupToken ?? null,
      redirectTo: approval?.redirectTo ?? '/dashboard',
    };
  }
}
