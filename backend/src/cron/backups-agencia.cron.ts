import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

import { HostingService } from '../hosting/hosting.service';

@Injectable()
export class BackupsAgenciaCron {
  private readonly logger = new Logger(BackupsAgenciaCron.name);

  constructor(private hostingService: HostingService) {}

  // Dia 1 de cada mes a las 3 AM
  @Cron('0 3 1 * *')
  async runMonthly() {
    try {
      this.logger.log('Ejecutando backups mensuales para cuentas Agencia');
      const result = await this.hostingService.runMonthlyBackupsForAgencia();
      this.logger.log(
        `Backups mensuales terminados: ok=${result.success} fail=${result.failed}`,
      );
    } catch (error: any) {
      this.logger.error(
        `BackupsAgenciaCron fallo: ${error?.message || error}`,
      );
    }
  }
}
