import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { addHours } from 'date-fns'
import { JwtService } from '@nestjs/jwt'
import { Email2FAService } from '../email-2fa/email-2fa.service'
import { MailService } from '../mail/mail.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'
import { resolveAccessTokenTtlSeconds } from './access-token-ttl'
import { RefreshTokenService } from './refresh-token.service'

@Injectable()
export class AuthService {
  private readonly accessTokenTtl = resolveAccessTokenTtlSeconds(
    process.env.ACCESS_TOKEN_TTL,
  )

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly email2FAService: Email2FAService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async login(
    email: string,
    password: string,
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  ) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas')
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales invalidas')
    }

    const suspiciousLogin = await this.isNewDevice(
      user.id,
      fingerprint,
      userAgent,
      ip,
    )

    if (suspiciousLogin) {
      const code = await this.email2FAService.create(user.id)

      try {
        await this.email2FAService.sendCode(user.email, code)
      } catch {
        throw new ServiceUnavailableException(
          'No se pudo enviar el codigo de verificacion. Intenta nuevamente.',
        )
      }

      return {
        requires2FA: true,
        userId: user.id,
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenTtl,
    })

    const refreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
      userAgent,
      ip,
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    }
  }

  async refresh(token: string, fingerprint: string) {
    const stored = await this.refreshTokenService.find(token)

    if (!stored) {
      throw new UnauthorizedException()
    }

    if (stored.expiresAt < new Date()) {
      await this.refreshTokenService.revoke(stored.token)
      throw new UnauthorizedException('Refresh token expirado')
    }

    if (stored.fingerprint !== fingerprint) {
      await this.refreshTokenService.revokeAll(stored.userId)
      throw new UnauthorizedException('Token comprometido')
    }

    await this.refreshTokenService.revoke(token)

    const user = await this.usersService.findById(stored.userId)
    if (!user) {
      throw new UnauthorizedException()
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: this.accessTokenTtl },
    )

    const newRefreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
    })

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
    }
  }

  private async isNewDevice(
    userId: number,
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  ): Promise<boolean> {
    const tokens = await this.refreshTokenService.findByUser(userId)
    const last = tokens?.[0]

    if (!last) return true

    return (
      last.fingerprint !== fingerprint ||
      last.userAgent !== userAgent ||
      last.ip !== ip
    )
  }

  async verify2FA(
    userId: number,
    code: string,
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  ) {
    const valid = await this.email2FAService.verify(userId, code)
    if (!valid) {
      throw new UnauthorizedException('Codigo invalido o expirado')
    }

    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException()
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: this.accessTokenTtl },
    )

    const refreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
      userAgent,
      ip,
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    }
  }

  async issueTokens(
    userId: number,
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  ) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException()

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: this.accessTokenTtl },
    )

    const refreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
      userAgent,
      ip,
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    }
  }

  async setPasswordWithToken(token: string, password: string) {
    const record = await this.prisma.passwordSetupToken.findUnique({
      where: { token },
    })

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token invalido o expirado')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    })

    await this.prisma.passwordSetupToken.update({
      where: { id: record.id },
      data: { used: true },
    })

    return { ok: true }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      return { ok: true }
    }

    const token = randomUUID()
    await this.prisma.passwordSetupToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: addHours(new Date(), 24),
      },
    })

    await this.mailService.sendAccountSetup(email, token)
    return { ok: true }
  }
}
