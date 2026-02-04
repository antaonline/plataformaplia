import { Controller, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentsService } from '../payments/payments.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // 🔹 CREAR ORDEN (antes del pago)
  @Post()
  create(@Body() body: CreateOrderDto ) {
    return this.ordersService.createOrder(body);
  }

  // SIMULA QUE EL PAGO FUE APROBADO
  @Post(':id/pay')
  async payOrder(@Param('id') id: string) {
    return this.paymentsService.approveOrder(Number(id));
  }
}
