import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role, // 👈 ESTO ES OBLIGATORIO
      /*user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      token: {
        iat: payload.iat,
        exp: payload.exp,
      },*/
    }
  }
}

