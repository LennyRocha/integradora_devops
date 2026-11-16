import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpiredTokenDocument = HydratedDocument<ExpiredToken>;

@Schema({ timestamps: true })
export class ExpiredToken {
  @Prop({ required: true, unique: true })
  jti!: string;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const ExpiredTokenSchema = SchemaFactory.createForClass(ExpiredToken);

ExpiredTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
