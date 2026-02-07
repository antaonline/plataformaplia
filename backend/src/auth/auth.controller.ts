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
import type { Response } from 'express'
import { AuthService } from './auth.service'
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

  @Throttle({
    default: {
      limit: 5,
      ttl: 60,
    },
  })
  
  @Post('login')
  async login(

    @Body() body: { email: string; password: string },
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {

    console.log('RAW BODY:', body); // 👈 AQUÍ
    
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
  me(@Req() req) {
    return req.user
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

}
