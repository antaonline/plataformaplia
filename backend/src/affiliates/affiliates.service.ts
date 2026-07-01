import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomInt } from 'crypto'
import { addBusinessDays } from 'date-fns'
import { PlanServiceType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdatePayoutMethodDto } from './dto/update-payout-method.dto'
import { TrackReferralDto } from './dto/track-referral.dto'
import {
  AFFILIATE_HOSTING_PERCENT,
  AFFILIATE_MAX_WITHDRAWALS_PER_MONTH,
  AFFILIATE_MIN_WITHDRAWAL,
  AFFILIATE_PAYOUT_SLA_BUSINESS_DAYS,
} from './affiliates.config'

// Alfabeto sin caracteres ambiguos (0/O, 1/I) para códigos fáciles de leer.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  // ── Generación de código ────────────────────────────────────────────
  private randomSuffix(len: number) {
    let out = ''
    for (let i = 0; i < len; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    return out
  }

  private baseFromName(name?: string) {
    const base = (name || 'PLIA')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8)
    return base || 'PLIA'
  }

  private async generateUniqueCode(name?: string) {
    const base = this.baseFromName(name)
    for (let attempt = 0; attempt < 12; attempt++) {
      const code = `${base}${this.randomSuffix(attempt < 6 ? 4 : 6)}`
      const exists = await this.prisma.affiliateAccount.findUnique({ where: { code } })
      if (!exists) return code
    }
    return `PLIA${Date.now().toString(36).toUpperCase()}`
  }

  // ── Cuenta (se crea de forma perezosa la primera vez) ─────────────────
  async getOrCreateForUser(userId: number) {
    const existing = await this.prisma.affiliateAccount.findUnique({ where: { userId } })
    if (existing) return existing

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Usuario no encontrado')

    const code = await this.generateUniqueCode(user.name)
    try {
      return await this.prisma.affiliateAccount.create({ data: { userId, code } })
    } catch {
      // Carrera: si otro request creó la cuenta en paralelo, devuélvela.
      const again = await this.prisma.affiliateAccount.findUnique({ where: { userId } })
      if (again) return again
      throw new BadRequestException('No se pudo crear la cuenta de afiliado')
    }
  }

  // ── Saldos ────────────────────────────────────────────────────────────
  private async computeBalances(affiliateId: number) {
    const sumWhere = (where: any) =>
      this.prisma.affiliateCommission.aggregate({ _sum: { amount: true }, where })
    const [available, inProcess, paid] = await Promise.all([
      sumWhere({ affiliateId, status: 'AVAILABLE', payoutId: null }),
      sumWhere({ affiliateId, status: 'AVAILABLE', payoutId: { not: null } }),
      sumWhere({ affiliateId, status: 'PAID' }),
    ])
    const num = (v: any) => Number(v?._sum?.amount ?? 0)
    const availableAmount = num(available)
    const inProcessAmount = num(inProcess)
    const paidAmount = num(paid)
    return {
      available: availableAmount,
      inProcess: inProcessAmount,
      paid: paidAmount,
      totalEarned: availableAmount + inProcessAmount + paidAmount,
    }
  }

  async getDashboard(userId: number) {
    const account = await this.getOrCreateForUser(userId)
    const [balances, conversions, unreadCount] = await Promise.all([
      this.computeBalances(account.id),
      this.prisma.affiliateCommission.count({
        where: { affiliateId: account.id, status: { not: 'REVERSED' } },
      }),
      this.prisma.affiliateCommission.count({
        where: { affiliateId: account.id, status: { not: 'REVERSED' }, readAt: null },
      }),
    ])
    return {
      code: account.code,
      status: account.status,
      payoutMethod: account.payoutMethod,
      payout: {
        yapeNumber: account.yapeNumber,
        yapeName: account.yapeName,
        bankName: account.bankName,
        bankAccount: account.bankAccount,
        bankCci: account.bankCci,
        bankHolder: account.bankHolder,
        bankDocType: account.bankDocType,
        bankDocNumber: account.bankDocNumber,
      },
      balances,
      conversions,
      unreadCount,
      rules: {
        minWithdrawal: AFFILIATE_MIN_WITHDRAWAL,
        maxWithdrawalsPerMonth: AFFILIATE_MAX_WITHDRAWALS_PER_MONTH,
        payoutSlaBusinessDays: AFFILIATE_PAYOUT_SLA_BUSINESS_DAYS,
      },
    }
  }

  // ── Medio de cobro (Yape o banco, excluyente) ─────────────────────────
  async updatePayoutMethod(userId: number, dto: UpdatePayoutMethodDto) {
    const account = await this.getOrCreateForUser(userId)

    if (dto.payoutMethod === 'YAPE') {
      const number = (dto.yapeNumber ?? account.yapeNumber ?? '').trim()
      if (!number) {
        throw new BadRequestException(
          'Ingresa tu número de Yape para habilitarlo como método de cobro.',
        )
      }
    }
    if (dto.payoutMethod === 'BANK') {
      const acc = (dto.bankAccount ?? account.bankAccount ?? '').trim()
      if (!acc) {
        throw new BadRequestException(
          'Ingresa tu número de cuenta bancaria para habilitarla como método de cobro.',
        )
      }
    }

    return this.prisma.affiliateAccount.update({
      where: { id: account.id },
      data: {
        payoutMethod: dto.payoutMethod,
        yapeNumber: dto.yapeNumber ?? account.yapeNumber,
        yapeName: dto.yapeName ?? account.yapeName,
        bankName: dto.bankName ?? account.bankName,
        bankAccount: dto.bankAccount ?? account.bankAccount,
        bankCci: dto.bankCci ?? account.bankCci,
        bankHolder: dto.bankHolder ?? account.bankHolder,
        bankDocType: dto.bankDocType ?? account.bankDocType,
        bankDocNumber: dto.bankDocNumber ?? account.bankDocNumber,
      },
    })
  }

  // Etiqueta legible del producto de una comisión (para afiliado y admin).
  // En hosting agrega el plazo (ej. "Hosting Premium · 2 años") porque el mismo
  // plan paga distinto según el plazo contratado. En Landing/Web basta el nombre.
  private formatProductLabel(order: any): string {
    const name = order?.plan?.name ?? 'Producto'
    const months = order?.billingCycleMonths
    if (order?.plan?.serviceType === PlanServiceType.HOSTING_ONLY && months) {
      const term =
        months % 12 === 0
          ? `${months / 12} ${months / 12 === 1 ? 'año' : 'años'}`
          : `${months} ${months === 1 ? 'mes' : 'meses'}`
      return `${name} · ${term}`
    }
    return name
  }

  // ── Comisiones (ventas del afiliado) ─────────────────────────────────
  async listCommissions(userId: number) {
    const account = await this.getOrCreateForUser(userId)
    const items = await this.prisma.affiliateCommission.findMany({
      where: { affiliateId: account.id },
      orderBy: { createdAt: 'desc' },
      include: { order: { include: { plan: true } } },
    })
    return items.map((c) => ({
      id: c.id,
      amount: Number(c.amount),
      currency: c.currency,
      status: c.status,
      product: this.formatProductLabel(c.order),
      orderId: c.orderId,
      createdAt: c.createdAt,
      read: c.readAt != null,
    }))
  }

  async markCommissionsRead(userId: number) {
    const account = await this.getOrCreateForUser(userId)
    await this.prisma.affiliateCommission.updateMany({
      where: { affiliateId: account.id, readAt: null },
      data: { readAt: new Date() },
    })
    return { ok: true }
  }

  // ── Retiros ───────────────────────────────────────────────────────────
  private buildDestinationSnapshot(account: any) {
    if (account.payoutMethod === 'YAPE') {
      return JSON.stringify({
        method: 'YAPE',
        yapeNumber: account.yapeNumber,
        yapeName: account.yapeName,
      })
    }
    return JSON.stringify({
      method: 'BANK',
      bankName: account.bankName,
      bankAccount: account.bankAccount,
      bankCci: account.bankCci,
      bankHolder: account.bankHolder,
      bankDocType: account.bankDocType,
      bankDocNumber: account.bankDocNumber,
    })
  }

  async requestPayout(userId: number) {
    const account = await this.getOrCreateForUser(userId)
    if (!account.payoutMethod) {
      throw new BadRequestException(
        'Primero configura tu método de cobro (Yape o cuenta bancaria).',
      )
    }

    // Límite de retiros por mes calendario (no cuenta los rechazados).
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const withdrawalsThisMonth = await this.prisma.affiliatePayout.count({
      where: {
        affiliateId: account.id,
        requestedAt: { gte: startOfMonth },
        status: { not: 'REJECTED' },
      },
    })
    if (withdrawalsThisMonth >= AFFILIATE_MAX_WITHDRAWALS_PER_MONTH) {
      throw new BadRequestException(
        `Alcanzaste el máximo de ${AFFILIATE_MAX_WITHDRAWALS_PER_MONTH} retiros este mes. Podrás retirar de nuevo el próximo mes.`,
      )
    }

    // Comisiones disponibles que aún no están en otro retiro.
    const available = await this.prisma.affiliateCommission.findMany({
      where: { affiliateId: account.id, status: 'AVAILABLE', payoutId: null },
      select: { id: true, amount: true },
    })
    const total = available.reduce((sum, c) => sum + Number(c.amount), 0)
    if (total < AFFILIATE_MIN_WITHDRAWAL) {
      throw new BadRequestException(
        `El mínimo de retiro es S/${AFFILIATE_MIN_WITHDRAWAL}. Tu saldo disponible es S/${total.toFixed(2)}.`,
      )
    }

    const destination = this.buildDestinationSnapshot(account)
    const dueBy = addBusinessDays(new Date(), AFFILIATE_PAYOUT_SLA_BUSINESS_DAYS)

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.affiliatePayout.create({
        data: {
          affiliateId: account.id,
          amount: total,
          method: account.payoutMethod as string,
          destination,
          dueBy,
          status: 'REQUESTED',
        },
      })
      await tx.affiliateCommission.updateMany({
        where: { id: { in: available.map((c) => c.id) } },
        data: { payoutId: payout.id },
      })
      return {
        id: payout.id,
        amount: Number(payout.amount),
        method: payout.method,
        status: payout.status,
        dueBy: payout.dueBy,
      }
    })
  }

  async listPayouts(userId: number) {
    const account = await this.getOrCreateForUser(userId)
    const items = await this.prisma.affiliatePayout.findMany({
      where: { affiliateId: account.id },
      orderBy: { requestedAt: 'desc' },
    })
    return items.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      method: p.method,
      status: p.status,
      reference: p.reference,
      requestedAt: p.requestedAt,
      dueBy: p.dueBy,
      paidAt: p.paidAt,
    }))
  }

  // ── Tracking de referidos (click sobre un link de afiliado) ──────────
  async trackReferral(
    dto: TrackReferralDto,
    meta: { ipHash?: string; userAgent?: string },
  ) {
    const code = (dto.code || '').trim()
    if (!code) return { ok: false }

    const account = await this.prisma.affiliateAccount.findUnique({ where: { code } })
    if (!account || account.status !== 'ACTIVE') return { ok: false }

    // Dedupe simple por visitante: no duplicamos clicks del mismo navegador.
    if (dto.visitorId) {
      const recent = await this.prisma.affiliateReferral.findFirst({
        where: { affiliateId: account.id, visitorId: dto.visitorId },
      })
      if (recent) return { ok: true }
    }

    await this.prisma.affiliateReferral.create({
      data: {
        affiliateId: account.id,
        visitorId: dto.visitorId ?? 'anon',
        landingPath: dto.landingPath,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent,
      },
    })
    return { ok: true }
  }

  // Resuelve el código de afiliado (?ref=) a una cuenta activa. Lo usan los
  // checkouts para guardar la atribución en la orden.
  async resolveAttribution(code?: string | null) {
    const c = (code || '').trim()
    if (!c) return null
    const account = await this.prisma.affiliateAccount.findUnique({ where: { code: c } })
    if (!account || account.status !== 'ACTIVE') return null
    return { affiliateId: account.id, affiliateCode: account.code }
  }

  // Reversa (clawback) de una comisión cuando su orden se cancela/reembolsa.
  async reverseCommissionForOrder(orderId: number) {
    const commission = await this.prisma.affiliateCommission.findUnique({ where: { orderId } })
    if (!commission || commission.status === 'REVERSED') return null
    return this.prisma.affiliateCommission.update({
      where: { id: commission.id },
      data: { status: 'REVERSED', reversedAt: new Date() },
    })
  }

  // ── Generación de comisión al aprobarse una orden ────────────────────
  // Idempotente: 1 comisión por orden (orderId @unique). Las renovaciones de
  // hosting no pasan por aquí (van por HostingRenewal), así que el hosting solo
  // paga comisión en la primera compra, como se definió.
  async createCommissionForOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { plan: true, affiliate: true },
    })
    if (!order) return null

    // affiliateId se fija en el checkout; si solo quedó el código, lo resolvemos.
    let affiliate = order.affiliate
    if (!affiliate && order.affiliateCode) {
      affiliate = await this.prisma.affiliateAccount.findUnique({
        where: { code: order.affiliateCode },
      })
    }
    if (!affiliate || affiliate.status !== 'ACTIVE') return null

    const isHosting = order.plan?.serviceType === PlanServiceType.HOSTING_ONLY

    // Hosting: comisión = % del total pagado (cubre plan × plazo, redondeado
    // al sol) para TODOS los plazos, incluido 1 mes. Landing/Web: monto fijo.
    const commissionAmount = isHosting
      ? Math.round(Number(order.amount) * (AFFILIATE_HOSTING_PERCENT / 100))
      : Number(order.plan?.affiliateCommission ?? 0)
    if (!commissionAmount || commissionAmount <= 0) return null

    // Anti auto-referido: nadie cobra comisión por su propia compra.
    if (order.userId && order.userId === affiliate.userId) return null

    const existing = await this.prisma.affiliateCommission.findUnique({ where: { orderId } })
    if (existing) return existing

    try {
      return await this.prisma.affiliateCommission.create({
        data: {
          affiliateId: affiliate.id,
          orderId,
          amount: commissionAmount,
          currency: order.currency || 'PEN',
          status: 'AVAILABLE',
        },
      })
    } catch {
      const again = await this.prisma.affiliateCommission.findUnique({ where: { orderId } })
      if (again) return again
      return null
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  ADMIN
  // ════════════════════════════════════════════════════════════════════

  private periodWhere(from?: string, to?: string) {
    const gte = from ? new Date(from) : undefined
    const lte = to ? new Date(to) : undefined
    if (!gte && !lte) return {}
    return { createdAt: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } }
  }

  private safeParseJson(s?: string | null) {
    if (!s) return null
    try {
      return JSON.parse(s)
    } catch {
      return s
    }
  }

  async adminStats(from?: string, to?: string) {
    const period = this.periodWhere(from, to)
    const [totalAffiliates, newAffiliates, conv, paid, available, pending] = await Promise.all([
      this.prisma.affiliateAccount.count(),
      this.prisma.affiliateAccount.count({ where: period }),
      this.prisma.affiliateCommission.aggregate({
        _count: { _all: true },
        _sum: { amount: true },
        where: { status: { not: 'REVERSED' }, ...period },
      }),
      this.prisma.affiliateCommission.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID', ...period },
      }),
      // Disponible (deuda viva con los afiliados): all-time, sin filtro de fecha.
      this.prisma.affiliateCommission.aggregate({
        _sum: { amount: true },
        where: { status: 'AVAILABLE' },
      }),
      this.prisma.affiliatePayout.aggregate({
        _count: { _all: true },
        _sum: { amount: true },
        where: { status: 'REQUESTED' },
      }),
    ])
    const num = (a: any) => Number(a?._sum?.amount ?? 0)
    return {
      totalAffiliates,
      newAffiliates,
      conversions: conv._count._all,
      commissionsGenerated: num(conv),
      commissionsPaid: num(paid),
      commissionsAvailable: num(available),
      pendingPayouts: { count: pending._count._all, amount: num(pending) },
    }
  }

  async adminListAffiliates() {
    const accounts = await this.prisma.affiliateAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    const groups = await this.prisma.affiliateCommission.groupBy({
      by: ['affiliateId', 'status'],
      _sum: { amount: true },
      _count: { _all: true },
    })
    const byAff = new Map<number, { generated: number; available: number; sales: number }>()
    for (const g of groups) {
      const cur = byAff.get(g.affiliateId) ?? { generated: 0, available: 0, sales: 0 }
      const amt = Number(g._sum.amount ?? 0)
      if (g.status !== 'REVERSED') {
        cur.generated += amt
        cur.sales += g._count._all
      }
      if (g.status === 'AVAILABLE') cur.available += amt
      byAff.set(g.affiliateId, cur)
    }
    return accounts.map((a) => {
      const s = byAff.get(a.id) ?? { generated: 0, available: 0, sales: 0 }
      return {
        id: a.id,
        code: a.code,
        status: a.status,
        name: a.user?.name,
        email: a.user?.email,
        payoutMethod: a.payoutMethod,
        sales: s.sales,
        generated: s.generated,
        available: s.available,
        createdAt: a.createdAt,
      }
    })
  }

  async adminListConversions(from?: string, to?: string) {
    const items = await this.prisma.affiliateCommission.findMany({
      where: { status: { not: 'REVERSED' }, ...this.periodWhere(from, to) },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        affiliate: { include: { user: { select: { name: true, email: true } } } },
        order: { include: { plan: { select: { name: true, serviceType: true } } } },
      },
    })
    return items.map((c) => ({
      id: c.id,
      amount: Number(c.amount),
      status: c.status,
      product: this.formatProductLabel(c.order),
      affiliateCode: c.affiliate?.code,
      affiliateName: c.affiliate?.user?.name,
      createdAt: c.createdAt,
      orderId: c.orderId,
    }))
  }

  async adminListPayouts(status?: string) {
    const where = !status || status === 'ALL' ? {} : { status }
    const items = await this.prisma.affiliatePayout.findMany({
      where,
      orderBy: { requestedAt: 'asc' },
      include: { affiliate: { include: { user: { select: { name: true, email: true } } } } },
    })
    return items.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      destination: this.safeParseJson(p.destination),
      status: p.status,
      reference: p.reference,
      requestedAt: p.requestedAt,
      dueBy: p.dueBy,
      paidAt: p.paidAt,
      affiliateCode: p.affiliate?.code,
      affiliateName: p.affiliate?.user?.name,
      affiliateEmail: p.affiliate?.user?.email,
    }))
  }

  async adminPayPayout(payoutId: number, reference?: string) {
    const payout = await this.prisma.affiliatePayout.findUnique({ where: { id: payoutId } })
    if (!payout) throw new NotFoundException('Retiro no encontrado')
    if (payout.status === 'PAID') return payout
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.affiliatePayout.update({
        where: { id: payoutId },
        data: { status: 'PAID', reference: reference ?? payout.reference, paidAt: new Date() },
      })
      await tx.affiliateCommission.updateMany({
        where: { payoutId, status: 'AVAILABLE' },
        data: { status: 'PAID' },
      })
      return updated
    })
  }

  async adminRejectPayout(payoutId: number) {
    const payout = await this.prisma.affiliatePayout.findUnique({ where: { id: payoutId } })
    if (!payout) throw new NotFoundException('Retiro no encontrado')
    if (payout.status !== 'REQUESTED') return payout
    return this.prisma.$transaction(async (tx) => {
      // Devuelve las comisiones a disponible para que se puedan retirar de nuevo.
      await tx.affiliateCommission.updateMany({
        where: { payoutId },
        data: { payoutId: null },
      })
      return tx.affiliatePayout.update({
        where: { id: payoutId },
        data: { status: 'REJECTED' },
      })
    })
  }
}
