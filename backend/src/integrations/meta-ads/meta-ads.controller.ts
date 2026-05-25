import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common'
import { MetaAdsService, CampaignInsights } from './meta-ads.service'
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'

@Controller('meta-ads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  /** Crear campaña completa (campaign + adset + creative + ad) */
  @Post('campaigns')
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return this.metaAdsService.createFullCampaign(dto)
  }

  /** Ver todas las campañas activas */
  @Get('campaigns')
  async listCampaigns() {
    return this.metaAdsService.getAllActiveCampaigns()
  }

  /** Insights de una campaña específica */
  @Get('campaigns/:id/insights')
  async getCampaignInsights(
    @Param('id') id: string,
    @Query('range') range: 'last_7d' | 'last_14d' | 'last_30d' = 'last_7d',
  ): Promise<CampaignInsights> {
    return this.metaAdsService.getCampaignInsights(id, range)
  }

  /** Actualizar estado o presupuesto de una campaña */
  @Patch('campaigns/:id')
  async updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    await this.metaAdsService.updateCampaign(id, dto)
    return { success: true }
  }

  /** Pausar campaña */
  @Patch('campaigns/:id/pause')
  async pauseCampaign(@Param('id') id: string) {
    await this.metaAdsService.pauseCampaign(id)
    return { success: true }
  }

  /** Reactivar campaña */
  @Patch('campaigns/:id/resume')
  async resumeCampaign(@Param('id') id: string) {
    await this.metaAdsService.resumeCampaign(id)
    return { success: true }
  }

  /** Eliminar campaña */
  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    await this.metaAdsService.deleteCampaign(id)
    return { success: true }
  }

  /** Ejecutar evaluación autónoma manualmente */
  @Post('evaluate')
  async evaluateCampaigns() {
    const decisions = await this.metaAdsService.evaluateAndActOnCampaigns()
    return { decisions }
  }

  /** Resumen de la cuenta publicitaria */
  @Get('account')
  async getAccountSummary() {
    return this.metaAdsService.getAccountSummary()
  }
}
