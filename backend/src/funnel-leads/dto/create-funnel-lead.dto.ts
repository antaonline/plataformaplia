import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload que envía el embudo /tu-web-hoy en el punto de decisión (apto/no
 * apto). Todo opcional salvo `outcome`. `answers` es el mapa de respuestas del
 * quiz (se guarda como JSON). `_honeypot` es anti-bot: si viene con valor, la
 * submission se descarta en silencio.
 */
export class CreateFunnelLeadDto {
  @IsOptional() @IsString() @MaxLength(500)
  businessName?: string;

  @IsOptional() @IsString() @MaxLength(200)
  contactName?: string;

  @IsOptional() @IsString() @MaxLength(60)
  whatsapp?: string;

  @IsOptional() @IsString() @MaxLength(320)
  email?: string;

  @IsIn(['APTO', 'NOAPTO'])
  outcome!: 'APTO' | 'NOAPTO';

  @IsOptional() @IsString() @MaxLength(80)
  disqualifier?: string;

  @IsOptional() @IsObject()
  answers?: Record<string, string>;

  @IsOptional() @IsString() @MaxLength(191)
  utmSource?: string;

  @IsOptional() @IsString() @MaxLength(191)
  utmMedium?: string;

  @IsOptional() @IsString() @MaxLength(191)
  utmCampaign?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  fbclid?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  referrer?: string;

  @IsOptional() @IsString() @MaxLength(500)
  landingPath?: string;

  @IsOptional() @IsString() @MaxLength(200)
  _honeypot?: string;
}
