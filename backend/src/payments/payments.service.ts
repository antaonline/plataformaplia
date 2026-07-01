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
import { AffiliatesService } from '../affiliates/affiliates.service';


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
    private affiliates: AffiliatesService,
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

      // FREEMIUM: si el usuario tiene una web en prueba, ACTIVARLA en vez de
      // crear un proyecto nuevo (restaura, sube hosting, quita badge demo).
      if (!project) {
        const activated = await this.projectsService.activateTrialForUser(user.id, order.id);
        if (activated) {
          project = activated;
        }
      }

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

      const isLanding = order.plan?.slug?.toLowerCase().includes('landing') || order.planId === 1;

      if (!existingSubscription) {
        await this.subscriptionsService.createAnnual(
          project.id,
          isLanding ? 'LANDING' : 'WEB',
          cardToken,
        );
      } else {
        const nextPlanId = isLanding ? existingSubscription.planId : (order.planId || 2);
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

    // Correos transaccionales post-pago: recibo + bienvenida.
    // Se envian en background (no await) para no bloquear la respuesta al
    // cliente si el SMTP es lento. Los errores quedan en logs.
    const appBase = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    void this.mailService.sendPaymentReceipt({
      customerEmail: order.email!,
      billingName: user.billingName || undefined,
      billingAddress: user.billingAddress || undefined,
      billingDepartment: user.billingDepartment || undefined,
      billingEmail: user.billingEmail || undefined,
      planName: order.plan?.name || 'Plan PLIA',
      amount: Number(order.amount || 0),
      orderId: order.id,
      paidAt: new Date(),
      dashboardUrl: `${appBase}/dashboard`,
    });
    if (createdUser) {
      void this.mailService.sendWelcome({
        email: order.email!,
        customerName: user.name || undefined,
        planName: order.plan?.name || undefined,
        dashboardUrl: `${appBase}/dashboard`,
      });
    }

    // Comisión de afiliado: si la orden tenía atribución, se registra ahora.
    // Envuelto en try/catch para que un fallo aquí NUNCA rompa la aprobación.
    try {
      await this.affiliates.createCommissionForOrder(order.id);
    } catch (err) {
      console.error(
        `[affiliates] no se pudo crear comisión (order ${order.id}):`,
        (err as any)?.message,
      );
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
    // Loguear solo metadata segura — el body puede traer tokens / datos del cliente.
    const safeMeta = {
      orderId: body?.orderId || body?.order_id,
      status: body?.status,
      amount: body?.amount,
      currency: body?.currency,
      eventType: body?.eventType || body?.event,
    };
    console.log('Webhook Izipay recibido:', safeMeta);
    return { ok: true };
  }

  async createIzipaySession(orderId: number, payload: any = {}) {
    try {
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
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `No se pudo iniciar la sesion de pago: ${error?.message || 'error interno en pagos'}`,
      );
    }
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
    // SEGURIDAD: la firma HMAC de Izipay es OBLIGATORIA. Antes la validación
    // era `if (signature && ...)`, de modo que una petición SIN firma se
    // aprobaba sin verificar -> cualquiera podía forjar un "pago exitoso"
    // (POST /payments/izipay/confirm es público). Ahora se exige firma
    // presente Y válida. Se usan dos mensajes/logs distintos para diagnosticar
    // al instante si algo legítimo empezara a fallar tras desplegar (típicamente
    // IZIPAY_HASH_KEY mal configurada en el VPS).
    if (!signature) {
      console.error(
        '[izipay] confirmación RECHAZADA: falta kr-hash (firma ausente). ' +
          'Si esto ocurre en un pago real, revisa que el frontend envíe kr-hash.',
      );
      throw new BadRequestException('Firma ausente');
    }
    if (!this.izipay.validateResponse(rawAnswer, signature)) {
      console.error(
        '[izipay] confirmación RECHAZADA: kr-hash no coincide (firma inválida). ' +
          'Si esto ocurre en un pago real, revisa IZIPAY_HASH_KEY en el VPS.',
      );
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

    // Defensa en profundidad: el monto pagado debe coincidir con el de la
    // orden. La firma ya garantiza autenticidad; esto detecta además cualquier
    // descuadre de importe. Solo se rechaza si el monto viene en la respuesta y
    // NO coincide (fail-open si no se puede leer, para no romper pagos por
    // diferencias de formato del proveedor). Izipay V4 envía el total en
    // céntimos.
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order no encontrada');
    }
    const expectedCents = Math.round(Number(order.amount) * 100);
    const paidCents = Number(
      response?.orderDetails?.orderTotalAmount ??
        response?.transactions?.[0]?.amount ??
        response?.amount ??
        NaN,
    );
    if (Number.isFinite(paidCents) && paidCents !== expectedCents) {
      console.error(
        `[izipay] monto no coincide en order ${orderId}: esperado ${expectedCents}c, recibido ${paidCents}c`,
      );
      throw new BadRequestException('El monto pagado no coincide con la orden');
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
