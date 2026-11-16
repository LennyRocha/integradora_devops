import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TipoVehiculoDocument = HydratedDocument<TipoVehiculo>;

@Schema({ timestamps: true })
export class TipoVehiculo {
  @Prop({ required: true, maxLength: 25, unique: true })
  tipo!: string;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const TipoVehiculoSchema = SchemaFactory.createForClass(TipoVehiculo);
