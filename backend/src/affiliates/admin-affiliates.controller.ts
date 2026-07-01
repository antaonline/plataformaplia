import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { AffiliatesService } from './affiliates.service'

@Controller('admin/affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAffiliatesController {
  constructor(private readonly affiliates: AffiliatesService) {}

  @Get('stats')
  stats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.affiliates.adminStats(from, to)
  }

  @Get('list')
  list() {
    return this.affiliates.adminListAffiliates()
  }

  @Get('conversions')
  conversions(@Query('from') from?: string, @Query('to') to?: string) {
    return this.affiliates.adminListConversions(from, to)
  }

  @Get('payouts')
  payouts(@Query('status') status?: string) {
    return this.affiliates.adminListPayouts(status)
  }

  @Post('payouts/:id/pay')
  pay(@Param('id', ParseIntPipe) id: number, @Body('reference') reference?: string) {
    return this.affiliates.adminPayPayout(id, reference)
  }

  @Post('payouts/:id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.affiliates.adminRejectPayout(id)
  }
}
