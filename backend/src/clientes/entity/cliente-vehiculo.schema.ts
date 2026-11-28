import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClienteVehiculoDocument = HydratedDocument<ClienteVehiculo>;

@Schema({ timestamps: true })
export class ClienteVehiculo {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Vehiculo',
    required: true,
    name: 'vehiculo',
  })
  vehiculo!: Types.ObjectId;

  @Prop({ required: true, maxLength: 15 })
  placas!: string;

  @Prop({ required: true, maxLength: 20 })
  color!: string;

  @Prop({ required: true, name: 'detalles_referencia', maxLength: 50 })
  detallesReferencia!: string;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const ClienteVehiculoSchema =
  SchemaFactory.createForClass(ClienteVehiculo);
