import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class PublishProjectsCron {
  constructor(private projectsService: ProjectsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handle() {
    await this.projectsService.autoPublishReadyProjects();
  }
}
