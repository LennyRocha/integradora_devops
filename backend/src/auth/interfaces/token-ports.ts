import { AccessTokenClaims } from './access-token-claims';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_SIGNER = Symbol('TOKEN_SIGNER');
export const TOKEN_DENYLIST = Symbol('TOKEN_DENYLIST');

export interface TokenSignerPort {
  signAccess(payload: {
    tid: string;
    sub: string;
    email: string;
    rol: string;
  }): Promise<string>;
  verifyAccess(token: string): Promise<AccessTokenClaims & { exp: number }>;
}

export interface PasswordHasherPort {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

export interface TokenDenylistPort {
  revoke(jti: string, expiresAt: Date): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
}
