import { Body, Controller, Post, HttpCode, NotFoundException } from '@nestjs/common';
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
    // SEGURIDAD: este endpoint APRUEBA una orden (crea proyecto, provisiona
    // hosting, dispara comisiones) SIN cobrar. Jamás debe estar activo en
    // producción. Queda deshabilitado por defecto (default-deny) y solo se
    // habilita en entornos de prueba con ENABLE_MOCK_PAY=true. Al lanzar
    // NotFoundException se comporta como si la ruta no existiera.
    if (process.env.ENABLE_MOCK_PAY !== 'true') {
      throw new NotFoundException();
    }
    const orderId = body?.orderId ? Number(body.orderId) : undefined;
    return this.paymentsService.mockPay(orderId);
  }

}
