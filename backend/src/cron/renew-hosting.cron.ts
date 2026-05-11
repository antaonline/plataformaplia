
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IzipayService } from '../payments/izipay.service';
import { CyberpanelService } from '../integrations/cyberpanel/cyberpanel.service';
import { MailService } from '../mail/mail.service';
import { addDays, addMonths, differenceInDays } from 'date-fns';

@Injectable()
export class RenewHostingCron {
  private readonly logger = new Logger(RenewHostingCron.name);

  constructor(
    private prisma: PrismaService,
    private izipay: IzipayService,
    private cyberpanel: CyberpanelService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handle() {
    const now = new Date();
    const subs = await this.prisma.hostingSubscription.findMany({
      include: {
        user: true,
        projects: true,
        plan: true,
        account: {
          include: {
            sites: true,
          },
        },
      },
    });

    for (const sub of subs) {
      const dueAt = sub.renewalDueAt ?? sub.endDate;
      const daysPastDue = differenceInDays(now, dueAt);
      const daysUntilDue = differenceInDays(dueAt, now);
      const graceEndsAt = addDays(dueAt, 14);

      // Notificaciones PRE-vencimiento
      if (sub.status === 'ACTIVE' && daysUntilDue <= 14 && daysUntilDue > 0) {
        if (daysUntilDue === 14 && !sub.renewalNoticeSentAt) {
          await this.mailService.sendRenewalNotice(sub.user.email, 14);
          await this.prisma.hostingSubscription.update({
            where: { id: sub.id },
            data: { renewalNoticeSentAt: now },
          });
        } else if (daysUntilDue === 7 && !sub.renewalReminderSentAt) {
          await this.mailService.sendRenewalNotice(sub.user.email, 7);
          await this.prisma.hostingSubscription.update({
            where: { id: sub.id },
            data: { renewalReminderSentAt: now },
          });
        }
      }

      if (sub.status === 'ACTIVE' && now >= dueAt) {
        const isLanding = sub.plan?.slug?.toLowerCase().includes('landing') || sub.planId === 1;
        const renewalAmount = Number(sub.cycleAmount ?? (isLanding ? 135 : 165));
        
        if (sub.cardToken) {
          try {
            await this.izipay.chargeTokenized({
              amount: renewalAmount,
              cardToken: sub.cardToken,
              currency: 'PEN',
              orderId: sub.id,
            });

            const nextEnd = addMonths(dueAt, sub.billingCycleMonths || 12);
            await this.prisma.hostingSubscription.update({
              where: { id: sub.id },
              data: {
                lastChargedAt: now,
                endDate: nextEnd,
                nextBillingAt: nextEnd,
                renewalDueAt: nextEnd,
                renewalNoticeSentAt: null,
                renewalReminderSentAt: null,
                renewalFinalNoticeSentAt: null,
                status: 'ACTIVE',
              },
            });
            continue;
          } catch (error) {
            this.logger.error(`Fallo cobro automatico para sub=${sub.id}: ${error.message}`);
            await this.prisma.hostingSubscription.update({
              where: { id: sub.id },
              data: { status: 'PAST_DUE' },
            });
          }
        } else {
          await this.prisma.hostingSubscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
          });
        }
      }

      // Notificaciones POST-vencimiento y suspensión
      if (sub.status === 'PAST_DUE') {
        if (daysPastDue >= 13 && !sub.renewalFinalNoticeSentAt) {
          await this.mailService.sendRenewalNotice(sub.user.email, 1);
          await this.prisma.hostingSubscription.update({
            where: { id: sub.id },
            data: { renewalFinalNoticeSentAt: now },
          });
        }

        if (now > graceEndsAt) {
          this.logger.warn(`Cancelando suscripcion sub=${sub.id} por falta de pago tras periodo de gracia.`);
          const project = sub.projects?.[0];
          if (project) {
            await this.cyberpanel.deleteSiteByProject(project.id);
          }
          for (const site of sub.account?.sites ?? []) {
            await this.cyberpanel.deleteSiteByDomain(site.domain);
          }
          await this.prisma.hostingSubscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELED' },
          });
        }
      }
    }
  }
}
