import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { WebsiteGenService } from './website-gen.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NextExportModule } from '../integrations/next-export/next-export.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, NextExportModule, MailModule],
  providers: [AiService, WebsiteGenService],
  exports: [AiService],
})
export class AiModule {}
