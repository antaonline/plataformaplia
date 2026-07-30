import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { FunnelLeadsService } from './funnel-leads.service';
import { CreateFunnelLeadDto } from './dto/create-funnel-lead.dto';

/**
 * Endpoint público que recibe cada submission del embudo /tu-web-hoy.
 * Lo llama el navegador directo (fire-and-forget) en el punto de decisión.
 */
@Controller('funnel-leads')
export class FunnelLeadsController {
  constructor(private readonly svc: FunnelLeadsService) {}

  // Anti-abuso: máx. 20 submissions por IP cada 10 minutos.
  @Throttle({ default: { limit: 20, ttl: 600 } })
  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateFunnelLeadDto, @Req() req: Request) {
    const xff = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    const ip = xff || req.ip || '';
    const ipHash = ip
      ? createHash('sha256').update(ip).digest('hex').slice(0, 32)
      : undefined;
    const userAgent = req.headers['user-agent'] as string | undefined;
    return this.svc.create(dto, ipHash, userAgent);
  }
}
