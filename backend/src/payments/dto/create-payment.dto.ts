import { IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsOptional()
  cardToken?: string;
}
