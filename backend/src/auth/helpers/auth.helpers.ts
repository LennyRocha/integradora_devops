import { createHash, randomBytes } from 'node:crypto';

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newOpaqueToken(): string {
  return randomBytes(48).toString('base64url');
}
