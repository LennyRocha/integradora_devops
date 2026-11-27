import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServicioDocument = HydratedDocument<Servicio>;

@Schema({ timestamps: true })
export class Servicio {
  @Prop({ required: true, maxLength: 50 })
  nombre!: string;

  @Prop({ required: true, maxLength: 100 })
  descripcion!: string;

  @Prop({ required: true, type: Types.Decimal128, max: 999999.99 })
  costo!: Types.Decimal128;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const ServicioSchema = SchemaFactory.createForClass(Servicio);
