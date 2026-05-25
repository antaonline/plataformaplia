import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'

export enum CampaignObjective {
  OUTCOME_LEADS = 'OUTCOME_LEADS',
  OUTCOME_TRAFFIC = 'OUTCOME_TRAFFIC',
  OUTCOME_AWARENESS = 'OUTCOME_AWARENESS',
  OUTCOME_SALES = 'OUTCOME_SALES',
}

export enum BillingEvent {
  IMPRESSIONS = 'IMPRESSIONS',
  LINK_CLICKS = 'LINK_CLICKS',
}

export enum OptimizationGoal {
  LEAD_GENERATION = 'LEAD_GENERATION',
  LINK_CLICKS = 'LINK_CLICKS',
  LANDING_PAGE_VIEWS = 'LANDING_PAGE_VIEWS',
  REACH = 'REACH',
}

export class CreateCampaignDto {
  @IsString()
  name: string

  @IsEnum(CampaignObjective)
  objective: CampaignObjective

  /** Presupuesto diario en centavos de sol (ej: 5000 = S/50.00) */
  @IsNumber()
  @Min(1000)
  dailyBudgetCents: number

  @IsOptional()
  @IsString()
  adImagePath?: string

  @IsString()
  adHeadline: string

  @IsString()
  adBody: string

  @IsString()
  adLinkUrl: string

  /** Segmentación geográfica — default Lima */
  @IsOptional()
  @IsString()
  geoCountry?: string

  /** Rango de edad mínima */
  @IsOptional()
  @IsNumber()
  ageMin?: number

  /** Rango de edad máxima */
  @IsOptional()
  @IsNumber()
  ageMax?: number

  /** IDs de intereses de Facebook (opcional) */
  @IsOptional()
  interests?: { id: string; name: string }[]
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'PAUSED' | 'DELETED'

  @IsOptional()
  @IsNumber()
  dailyBudgetCents?: number
}
