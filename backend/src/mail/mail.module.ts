import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  providers: [MailService],
  exports: [MailService], // 👈 CLAVE para usarlo desde Auth
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: Number(config.get('MAIL_PORT')),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"PLIA" <${config.get('MAIL_USER')}>`,
        },
      }),
    }),
  ],
})
export class MailModule {}

