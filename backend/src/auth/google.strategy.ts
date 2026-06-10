import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'PENDIENTE',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PENDIENTE',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3002/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    // El "state" indica el origen: 'dashboard' (website_build) o vacío (iachat).
    const flow = (req?.query?.state as string) || '';
    const user = {
      email: emails[0].value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      accessToken,
      flow,
    };
    done(null, user);
  }
}
