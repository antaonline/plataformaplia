import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { createHash } from 'crypto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AffiliatesService } from './affiliates.service'
import { UpdatePayoutMethodDto } from './dto/update-payout-method.dto'
import { TrackReferralDto } from './dto/track-referral.dto'

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliates: AffiliatesService) {}

  // Panel del afiliado: código, saldos, conversiones, bolita de notificaciones.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.affiliates.getDashboard(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Put('payout-method')
  updatePayoutMethod(@Req() req: any, @Body() dto: UpdatePayoutMethodDto) {
    return this.affiliates.updatePayoutMethod(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('commissions')
  commissions(@Req() req: any) {
    return this.affiliates.listCommissions(req.user.id)
  }

  // Marca las comisiones como leídas → resetea la bolita de notificaciones.
  @UseGuards(JwtAuthGuard)
  @Post('commissions/mark-read')
  markRead(@Req() req: any) {
    return this.affiliates.markCommissionsRead(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('payouts')
  payouts(@Req() req: any) {
    return this.affiliates.listPayouts(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('payouts')
  requestPayout(@Req() req: any) {
    return this.affiliates.requestPayout(req.user.id)
  }

  // Público: registra un click de referido (lo llama el middleware del front).
  @Post('track')
  track(@Req() req: any, @Body() dto: TrackReferralDto) {
    const xffRaw = req.headers['x-forwarded-for']
    const xff = Array.isArray(xffRaw) ? xffRaw[0] : xffRaw
    const ip = ((xff || '').split(',')[0] || req.ip || '').trim()
    const ipHash = ip
      ? createHash('sha256').update(ip).digest('hex').slice(0, 32)
      : undefined
    const userAgent = req.headers['user-agent']
    return this.affiliates.trackReferral(dto, { ipHash, userAgent })
  }
}
