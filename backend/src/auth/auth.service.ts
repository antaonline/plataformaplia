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

  /**
   * Registro FREEMIUM sin pago (solo website_build: landing / web institucional).
   * Crea el usuario + una orden gratuita (plan plia-free) + un proyecto en modo
   * prueba (isTrial). Devuelve tokens para auto-login. El trialEndsAt se fija al
   * publicar la web (no aquí), para que los 30 días cuenten desde la publicación.
   */
  async registerFree(
    email: string,
    password: string,
    plan: 'LANDING' | 'WEB',
    fingerprint: string,
    userAgent?: string,
    ip?: string,
  ) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      throw new UnauthorizedException('Email inválido.');
    }
    if (!password || password.length < 6) {
      throw new UnauthorizedException('La contraseña debe tener al menos 6 caracteres.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new UnauthorizedException('Ya existe una cuenta con este correo. Inicia sesión.');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: cleanEmail, password: hashed, name: cleanEmail.split('@')[0], role: 'USER' as any },
    });

    // Plan freemium (creado por la migración). Si no existe, fallback al primero.
    const freePlan =
      (await this.prisma.plan.findFirst({ where: { slug: 'plia-free' } })) ??
      (await this.prisma.plan.findFirst({ where: { serviceType: 'WEBSITE_BUILD' as any } }));
    if (!freePlan) throw new ServiceUnavailableException('No hay plan gratuito configurado.');

    // Orden gratuita (amount 0) para satisfacer la relación project→order.
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        amount: 0,
        currency: 'PEN',
        status: 'PAID' as any,
        metadata: JSON.stringify({ _freemium: true }),
      },
    });

    // Proyecto en modo prueba. trialEndsAt se fija al publicar.
    await this.prisma.project.create({
      data: {
        name: `Proyecto ${order.id}`,
        type: plan,
        status: 'WAITING_INFO' as any,
        isTrial: true,
        trialStatus: 'active',
        user: { connect: { id: user.id } },
        order: { connect: { id: order.id } },
      },
    });

    const tokens = await this.issueTokens(user.id, fingerprint, userAgent, ip);
    return { ...tokens, user: { id: user.id, email: user.email, name: user.name } };
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

  async getUserProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        billingName: true,
        billingAddress: true,
        billingDepartment: true,
        billingEmail: true,
      },
    });
  }

  async validateGoogleUser(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // Crear usuario si no existe
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          password: '', // Sin password para usuarios Google
          role: 'USER',
        },
      });
    }

    // Emitir tokens (fingeprint genérico para OAuth)
    return this.issueTokens(user.id, 'google-oauth-flow');
  }
}
