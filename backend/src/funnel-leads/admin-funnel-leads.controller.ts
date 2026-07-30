import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FunnelLeadsService } from './funnel-leads.service';

/**
 * Listado de leads del embudo para el panel de admin. Solo ADMIN.
 */
@Controller('admin/funnel-leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminFunnelLeadsController {
  constructor(private readonly svc: FunnelLeadsService) {}

  @Get()
  list(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('outcome') outcome?: string,
    @Query('source') source?: string,
  ) {
    return this.svc.listForAdmin({ from, to, outcome, source });
  }
}
