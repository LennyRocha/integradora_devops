import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { type MongoImage } from 'src/utils/mongo.image';
import { MongoImageSchema } from 'src/utils/mongo.image.schema';
import FotoTipo from './foto-tipo';

@Schema({ _id: false })
export class FotoExpediente {
  @Prop({ type: MongoImageSchema, required: true })
  imagen!: MongoImage;

  @Prop({ required: true, enum: FotoTipo })
  tipo!: FotoTipo;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  uploadedBy!: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha!: Date;
}

export const FotoExpedienteSchema =
  SchemaFactory.createForClass(FotoExpediente);
