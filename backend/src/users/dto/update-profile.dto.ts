import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Juan Perez', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Juan Perez Facturacion', required: false })
  @IsString()
  @IsOptional()
  billingName?: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123', required: false })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiProperty({ example: 'Lima', required: false })
  @IsString()
  @IsOptional()
  billingDepartment?: string;

  @ApiProperty({ example: 'billing@example.com', required: false })
  @IsEmail()
  @IsOptional()
  billingEmail?: string;
}
