import { IsEmail, IsInt, IsOptional } from 'class-validator';
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
}
