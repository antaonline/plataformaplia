import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { randomInt } from 'crypto'
import { MailService } from '../mail/mail.service'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class Email2FAService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    ) {}

  async create(userId: number): Promise<string> {
    const code = randomInt(100000, 999999).toString()

    console.log('📩 2FA CODE:', code)

    await this.prisma.email2FACode.create({
      data: {
        userId,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    })
    return code
  }

  async verify(userId: number, code: string): Promise<boolean> {
    const record = await this.prisma.email2FACode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!record) return false

    await this.prisma.email2FACode.update({
      where: { id: record.id },
      data: { used: true },
    })

    return true
  }

  async sendCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${code}`,
    })
  }

 

}
