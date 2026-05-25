import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MetaAdsService, PerformanceDecision } from './meta-ads.service'
import { ConfigService } from '@nestjs/config'

/**
 * MetaAdsCron — Gestión autónoma de campañas de Facebook Ads para Plia
 *
 * Horario:
 *   - Lunes 9:00 AM: Evaluación semanal completa + decisiones
 *   - Todos los días 8:00 AM: Revisión rápida de alertas críticas
 */
@Injectable()
export class MetaAdsCron {
  private readonly logger = new Logger(MetaAdsCron.name)

  constructor(
    private readonly metaAdsService: MetaAdsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Evaluación completa cada lunes a las 9:00 AM (Lima, UTC-5)
   * Revisa todas las campañas activas, decide renovar/pausar/crear variante
   */
  @Cron('0 14 * * 1', { name: 'meta-ads-weekly-review', timeZone: 'America/Lima' })
  async weeklyReview(): Promise<void> {
    this.logger.log('=== EVALUACIÓN SEMANAL META ADS ===')

    try {
      const decisions = await this.metaAdsService.evaluateAndActOnCampaigns()
      this.logDecisionsSummary(decisions)
    } catch (err) {
      this.logger.error(`Error en evaluación semanal: ${err.message}`)
    }
  }

  /**
   * Revisión diaria a las 8:00 AM (Lima)
   * Solo actúa si hay problemas críticos: CPC > 3x umbral o gasto sin conversiones
   */
  @Cron('0 13 * * *', { name: 'meta-ads-daily-check', timeZone: 'America/Lima' })
  async dailyCheck(): Promise<void> {
    this.logger.log('Revisión diaria de alertas críticas...')

    try {
      const campaigns = await this.metaAdsService.getAllActiveCampaigns()

      for (const campaign of campaigns) {
        const insights = await this.metaAdsService.getCampaignInsights(campaign.id, 'last_7d')

        // Alerta crítica: CPC extremo (> S/5.00) → pausa inmediata
        if (insights.cpc > 5.00 && insights.impressions > 100) {
          this.logger.warn(`ALERTA CRÍTICA: ${campaign.name} CPC S/${insights.cpc} — pausando`)
          await this.metaAdsService.pauseCampaign(campaign.id)
        }

        // Alerta: mucho gasto sin ningún lead
        if (insights.spend > 50 && insights.leads === 0 && insights.clicks < 5) {
          this.logger.warn(`ALERTA: ${campaign.name} gastó S/${insights.spend} sin leads ni clics — pausando`)
          await this.metaAdsService.pauseCampaign(campaign.id)
        }
      }
    } catch (err) {
      this.logger.error(`Error en revisión diaria: ${err.message}`)
    }
  }

  private logDecisionsSummary(decisions: PerformanceDecision[]): void {
    const counts = decisions.reduce(
      (acc, d) => {
        acc[d.action] = (acc[d.action] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    this.logger.log(`Resumen: ${JSON.stringify(counts)}`)

    decisions.forEach((d) => {
      this.logger.log(`  [${d.action}] ${d.campaignId}: ${d.reason}`)
    })
  }
}
