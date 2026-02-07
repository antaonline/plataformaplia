import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AdminProjectsController } from './admin-projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController, AdminProjectsController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService], // ✅ CLAVE
})
export class ProjectsModule {}
