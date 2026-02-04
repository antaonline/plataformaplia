import { Module } from '@nestjs/common'
import { Email2FAService } from './email-2fa.service'

@Module({
  providers: [Email2FAService],
  exports: [Email2FAService], // 🔥 CLAVE
})
export class Email2FAModule {}
