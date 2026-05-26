import { Module } from '@nestjs/common';
import { SiteContactController } from './site-contact.controller';
import { SiteContactService } from './site-contact.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [SiteContactController],
  providers: [SiteContactService],
})
export class SiteContactModule {}
