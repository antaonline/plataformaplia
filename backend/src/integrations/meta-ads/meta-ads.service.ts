import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { CreateCampaignDto, UpdateCampaignDto, CampaignObjective, BillingEvent, OptimizationGoal } from './dto/create-campaign.dto'

const GRAPH_API = 'https://graph.facebook.com/v21.0'

export interface CampaignInsights {
  campaignId: string
  campaignName: string
  status: string
  spend: number
  impressions: number
  clicks: number
  cpc: number
  ctr: number
  leads: number
  costPerLead: number
  dateStart: string
  dateStop: string
}

export interface PerformanceDecision {
  campaignId: string
  action: 'RENEW' | 'PAUSE' | 'CREATE_VARIANT' | 'KEEP'
  reason: string
}

@Injectable()
export class MetaAdsService {
  private readonly logger = new Logger(MetaAdsService.name)
  private readonly client: AxiosInstance
  private readonly accessToken: string
  private readonly adAccountId: string
  private readonly pageId: string

  // Umbrales de rendimiento para decisiones autónomas (en soles)
  private readonly THRESHOLDS = {
    maxCpcSoles: 2.50,
    minCtrPercent: 0.8,
    maxCostPerLeadSoles: 25,
    minLeadsToEvaluate: 5,
    renewIfCpcBelow: 1.80,
    criticalCpcSoles: 5.00,
    maxSpendWithoutLeads: 50,
  }

  constructor(private readonly config: ConfigService) {
    this.accessToken = this.config.get<string>('META_ACCESS_TOKEN') ?? ''
    this.adAccountId = this.config.get<string>('META_AD_ACCOUNT_ID') ?? ''
    this.pageId = this.config.get<string>('META_PAGE_ID') ?? ''
    this.client = axios.create({ baseURL: GRAPH_API })
  }

  // ─────────────────────────────────────────────
  // CAMPAÑAS — CREACIÓN COMPLETA
  // ─────────────────────────────────────────────

  async createFullCampaign(dto: CreateCampaignDto): Promise<{ campaignId: string; adSetId: string; adId: string }> {
    this.logger.log(`Creando campaña completa: ${dto.name}`)
    const campaignId = await this.createCampaign(dto)
    const adSetId = await this.createAdSet(campaignId, dto)
    const creativeId = await this.createAdCreative(dto)
    const adId = await this.createAd(adSetId, creativeId, dto.name)
    this.logger.log(`Campaña lista → campaign=${campaignId} adSet=${adSetId} ad=${adId}`)
    return { campaignId, adSetId, adId }
  }

  private async createCampaign(dto: CreateCampaignDto): Promise<string> {
    const { data } = await this.client.post(
      `/${this.adAccountId}/campaigns`,
      null,
      {
        params: {
          access_token: this.accessToken,
          name: dto.name,
          objective: dto.objective,
          status: 'ACTIVE',
          special_ad_categories: '[]',
        },
      },
    )
    return data.id
  }

  private async createAdSet(campaignId: string, dto: CreateCampaignDto): Promise<string> {
    const optimizationGoal = dto.objective === CampaignObjective.OUTCOME_LEADS
      ? OptimizationGoal.LEAD_GENERATION
      : OptimizationGoal.LINK_CLICKS

    const billingEvent = dto.objective === CampaignObjective.OUTCOME_LEADS
      ? BillingEvent.IMPRESSIONS
      : BillingEvent.LINK_CLICKS

    const targeting: Record<string, unknown> = {
      geo_locations: {
        countries: [dto.geoCountry ?? 'PE'],
        location_types: ['home', 'recent'],
      },
      age_min: dto.ageMin ?? 22,
      age_max: dto.ageMax ?? 50,
      publisher_platforms: ['facebook', 'instagram'],
      facebook_positions: ['feed', 'story'],
      instagram_positions: ['stream', 'story'],
    }

    if (dto.interests?.length) {
      targeting.flexible_spec = [{ interests: dto.interests }]
    }

    const { data } = await this.client.post(
      `/${this.adAccountId}/adsets`,
      null,
      {
        params: {
          access_token: this.accessToken,
          name: `${dto.name} - AdSet`,
          campaign_id: campaignId,
          daily_budget: dto.dailyBudgetCents,
          billing_event: billingEvent,
          optimization_goal: optimizationGoal,
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          targeting: JSON.stringify(targeting),
          status: 'ACTIVE',
        },
      },
    )
    return data.id
  }

