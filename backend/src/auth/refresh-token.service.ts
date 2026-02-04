import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { randomUUID } from 'crypto'
import { addDays } from 'date-fns'

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: number,
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  }) {

    const token = randomUUID()

    return this.prisma.refreshToken.create({ 

      data: {
        token,
        userId: data.userId,
        fingerprint: data.fingerprint,
        userAgent: data.userAgent,
        ip: data.ip,
        expiresAt: addDays(new Date(), 7),
      },

    })
  }

  async find(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    })
  }

  async revoke(token: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    })
  }

  async revokeAll(userId: number) {
    return this.prisma.refreshToken.deleteMany({
      where: { userId },
    })
  }

  async rotate(oldToken: string, fingerprint: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: oldToken },
    })

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido')
    }

    await this.prisma.refreshToken.delete({
      where: { token: oldToken },
    })

    return this.create({
      userId: stored.userId,
      fingerprint,
    })
  }

  async findByUser(userId: number) {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })
  }

  async revokeById(id: number, userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        id,
        userId,
      },
    })
  }


}
