import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './jwt.strategy'
import { RefreshTokenService } from './refresh-token.service'
import { PrismaModule } from '../prisma/prisma.module'
import { Email2FAModule } from '../email-2fa/email-2fa.module'

import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    Email2FAModule,

    MailModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenService,], // 👈 ESTO ES OBLIGATORIO
  controllers: [AuthController],
  exports: [JwtModule],

})

export class AuthModule {}
