import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VehiculoDocument = HydratedDocument<Vehiculo>;

@Schema({ timestamps: true })
export class Vehiculo {
  @Prop({ required: true, maxLength: 25 })
  marca!: string;

  @Prop({ required: true, maxLength: 25 })
  modelo!: string;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({
    required: true,
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  })
  ano: number = new Date().getFullYear();

  @Prop({ type: Types.ObjectId, ref: 'TipoVehiculo', name: 'tipo' })
  tipo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const VehiculoSchema = SchemaFactory.createForClass(Vehiculo);
