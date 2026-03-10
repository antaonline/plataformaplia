import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PrepareCheckoutDto } from './dto/prepare-checkout.dto'

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}


  @UseGuards(JwtAuthGuard)
  @Post('prepare-auth')
  async prepareAuth(@Req() req: any, @Body() dto: PrepareCheckoutDto) {
    return this.checkoutService.prepareForUser(req.user.id, req.user.email, dto);
  }

  @Post('prepare')
  prepare(@Body() dto: PrepareCheckoutDto) {
    return this.checkoutService.prepare(dto)
  }
}
