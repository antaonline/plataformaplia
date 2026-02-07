import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { PrismaModule } from '../prisma/prisma.module'
import { OrdersModule } from '../orders/orders.module'
import { DomainsModule } from '../domains/domains.module'

@Module({
  imports: [PrismaModule, OrdersModule, DomainsModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
