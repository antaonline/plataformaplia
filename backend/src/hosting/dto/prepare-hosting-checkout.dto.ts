import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

import { HOSTING_TERM_OPTIONS } from '../hosting.catalog';

export class PrepareHostingCheckoutDto {
  @IsString()
  planSlug: string;

  @Type(() => Number)
  @IsIn(HOSTING_TERM_OPTIONS)
  billingCycleMonths: number;

  @IsEmail()
  email: string;

  // Código de afiliado (?ref=) leído de la cookie plia_ref en el front.
  @IsOptional()
  @IsString()
  affiliateCode?: string;
}

