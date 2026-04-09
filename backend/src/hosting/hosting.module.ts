import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CyberpanelModule } from '../integrations/cyberpanel/cyberpanel.module';
import { MailModule } from '../mail/mail.module';
import { HostingController } from './hosting.controller';
import { HostingService } from './hosting.service';

@Module({
  imports: [PrismaModule, CyberpanelModule, MailModule],
  controllers: [HostingController],
  providers: [HostingService],
  exports: [HostingService],
})
export class HostingModule {}
