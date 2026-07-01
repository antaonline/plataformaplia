import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AffiliatesService } from '../affiliates/affiliates.service';

/**
 * Reversa (clawback) de comisiones de afiliado cuando su orden termina
 * cancelada/rechazada. Como el cobro es inmediato (sin retención), este cron es
 * la red de seguridad: corre una vez al día y anula las comisiones cuyas
 * órdenes ya no están aprobadas, para que no se paguen.
 */
@Injectable()
export class AffiliateReversalCron {
  private readonly logger = new Logger(AffiliateReversalCron.name);

  constructor(
    private prisma: PrismaService,
    private affiliates: AffiliatesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: 'affiliate-reversals' })
  async handle() {
    try {
      const toReverse = await this.prisma.affiliateCommission.findMany({
        where: {
          status: { not: 'REVERSED' },
          order: {
            status: {
              in: [OrderStatus.CANCELLED, OrderStatus.DECLINED, OrderStatus.FAILED],
            },
          },
        },
        select: { orderId: true },
      });

      for (const c of toReverse) {
        await this.affiliates.reverseCommissionForOrder(c.orderId);
      }

      if (toReverse.length) {
        this.logger.log(
          `Revertidas ${toReverse.length} comisiones por órdenes canceladas/rechazadas.`,
        );
      }
    } catch (e: any) {
      this.logger.error(`affiliate-reversals fallo: ${e?.message}`);
    }
  }
}
