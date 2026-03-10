import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';


@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Post('izipay/session')
  async createIzipaySession(@Body() body: any) {
    const orderId = Number(body?.orderId);
    const payload = body ?? {};
    return this.paymentsService.createIzipaySession(orderId, payload);
  }

  @Post('izipay/confirm')
  @HttpCode(200)
  async confirmIzipay(@Body() body: any) {
    return this.paymentsService.confirmIzipayPayment(body);
  }

  /*@Post('izipay/webhook')
  @HttpCode(200)
  async izipayWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }*/

  @Post('mock-pay')
  async mockPay(@Body() body: any) {
    const orderId = body?.orderId ? Number(body.orderId) : undefined;
    return this.paymentsService.mockPay(orderId);
  }

}
