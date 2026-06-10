import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

/**
 * Cron del freemium: procesa las webs en prueba (avisos día 20/27, suspensión
 * día 30, limpieza de backups a los 90 días). Corre una vez al día.
 */
@Injectable()
export class TrialCron {
  private readonly logger = new Logger(TrialCron.name);
  constructor(private projectsService: ProjectsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'process-trials' })
  async handle() {
    this.logger.log('Procesando webs freemium en prueba...');
    try {
      await this.projectsService.processTrials();
    } catch (e: any) {
      this.logger.error(`processTrials fallo: ${e?.message}`);
    }
  }
}
