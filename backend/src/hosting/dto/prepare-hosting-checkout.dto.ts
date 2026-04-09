import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsString } from 'class-validator';

import { HOSTING_TERM_OPTIONS } from '../hosting.catalog';

export class PrepareHostingCheckoutDto {
  @IsString()
  planSlug: string;

  @Type(() => Number)
  @IsIn(HOSTING_TERM_OPTIONS)
  billingCycleMonths: number;

  @IsEmail()
  email: string;
}