  private async createAdCreative(dto: CreateCampaignDto): Promise<string> {
    let imageHash: string | undefined
    if (dto.adImagePath && fs.existsSync(dto.adImagePath)) {
      imageHash = await this.uploadImage(dto.adImagePath)
    }

    const linkData: Record<string, unknown> = {
      link: dto.adLinkUrl,
      message: dto.adBody,
      name: dto.adHeadline,
      call_to_action: {
        type: 'LEARN_MORE',
        value: { link: dto.adLinkUrl },
      },
    }
    if (imageHash) linkData.image_hash = imageHash

    const objectStorySpec = { page_id: this.pageId, link_data: linkData }

    const { data } = await this.client.post(
      `/${this.adAccountId}/adcreatives`,
      null,
      {
        params: {
          access_token: this.accessToken,
          name: `${dto.name} - Creative`,
          object_story_spec: JSON.stringify(objectStorySpec),
        },
      },
    )
    return data.id
  }

  private async createAd(adSetId: string, creativeId: string, name: string): Promise<string> {
    const { data } = await this.client.post(
      `/${this.adAccountId}/ads`,
      null,
      {
        params: {
          access_token: this.accessToken,
          name: `${name} - Ad`,
          adset_id: adSetId,
          creative: JSON.stringify({ creative_id: creativeId }),
          status: 'ACTIVE',
        },
      },
    )
    return data.id
  }

  async uploadImage(imagePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(imagePath)
    const base64 = fileBuffer.toString('base64')
    const filename = path.basename(imagePath)

    const { data } = await this.client.post(
      `/${this.adAccountId}/adimages`,
      null,
      {
        params: {
          access_token: this.accessToken,
          bytes: base64,
          name: filename,
        },
      },
    )
    const firstKey = Object.keys(data.images)[0]
    return data.images[firstKey].hash
  }

  // ─────────────────────────────────────────────
  // GESTIÓN DE ESTADO
  // ─────────────────────────────────────────────

  async updateCampaign(campaignId: string, dto: UpdateCampaignDto): Promise<void> {
    const params: Record<string, unknown> = { access_token: this.accessToken }
    if (dto.status) params.status = dto.status
    if (dto.dailyBudgetCents) params.daily_budget = dto.dailyBudgetCents
    await this.client.post(`/${campaignId}`, null, { params })
    this.logger.log(`Campaña ${campaignId} actualizada: ${JSON.stringify(dto)}`)
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await this.updateCampaign(campaignId, { status: 'PAUSED' })
  }

  async resumeCampaign(campaignId: string): Promise<void> {
    await this.updateCampaign(campaignId, { status: 'ACTIVE' })
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await this.updateCampaign(campaignId, { status: 'DELETED' })
  }

  // ─────────────────────────────────────────────
  // INSIGHTS / ANALÍTICA
  // ─────────────────────────────────────────────

  async getCampaignInsights(
    campaignId: string,
    dateRange: 'last_7d' | 'last_14d' | 'last_30d' = 'last_7d',
  ): Promise<CampaignInsights> {
    const { data } = await this.client.get(`/${campaignId}/insights`, {
      params: {
        access_token: this.accessToken,
        fields: 'campaign_name,spend,impressions,clicks,cpc,ctr,actions,cost_per_action_type,date_start,date_stop',
        date_preset: dateRange,
      },
    })

    const row = data.data?.[0] ?? {}
    const leads =
      this.extractActionValue(row.actions, 'lead') +
      this.extractActionValue(row.actions, 'onsite_conversion.lead_grouped')
    const costPerLead = this.extractActionValue(row.cost_per_action_type, 'lead')

    return {
      campaignId,
      campaignName: row.campaign_name ?? '',
      status: '',
      spend: parseFloat(row.spend ?? '0'),
      impressions: parseInt(row.impressions ?? '0', 10),
      clicks: parseInt(row.clicks ?? '0', 10),
      cpc: parseFloat(row.cpc ?? '0'),
      ctr: parseFloat(row.ctr ?? '0'),
      leads,
      costPerLead,
      dateStart: row.date_start ?? '',
      dateStop: row.date_stop ?? '',
    }
  }

