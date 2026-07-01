import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { PrismaModule } from '../prisma/prisma.module'
import { OrdersModule } from '../orders/orders.module'
import { DomainsModule } from '../domains/domains.module'
import { AffiliatesModule } from '../affiliates/affiliates.module'

@Module({
  imports: [PrismaModule, OrdersModule, DomainsModule, AffiliatesModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
