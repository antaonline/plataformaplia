import { Body, Controller, Post } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { PrepareCheckoutDto } from './dto/prepare-checkout.dto'

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('prepare')
  prepare(@Body() dto: PrepareCheckoutDto) {
    return this.checkoutService.prepare(dto)
  }
}
