import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class PrepareCheckoutDto {
  @Type(() => Number)
  @IsInt()
  planId: number

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  domain?: string
}
