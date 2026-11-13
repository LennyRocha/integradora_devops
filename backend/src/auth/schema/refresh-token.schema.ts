import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({
    required: true,
    unique: true,
    maxlength: 64,
  })
  tokenHash!: string;

  @Prop({
    required: true,
    maxlength: 36,
    index: true,
  })
  sessionId!: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  })
  usuario!: Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
  })
  expiresAt!: Date;

  @Prop({
    type: Date,
    default: null,
  })
  revokedAt?: Date | null;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
