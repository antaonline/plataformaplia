import { IsOptional, IsString, MaxLength } from 'class-validator'

export class TrackReferralDto {
  // Código del afiliado (lo que va en ?ref=).
  @IsString() @MaxLength(64)
  code: string

  // Id anónimo del visitante (cookie), para deduplicar clicks.
  @IsOptional() @IsString() @MaxLength(64)
  visitorId?: string

  @IsOptional() @IsString() @MaxLength(512)
  landingPath?: string
}
