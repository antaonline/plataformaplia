import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AdminProjectsController } from './admin-projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';
import { CyberpanelModule } from '../integrations/cyberpanel/cyberpanel.module';
import { NextExportModule } from '../integrations/next-export/next-export.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AiModule, CyberpanelModule, NextExportModule, MailModule],
  controllers: [ProjectsController, AdminProjectsController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService], // ✅ CLAVE
})
export class ProjectsModule {}