  async getAllActiveCampaigns(): Promise<{ id: string; name: string; status: string; endTime?: string }[]> {
    const { data } = await this.client.get(`/${this.adAccountId}/campaigns`, {
      params: {
        access_token: this.accessToken,
        fields: 'id,name,status,stop_time',
        filtering: JSON.stringify([
          { field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'PAUSED'] },
        ]),
        limit: 100,
      },
    })
    return (data.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      endTime: c.stop_time,
    }))
  }

  async getAccountSummary(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get(`/${this.adAccountId}`, {
      params: {
        access_token: this.accessToken,
        fields: 'name,currency,account_status,balance,spend_cap,amount_spent',
      },
    })
    return data
  }

  // ─────────────────────────────────────────────
  // DECISIÓN AUTÓNOMA
  // ─────────────────────────────────────────────

  async evaluateAndActOnCampaigns(): Promise<PerformanceDecision[]> {
    this.logger.log('Iniciando evaluación autónoma de campañas...')
    const campaigns = await this.getAllActiveCampaigns()
    const decisions: PerformanceDecision[] = []

    for (const campaign of campaigns) {
      try {
        const insights = await this.getCampaignInsights(campaign.id, 'last_7d')
        const decision = this.decideAction(insights, campaign)
        await this.executeDecision(campaign.id, decision.action)
        decisions.push(decision)
        this.logger.log(`[${campaign.name}] → ${decision.action}: ${decision.reason}`)
      } catch (err) {
        this.logger.error(`Error evaluando campaña ${campaign.id}: ${err.message}`)
      }
    }

    return decisions
  }

  decideAction(
    insights: CampaignInsights,
    campaign: { id: string; name: string; endTime?: string },
  ): PerformanceDecision {
    const { cpc, ctr, leads, costPerLead, impressions, spend } = insights
    const t = this.THRESHOLDS

    if (impressions < 200) {
      return { campaignId: campaign.id, action: 'KEEP', reason: 'Muy pocas impresiones aún — esperando datos suficientes' }
    }

    if (cpc > t.maxCpcSoles) {
      return { campaignId: campaign.id, action: 'CREATE_VARIANT', reason: `CPC S/${cpc.toFixed(2)} supera límite S/${t.maxCpcSoles} — crear nuevo creativo` }
    }

    if (ctr < t.minCtrPercent && impressions > 500) {
      return { campaignId: campaign.id, action: 'CREATE_VARIANT', reason: `CTR ${ctr.toFixed(2)}% bajo umbral ${t.minCtrPercent}% — el creativo no engancha` }
    }

    if (leads >= t.minLeadsToEvaluate && costPerLead > t.maxCostPerLeadSoles) {
      return { campaignId: campaign.id, action: 'PAUSE', reason: `Costo/lead S/${costPerLead.toFixed(2)} supera límite S/${t.maxCostPerLeadSoles}` }
    }

    if (spend > t.maxSpendWithoutLeads && leads === 0) {
      return { campaignId: campaign.id, action: 'PAUSE', reason: `Gastó S/${spend.toFixed(2)} sin generar leads` }
    }

    const isExpiringSoon = campaign.endTime && this.isExpiringSoon(campaign.endTime)
    if (isExpiringSoon && cpc < t.renewIfCpcBelow) {
      return { campaignId: campaign.id, action: 'RENEW', reason: `Vence pronto con buen CPC S/${cpc.toFixed(2)} — renovando` }
    }

    return { campaignId: campaign.id, action: 'KEEP', reason: `Rendimiento OK — CPC S/${cpc.toFixed(2)}, CTR ${ctr.toFixed(2)}%` }
  }

  private async executeDecision(campaignId: string, action: PerformanceDecision['action']): Promise<void> {
    if (action === 'PAUSE') {
      await this.pauseCampaign(campaignId)
    }
    // RENEW y CREATE_VARIANT se registran en logs; el cron los gestiona
  }

  // ─────────────────────────────────────────────
  // UTILIDADES INTERNAS
  // ─────────────────────────────────────────────

  private extractActionValue(actions: any[], actionType: string): number {
    if (!actions) return 0
    const found = actions.find((a) => a.action_type === actionType)
    return found ? parseFloat(found.value) : 0
  }

  private isExpiringSoon(endTime: string, daysThreshold = 3): boolean {
    const diffDays = (new Date(endTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diffDays <= daysThreshold && diffDays >= 0
  }
}
