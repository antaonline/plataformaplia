import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { GoogleDashboardGuard } from './google-dashboard.guard'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RefreshTokenService } from './refresh-token.service'
import { Throttle } from '@nestjs/throttler'
import { generateFingerprint } from './fingerprint.util'
import { Email2FAService } from '../email-2fa/email-2fa.service'
import { Verify2FADto } from './dto/verify-2fa.dto'


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly email2FAService: Email2FAService,
  ) {}

  // v6: ttl en MILISEGUNDOS. 5 intentos por minuto por IP contra fuerza bruta.
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  async login(

    @Body() body: { email: string; password: string },
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {

    // SECURITY: NUNCA loguear body crudo — contiene password en texto plano
    // y queda persistido en los logs de PM2/CloudWatch/etc.
    const fingerprint = generateFingerprint(req);

    const result = await this.authService.login(
      body.email,
      body.password,
      fingerprint,
      req.headers['user-agent'],
      req.ip,
    );

    // ✅ CASO 2FA (OBLIGATORIO)
    if ('requires2FA' in result && result.requires2FA) {
      return {
        requires2FA: true,
        userId: result.userId,
      };
    }

    // ✅ SOLO SI YA HAY TOKENS
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false, // true en prod
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return {
      access_token: result.access_token,
    };
  }

  // Registro FREEMIUM sin pago (website_build). Crea cuenta + proyecto en prueba.
  // v6: ttl en MILISEGUNDOS. 5 cuentas cada 10 min por IP contra spam masivo.
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Post('register-free')
  async registerFree(
    @Body() body: { email: string; password: string; plan?: 'LANDING' | 'WEB' },
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fingerprint = generateFingerprint(req);
    const result = await this.authService.registerFree(
      body.email,
      body.password,
      body.plan === 'WEB' ? 'WEB' : 'LANDING',
      fingerprint,
      req.headers['user-agent'],
      req.ip,
    );
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { access_token: result.access_token, user: result.user };
  }

  @Throttle({
    default: {
      limit: 10,
      ttl: 300,
    },
  })
  @Post('refresh')
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token']

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token')
    }

    const fingerprint = generateFingerprint(req)

    const { access_token, refresh_token } =
      await this.authService.refresh(refreshToken, fingerprint)

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return { access_token }
  }

  @Post('logout')
  async logout(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refresh_token']

    if (token) {
      await this.refreshTokenService.revoke(token)
    }

    res.clearCookie('refresh_token', { path: '/auth/refresh' })
    return { message: 'Logged out' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async me(@Req() req) {
    const user = await this.authService.getUserProfile(req.user.id);
    return user;
  }

  @Get('sessions')
  async sessions(@Req() req) {
    return this.refreshTokenService.findByUser(req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/revoke')
  async revokeSession(
    @Req() req,
    @Param('id') id: string,
  ) {
    await this.refreshTokenService.revokeById(
      Number(id),
      req.user.sub,
    )
    return { message: 'Sesión cerrada' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  async revokeAll(@Req() req) {
    await this.refreshTokenService.revokeAll(req.user.sub)
    return { message: 'Todas las sesiones cerradas' }
  }

  @Post('verify-2fa')
  async verify2FA(
    @Req() req,
    @Body() body: Verify2FADto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const valid = await this.email2FAService.verify(
      body.userId,
      body.code
    )

    if (!valid) {
      throw new UnauthorizedException('Código inválido')
    }

    const fingerprint = generateFingerprint(req)

    const { access_token, refresh_token } =
    await this.authService.issueTokens(
      body.userId,
      fingerprint,
      req.headers['user-agent'],
      req.ip,
    )

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false, // true en prod
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return {
      access_token,
    }
  }

  @Post('set-password')
  async setPassword(@Body() body: { token: string; password: string }) {
    return this.authService.setPasswordWithToken(body.token, body.password)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email)
  }

  // Inicio Google para iachat (sin state).
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  // Inicio Google para el dashboard website_build (state=dashboard).
  @Get('google/dashboard')
  @UseGuards(GoogleDashboardGuard)
  async googleAuthDashboard(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.validateGoogleUser(req.user);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    // Redirige según el origen: dashboard (website_build) o iachat.
    const dest =
      (result as any).flow === 'dashboard'
        ? `${frontendUrl}/login?token=${result.access_token}`
        : `${frontendUrl}/experimental/iachatweb?token=${result.access_token}`;
    return res.redirect(dest);
  }
}
