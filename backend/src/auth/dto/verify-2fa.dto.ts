import { IsInt, IsOptional, IsString } from 'class-validator'

export class Verify2FADto {
  @IsInt()
  userId: number

  @IsString()
  code: string

  @IsString()
  fingerprint: string

  @IsOptional()
  @IsString()
  userAgent?: string

  @IsOptional()
  @IsString()
  ip?: string
}
