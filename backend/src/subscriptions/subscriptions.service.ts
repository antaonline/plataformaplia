
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IzipayService } from '../payments/izipay.service';
import { addDays, addMonths, subDays } from 'date-fns';
import { PlanServiceType } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private izipay: IzipayService,
  ) {}

  async createAnnual(projectId: number, type: 'LANDING' | 'WEB', cardToken?: string) {
    const amount = type === 'LANDING' ? 135 : 165;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: true,
      },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    const startDate = new Date();
    const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    return this.prisma.hostingSubscription.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        planId: project.order.planId,
        serviceType: PlanServiceType.WEBSITE_BUILD,
        billingCycleMonths: 12,
        cycleAmount: amount,

        startDate,
        endDate,
        nextBillingAt: endDate,
        renewalDueAt: endDate,
        cardToken: cardToken ?? null,

        status: 'ACTIVE',
      },
    });
  }


  private async getUserAnnualAmount(userId: number): Promise<number> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: { order: true },
    });
    const hasWeb = projects.some((p) => p.order?.planId && p.order.planId !== 1);
    return hasWeb ? 165 : 135;
  }

  async createRenewalSession(userId: number, subscriptionId: number) {
    const subscription = await this.prisma.hostingSubscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripcion no encontrada');
    }
    if (subscription.userId !== userId) {
      throw new BadRequestException('No tienes acceso a esta suscripcion');
    }

    const now = new Date();
    const eligibleAt = subDays(subscription.endDate, 30);
    if (now < eligibleAt) {
      throw new BadRequestException('Aun no puedes renovar');
    }

    const amount = Number(
      subscription.cycleAmount ?? (await this.getUserAnnualAmount(subscription.userId)),
    );
    const renewal = await this.prisma.hostingRenewal.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        currency: 'PEN',
        provider: 'IZIPAY',
      },
    });

    const session = await this.izipay.createSession({
      amount,
      orderNumber: `R-${renewal.id}`,
      transactionId: `REN-${renewal.id}-${Date.now()}`,
    });

    await this.prisma.hostingRenewal.update({
      where: { id: renewal.id },
      data: {
        transactionId: session.transactionId ?? `REN-${renewal.id}`,
        rawResponse: session as any,
        providerResponse: session as any,
      },
    });

    return {
      subscriptionId: subscription.id,
      renewalId: renewal.id,
      amount,
      currency: 'PEN',
      email: subscription.user.email,
      session,
    };
  }

  async confirmRenewal(payload: any) {
    const response = payload?.response ?? payload;
    const signature = payload?.signature ?? payload?.hash ?? '';
    if (signature && !this.izipay.validateResponse(response, signature)) {
      throw new BadRequestException('Firma invalida');
    }

    const orderNumber =
      response?.order?.[0]?.orderNumber ??
      response?.orderNumber ??
      response?.order?.orderNumber ??
      response?.orderId;

    if (!orderNumber || !String(orderNumber).startsWith('R-')) {
      throw new BadRequestException('Orden de renovacion invalida');
    }

    const renewalId = Number(String(orderNumber).replace('R-', ''));
    const renewal = await this.prisma.hostingRenewal.findUnique({
      where: { id: renewalId },
      include: { subscription: true },
    });
    if (!renewal) {
      throw new NotFoundException('Renovacion no encontrada');
    }

    const state = response?.order?.[0]?.status ?? response?.status ?? response?.responseCode;
    const successCodes = ['00', 'AUTHORIZED', 'APPROVED'];
    if (state && !successCodes.includes(state)) {
      await this.prisma.hostingRenewal.update({
        where: { id: renewal.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('Pago rechazado');
    }

    const cardToken = response?.token?.cardToken ?? response?.cardToken ?? null;

    const currentEnd = renewal.subscription.endDate;
    const nextEnd = addMonths(currentEnd, renewal.subscription.billingCycleMonths || 12);

    await this.prisma.hostingRenewal.update({
      where: { id: renewal.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        cardToken: cardToken ?? null,
        rawResponse: response as any,
        providerResponse: response as any,
      },
    });

    await this.prisma.hostingSubscription.update({
      where: { id: renewal.subscriptionId },
      data: {
        endDate: nextEnd,
        nextBillingAt: nextEnd,
        renewalDueAt: nextEnd,
        status: 'ACTIVE',
        cardToken: cardToken ?? renewal.subscription.cardToken,
        renewalNoticeSentAt: null,
        renewalReminderSentAt: null,
        renewalFinalNoticeSentAt: null,
      },
    });

    return { ok: true };
  }

  async getUserRenewals(userId: number) {
    return this.prisma.hostingRenewal.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
