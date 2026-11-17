import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ClienteVehiculo,
  ClienteVehiculoSchema,
} from './cliente-vehiculo.schema';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema({ timestamps: true })
export class Cliente {
  @Prop({ required: true, maxLength: 75 })
  nombre!: string;

  @Prop({ required: true, name: 'apellido_p', maxLength: 50 })
  apellidoP!: string;

  @Prop({ required: false, name: 'apellido_m', maxLength: 50 })
  apellidoM?: string;

  @Prop({ required: true, unique: true, maxLength: 15 })
  telefono!: string;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({
    type: [ClienteVehiculoSchema],
    default: [],
  })
  vehiculos!: Types.DocumentArray<ClienteVehiculo>;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;

  @Virtual({
    get: function (this: Cliente) {
      return `${this.nombre} ${this.apellidoP} ${this.apellidoM ?? ''}`.trim();
    },
  })
  nombreCompleto?: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);

ClienteSchema.index({ _id: 1, 'vehiculos.placas': 1 });
