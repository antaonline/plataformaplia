import { Module } from '@nestjs/common'
import { MailModule } from '../mail/mail.module'
import { Email2FAService } from './email-2fa.service'

@Module({
  imports: [MailModule],
  providers: [Email2FAService],
  exports: [Email2FAService],
})
export class Email2FAModule {}
