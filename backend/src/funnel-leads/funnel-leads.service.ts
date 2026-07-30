import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFunnelLeadDto } from './dto/create-funnel-lead.dto';

/**
 * Guarda y lista los leads del embudo /tu-web-hoy. Usa (prisma as any) para el
 * modelo FunnelLead porque el cliente Prisma local puede no estar regenerado
 * (se regenera en el deploy del VPS); en runtime el modelo existe.
 */
@Injectable()
export class FunnelLeadsService {
  private readonly logger = new Logger(FunnelLeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateFunnelLeadDto,
    ipHash?: string,
    userAgent?: string,
  ): Promise<{ ok: true }> {
    // Honeypot: si el campo invisible viene con valor, es un bot. Devolvemos
    // ok en silencio (no le damos pistas) y no guardamos nada.
    if (dto._honeypot && dto._honeypot.trim().length > 0) {
      this.logger.warn('funnel-lead honeypot descartado');
      return { ok: true };
    }

    const trim = (v: string | undefined, n = 191): string | null =>
      typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null;

    try {
      await (this.prisma as any).funnelLead.create({
        data: {
          businessName: trim(dto.businessName, 500),
          contactName: trim(dto.contactName, 200),
          whatsapp: trim(dto.whatsapp, 60),
          email: trim(dto.email, 320),
          outcome: dto.outcome === 'NOAPTO' ? 'NOAPTO' : 'APTO',
          disqualifier: trim(dto.disqualifier, 80),
          answers: JSON.stringify(dto.answers ?? {}),
          utmSource: trim(dto.utmSource),
          utmMedium: trim(dto.utmMedium),
          utmCampaign: trim(dto.utmCampaign),
          fbclid: trim(dto.fbclid, 2000),
          referrer: trim(dto.referrer, 2000),
          landingPath: trim(dto.landingPath, 500),
          ipHash: ipHash ?? null,
          userAgent: userAgent ? userAgent.slice(0, 2000) : null,
        },
      });
    } catch (err: any) {
      // Nunca romper la experiencia del embudo por un fallo al guardar.
      this.logger.error(`No se pudo guardar el funnel-lead: ${err?.message}`);
    }
    return { ok: true };
  }

  async listForAdmin(filters: {
    from?: string;
    to?: string;
    outcome?: string;
    source?: string;
  }): Promise<any[]> {
    const where: any = {};
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }
    if (filters.outcome === 'APTO' || filters.outcome === 'NOAPTO') {
      where.outcome = filters.outcome;
    }
    // Origen Facebook: fbclid presente (clic de anuncio) o utm_source de Meta.
    if (filters.source === 'facebook') {
      where.OR = [
        { fbclid: { not: null } },
        { utmSource: { contains: 'facebook' } },
        { utmSource: { contains: 'fb' } },
        { utmSource: { contains: 'ig' } },
      ];
    }

    const rows = await (this.prisma as any).funnelLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    return rows.map((r: any) => ({
      ...r,
      answers: (() => {
        try {
          return JSON.parse(r.answers || '{}');
        } catch {
          return {};
        }
      })(),
    }));
  }
}
