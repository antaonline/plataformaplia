import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdatePayoutMethodDto {
  // Método habilitado (excluyente). El afiliado puede guardar datos de ambos,
  // pero solo este se usa para pagarle.
  @IsIn(['YAPE', 'BANK'])
  payoutMethod: 'YAPE' | 'BANK'

  @IsOptional() @IsString() @MaxLength(20)
  yapeNumber?: string

  @IsOptional() @IsString() @MaxLength(120)
  yapeName?: string

  @IsOptional() @IsString() @MaxLength(120)
  bankName?: string

  @IsOptional() @IsString() @MaxLength(40)
  bankAccount?: string

  @IsOptional() @IsString() @MaxLength(40)
  bankCci?: string

  @IsOptional() @IsString() @MaxLength(120)
  bankHolder?: string

  @IsOptional() @IsString() @MaxLength(10)
  bankDocType?: string

  @IsOptional() @IsString() @MaxLength(20)
  bankDocNumber?: string
}
