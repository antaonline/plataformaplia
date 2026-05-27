import { Module, forwardRef } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CyberpanelModule } from '../integrations/cyberpanel/cyberpanel.module';
import { MailModule } from '../mail/mail.module';
import { PaymentsModule } from '../payments/payments.module';
import { BackupsAgenciaCron } from '../cron/backups-agencia.cron';
import { HostingController } from './hosting.controller';
import { HostingService } from './hosting.service';

@Module({
  imports: [PrismaModule, CyberpanelModule, MailModule, forwardRef(() => PaymentsModule)],
  controllers: [HostingController],
  providers: [HostingService, BackupsAgenciaCron],
  exports: [HostingService],
})
export class HostingModule {}
