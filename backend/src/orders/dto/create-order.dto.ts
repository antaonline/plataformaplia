import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  planId: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  amount?: number;

  // Atribución de afiliado (resuelta en el checkout desde la cookie plia_ref).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  affiliateId?: number;

  @IsOptional()
  @IsString()
  affiliateCode?: string;
}
