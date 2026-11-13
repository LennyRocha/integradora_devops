/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenClaims } from '../interfaces/access-token-claims';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_PUBLIC_KEY!,
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'taller-api',
      audience: process.env.JWT_AUDIENCE || 'taller-client',
    });
  }

  async validate(payload: AccessTokenClaims) {
    return payload;
  }
}
