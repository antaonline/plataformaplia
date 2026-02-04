
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RenewHostingCron {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handle() {
    const subs = await this.prisma.hostingSubscription.findMany({
      where: { status: 'ACTIVE', nextBillingAt: { lte: new Date() } },
    });

    for (const sub of subs) {
      // Aquí va la llamada real a Izipay
      await this.prisma.hostingSubscription.update({
        where: {
          id: sub.id,
        },
        data: {
          lastChargedAt: new Date(),
          nextBillingAt: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
        },
      });
    }
  }
}
