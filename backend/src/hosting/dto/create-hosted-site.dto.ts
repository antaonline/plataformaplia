import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateHostedSiteDto {
  @IsString()
  name: string;

  @IsIn(['subdomain', 'custom'])
  mode: 'subdomain' | 'custom';

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  domain?: string;
}

