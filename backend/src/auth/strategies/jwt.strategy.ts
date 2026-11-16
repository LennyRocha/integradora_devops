import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenClaims } from '../interfaces/access-token-claims';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import {
  TOKEN_DENYLIST,
  type TokenDenylistPort,
} from '../interfaces/token-ports';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly service: UsuariosService,
    @Inject(TOKEN_DENYLIST) private readonly denylist: TokenDenylistPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(process.env.JWT_PUBLIC_KEY!, 'base64').toString(
        'utf8',
      ),
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'taller-api',
      audience: process.env.JWT_AUDIENCE || 'taller-client',
    });
  }

  async validate(payload: AccessTokenClaims) {
    const revoked = await this.denylist.isRevoked(payload.jti);

    if (revoked) {
      throw new UnauthorizedException('Token revocado');
    }
    const isActive = await this.service.isUserActive(payload.sub);
    if (!isActive) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }
    return payload;
  }
}
