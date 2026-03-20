import { Injectable } from '@nestjs/common'
import { randomInt } from 'crypto'
import { MailService } from '../mail/mail.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class Email2FAService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(userId: number): Promise<string> {
    const code = randomInt(100000, 999999).toString()

    console.log('2FA CODE GENERATED:', code)

    await this.prisma.email2FACode.create({
      data: {
        userId,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
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
    await this.mailService.send2FACode(email, code)
  }
}
