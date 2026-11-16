import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenDenylistPort } from 'src/auth/interfaces/token-ports';
import { ExpiredToken } from 'src/auth/schema/expired-token.scehema';
import { Model } from 'mongoose';

@Injectable()
export class DenylistService implements TokenDenylistPort {
  constructor(
    @InjectModel(ExpiredToken.name)
    private readonly expiredTokenModel: Model<ExpiredToken>,
  ) {}

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    if (expiresAt.getTime() <= Date.now()) return;

    await this.expiredTokenModel.updateOne(
      { jti },
      {
        $set: { expiresAt },
        $setOnInsert: { jti },
      },
      { upsert: true },
    );
  }

  async isRevoked(jti: string): Promise<boolean> {
    const token = await this.expiredTokenModel.exists({
      jti,
      expiresAt: { $gt: new Date() },
    });

    return Boolean(token);
  }
}
