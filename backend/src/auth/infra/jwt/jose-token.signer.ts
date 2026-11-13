import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignJWT, importPKCS8, jwtVerify } from 'jose';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { TokenSignerPort } from 'src/auth/interfaces/token-ports';

@Injectable()
export class JoseTokenSigner implements TokenSignerPort {
  private readonly algorithm = 'RS256';
  private readonly issuer = process.env.JWT_ISSUER || 'taller-api';
  private readonly audience = process.env.JWT_AUDIENCE || 'taller-client';

  async signAccess(payload: {
    sub: string;
    tid: string;
    email: string;
    role: string;
  }): Promise<string> {
    const privateKey = Buffer.from(
      process.env.JWT_PRIVATE_KEY!,
      'base64',
    ).toString('utf8');

    if (!privateKey) {
      throw new UnauthorizedException('JWT_PRIVATE_KEY no está configurada');
    }

    const key = await importPKCS8(privateKey, this.algorithm);

    return new SignJWT({
      tid: payload.tid,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: this.algorithm })
      .setSubject(payload.sub)
      .setJti(crypto.randomUUID())
      .setIssuedAt()
      .setExpirationTime('15m')
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .sign(key);
  }

  async verifyAccess(
    token: string,
  ): Promise<AccessTokenClaims & { exp: number }> {
    const publicKey = Buffer.from(
      process.env.JWT_PUBLIC_KEY!,
      'base64',
    ).toString('utf8');

    if (!publicKey) {
      throw new UnauthorizedException('JWT_PUBLIC_KEY no está configurada');
    }

    const key = await importPKCS8(publicKey, this.algorithm);
    const { payload } = await jwtVerify(token, key, {
      algorithms: [this.algorithm],
      issuer: this.issuer,
      audience: this.audience,
    });
    if (
      !payload.sub ||
      !payload.jti ||
      !payload.exp ||
      typeof payload.tid !== 'string' ||
      typeof payload.email !== 'string' ||
      !Array.isArray(payload.roles) ||
      !Array.isArray(payload.privileges)
    ) {
      throw new UnauthorizedException('JWT sin claims de acceso requeridos');
    }
    return {
      sub: payload.sub,
      tid: payload.tid,
      email: payload.email,
      rol: payload.roles[0] as string,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
