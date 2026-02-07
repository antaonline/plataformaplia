import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { DomainsService } from '../domains/domains.service';
import { PrepareCheckoutDto } from './dto/prepare-checkout.dto';
/*import { DomainSelection } from '../prisma/prisma.service';*/

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private domainsService: DomainsService,
  ) {}

  async prepare(dto: PrepareCheckoutDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    })

    if (!plan) {
      throw new BadRequestException('Plan invalido')
    }

    const order = await this.ordersService.createOrder({
      planId: dto.planId,
      email: dto.email,
    })

    /*let domainSelection: DomainSelection | null = null;*/
    let domainSelection;
    let domainPrice = 0
    let currency = 'USD'

    if (dto.domain) {
      const domain = dto.domain.trim().toLowerCase()
      const result = await this.domainsService.checkSingleDomain(domain)
      if (!result || !result.available) {
        throw new BadRequestException('Dominio no disponible')
      }

      domainPrice = result.price
      currency = result.currency

      domainSelection = await this.prisma.domainSelection.create({
        data: {
          orderId: order.id,
          domain,
          price: domainPrice,
          currency,
        },
      })
    }

    const subtotal = Number(plan.price) + Number(domainPrice)
    const taxPercent = Number(process.env.TAX_PERCENT ?? '0')
    const taxes = Math.round(subtotal * (taxPercent / 100) * 100) / 100
    const total = Math.round((subtotal + taxes) * 100) / 100

    return {
      orderId: order.id,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        hostingYear: plan.hostingYear,
      },
      domain: domainSelection
        ? {
            domain: domainSelection.domain,
            price: domainSelection.price,
            currency: domainSelection.currency,
          }
        : null,
      summary: {
        subtotal,
        taxes,
        total,
        currency,
      },
    }
  }
}
