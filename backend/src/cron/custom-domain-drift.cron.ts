import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CyberpanelService } from '../integrations/cyberpanel/cyberpanel.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Cron mensual de verificación de drift de vhAlias.
 *
 * Caso de uso: el script attachCustomDomain edita directamente
 * `httpd_config.conf` y los `vhost.conf` para agregar vhAliases. Esos
 * archivos los gestiona LiteSpeed pero CyberPanel los puede re-escribir
 * en updates (por ejemplo cuando se agrega un sitio nuevo). Si eso pasa,
 * los aliases se pierden silenciosamente y el dominio del cliente deja
 * de responder.
 *
 * Este cron corre el día 1 de cada mes a las 3 AM y verifica:
 *  - Cada proyecto con customDomain en DB.
 *  - Que su vhost.conf siga teniendo el vhAlias correspondiente.
 *  - Que httpd_config.conf siga teniendo los mappings del listener.
 *  - Si falta alguno, lo re-ejecuta el script attachAliasDomain idempotente.
 *
 * Idempotencia: el script attach es idempotente, así que re-ejecutarlo
 * cuando ya está bien no rompe nada.
 */
@Injectable()
export class CustomDomainDriftCron {
  private readonly logger = new Logger(CustomDomainDriftCron.name);
  private readonly vhostsDir =
    process.env.LSWS_VHOSTS_DIR || '/usr/local/lsws/conf/vhosts';
  private readonly httpdConfPath =
    process.env.LSWS_HTTPD_CONF ||
    '/usr/local/lsws/conf/httpd_config.conf';

  constructor(
    private prisma: PrismaService,
    private cyberpanel: CyberpanelService,
  ) {}

  // Dia 1 de cada mes, 3 AM (zona horaria del server)
  @Cron('0 3 1 * *', { name: 'custom-domain-drift' })
  async handle() {
    this.logger.log('Iniciando verificación de drift de custom domains...');

    // Buscar todos los proyectos con customDomain no nulo
    const projects = await (this.prisma as any).project.findMany({
      where: { customDomain: { not: null } },
      select: {
        id: true,
        customDomain: true,
        onboardingData: true,
      },
    });

    if (!projects.length) {
      this.logger.log('No hay proyectos con customDomain. Nada que verificar.');
      return;
    }

    let okCount = 0;
    let driftCount = 0;
    let fixedCount = 0;
    let errorCount = 0;

    for (const project of projects) {
      try {
        const subdomain = this.extractSubdomain(project.onboardingData);
        if (!subdomain) {
          this.logger.warn(
            `project=${project.id} customDomain=${project.customDomain} sin subdomain identificable. Skip.`,
          );
          continue;
        }

        const vhostMissing = !this.vhostHasAlias(subdomain, project.customDomain);
        const listenerMissing = !this.httpdHasMapping(
          project.customDomain,
          subdomain,
        );

        if (!vhostMissing && !listenerMissing) {
          okCount += 1;
          continue;
        }

        driftCount += 1;
        this.logger.warn(
          `DRIFT detectado project=${project.id} subdomain=${subdomain} alias=${project.customDomain} vhostMissing=${vhostMissing} listenerMissing=${listenerMissing}. Re-aplicando...`,
        );

        try {
          await this.cyberpanel.attachAliasDomain(
            subdomain,
            project.customDomain,
          );
          fixedCount += 1;
          this.logger.log(
            `Drift corregido project=${project.id} ${subdomain} → ${project.customDomain}`,
          );
        } catch (err: any) {
          errorCount += 1;
          this.logger.error(
            `Drift NO se pudo corregir project=${project.id}: ${err?.message || err}`,
          );
        }
      } catch (err: any) {
        errorCount += 1;
        this.logger.error(
          `Fallo verificando project=${project.id}: ${err?.message || err}`,
        );
      }
    }

    this.logger.log(
      `Verificación drift terminada: total=${projects.length} ok=${okCount} drift=${driftCount} fixed=${fixedCount} errores=${errorCount}`,
    );
  }

  private extractSubdomain(onboardingData: string | null): string | null {
    try {
      const data = JSON.parse(onboardingData || '{}');
      const raw = data?.publicDomain;
      if (typeof raw === 'string' && raw.toLowerCase().endsWith('.plia.pe')) {
        return raw.toLowerCase();
      }
      if (data?.subdomain) {
        const base = process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe';
        return `${data.subdomain}.${base}`.toLowerCase();
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private vhostHasAlias(subdomain: string, alias: string): boolean {
    const vhostPath = path.join(this.vhostsDir, subdomain, 'vhost.conf');
    if (!fs.existsSync(vhostPath)) return false;
    try {
      const content = fs.readFileSync(vhostPath, 'utf-8');
      // Busca línea vhAliases que contenga el alias (palabra completa)
      const re = new RegExp(
        `^\\s*vhAliases\\s+.*\\b${alias.replace(/\./g, '\\.')}\\b`,
        'm',
      );
      return re.test(content);
    } catch {
      return false;
    }
  }

  private httpdHasMapping(alias: string, target: string): boolean {
    if (!fs.existsSync(this.httpdConfPath)) return false;
    try {
      const content = fs.readFileSync(this.httpdConfPath, 'utf-8');
      const re = new RegExp(
        `^\\s*map\\s+${alias.replace(/\./g, '\\.')}\\s+${target.replace(/\./g, '\\.')}`,
        'm',
      );
      return re.test(content);
    } catch {
      return false;
    }
  }
}
