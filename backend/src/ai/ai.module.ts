import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { WebsiteGenService } from './website-gen.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NextExportModule } from '../integrations/next-export/next-export.module';

@Module({
  imports: [PrismaModule, NextExportModule],
  providers: [AiService, WebsiteGenService],
  exports: [AiService],
})
export class AiModule {}
