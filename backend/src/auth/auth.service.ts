import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenService } from './refresh-token.service'
import { Email2FAService } from '../email-2fa/email-2fa.service'
import { MailService } from '../mail/mail.service'
import { PrismaService } from '../prisma/prisma.service'

import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
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
    
      console.log('🔥 AUTH.LOGIN EJECUTADO')

        const user = await this.usersService.findByEmail(email)
        if (!user) {
          throw new UnauthorizedException('Credenciales inválidas')
        }

        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
          throw new UnauthorizedException('Credenciales inválidas')
        }

        const safeUser = user

        // 🔍 Verificamos si es login sospechoso
        const suspiciousLogin = await this.isNewDevice(
          safeUser.id,
          fingerprint,
          userAgent,
          ip,
        )

        // 🔐 SI ES SOSPECHOSO → 2FA Y SE CORTA EL LOGIN
        if (suspiciousLogin) {
          const code = await this.email2FAService.create(safeUser.id)
          console.log('📩 2FA CODE:', code)

          try {
            await this.mailService.send2FACode(safeUser.email, code)
          } catch (error) {
            console.error('❌ ERROR ENVIANDO MAIL 2FA:', error.message)
          }

          return {
            requires2FA: true,
            userId: safeUser.id,
          }
        }

        // ✅ LOGIN NORMAL (SIN 2FA)
        const payload = {
          sub: safeUser.id,
          email: safeUser.email,
          role: safeUser.role,
        }

        const accessToken = this.jwtService.sign(payload, {
          expiresIn: '15m',
        })

        const refreshToken = await this.refreshTokenService.create({
          userId: safeUser.id,
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
      // 🚨 TOKEN ROBADO
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
      },
      { expiresIn: '15m' },
    );

    const newRefreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
    });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
    }
  }


  // 👇 AQUÍ EMPIEZA
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
    const valid = await this.email2FAService.verify(userId, code);
    if (!valid) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
      userAgent,
      ip,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    };
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
      },
      { expiresIn: '15m' },
    );

    const refreshToken = await this.refreshTokenService.create({
      userId: user.id,
      fingerprint,
      userAgent,
      ip,
    });

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
      throw new UnauthorizedException('Token inválido o expirado')
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
 

}
