import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { getPlan, PlanConfig } from './plan-config';

const FP = 100; // punto fijo: creditos * 100 guardados como Int

export interface CreditStatus {
  plan: string;
  planLabel: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  remainingDaily: number;
  remainingMonthly: number;
}

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(private prisma: PrismaService) {}

  private sameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  private sameMonth(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
    );
  }

  /** Obtiene (o crea) el registro y aplica resets diario/mensual. */
  private async getFresh(userId: number) {
    let credit = await (this.prisma as any).aiCredit.findUnique({
      where: { userId },
    });
    if (!credit) {
      credit = await (this.prisma as any).aiCredit.create({
        data: { userId, plan: 'EXPLORADOR' },
      });
    }
    const now = new Date();
    const last = new Date(credit.lastResetAt);
    const patch: any = {};
    if (!this.sameMonth(now, last)) {
      patch.monthlyUsed = 0;
      patch.dailyUsed = 0;
      patch.lastResetAt = now;
    } else if (!this.sameDay(now, last)) {
      patch.dailyUsed = 0;
      patch.lastResetAt = now;
    }
    if (Object.keys(patch).length) {
      credit = await (this.prisma as any).aiCredit.update({
        where: { userId },
        data: patch,
      });
    }
    return credit;
  }

  async status(userId: number): Promise<CreditStatus> {
    const credit = await this.getFresh(userId);
    const plan: PlanConfig = getPlan(credit.plan);
    const d = credit.dailyUsed / FP;
    const m = credit.monthlyUsed / FP;
    return {
      plan: plan.code,
      planLabel: plan.label,
      dailyUsed: Math.round(d * 10) / 10,
      dailyLimit: plan.dailyCredits,
      monthlyUsed: Math.round(m * 10) / 10,
      monthlyLimit: plan.monthlyCredits,
      remainingDaily: Math.max(0, plan.dailyCredits - d),
      remainingMonthly: Math.max(0, plan.monthlyCredits - m),
    };
  }

  /** Plan del usuario (para routing de modelo). Override de pruebas: env. */
  async getPlanFor(userId: number): Promise<PlanConfig> {
    const forced = process.env.IACHAT_FORCE_PLAN;
    if (forced) return getPlan(forced);
    const credit = await this.getFresh(userId);
    return getPlan(credit.plan);
  }

  /** Lanza 403 con mensaje claro si el usuario ya no tiene creditos. */
  async assertCanGenerate(userId: number): Promise<void> {
    const s = await this.status(userId);
    if (s.monthlyUsed >= s.monthlyLimit) {
      throw new ForbiddenException(
        `Alcanzaste el limite mensual de tu plan ${s.planLabel} (${s.monthlyLimit} creditos). Sube de plan para seguir creando.`,
      );
    }
    if (s.dailyUsed >= s.dailyLimit) {
      throw new ForbiddenException(
        `Alcanzaste el limite diario de tu plan ${s.planLabel} (${s.dailyLimit} creditos/dia). Vuelve manana o sube de plan.`,
      );
    }
  }

  /** Descuenta creditos reales tras una generacion (punto fijo). */
  async consume(userId: number, credits: number): Promise<void> {
    if (!credits || credits <= 0) return;
    const inc = Math.round(credits * FP);
    await (this.prisma as any).aiCredit.update({
      where: { userId },
      data: {
        dailyUsed: { increment: inc },
        monthlyUsed: { increment: inc },
      },
    });
    this.logger.log(
      `[Credits] user=${userId} consumio ${credits} creditos`,
    );
  }

  /** Cambia el plan del usuario (uso admin/checkout). */
  async setPlan(userId: number, plan: string): Promise<void> {
    const p = getPlan(plan).code;
    await (this.prisma as any).aiCredit.upsert({
      where: { userId },
      create: { userId, plan: p },
      update: { plan: p },
    });
  }
}
