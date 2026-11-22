import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Refaccion,
  RefaccionSchema,
} from 'src/refacciones/entity/refaccion.schema';
import { Servicio, ServicioSchema } from 'src/servicios/entity/servicio.schema';
import OrdenEstado from './orden-estado';
import { FotoExpediente, FotoExpedienteSchema } from './foto-expediente.schema';

export type OrdenDocument = HydratedDocument<Orden>;

@Schema({ timestamps: true })
export class Orden {
  @Prop({ required: true, maxLength: 100, name: 'razon_servicio' })
  razonServicio!: string;

  @Prop({
    type: [FotoExpedienteSchema],
    default: [],
    name: 'fotos_expediente',
  })
  fotosExpediente!: Types.DocumentArray<FotoExpediente>; //Agregar máximo 4 en el DTO

  @Prop({
    required: false,
    name: 'refacciones',
    type: [RefaccionSchema],
    default: [],
  })
  refacciones!: Types.DocumentArray<Refaccion>; //Agregar máximo 25 en el DTO

  @Prop({
    required: false,
    name: 'servicios',
    type: [ServicioSchema],
    default: [],
  })
  servicios!: Types.DocumentArray<Servicio>; //Agregar máximo 25 en el DTO

  @Prop({ required: true, type: Types.Decimal128, max: 999999.99 })
  subtotal!: Types.Decimal128;

  @Prop({ required: false, type: Date, name: 'fecha_entrega' })
  fechaEntrega?: Date;

  @Prop({
    required: true,
    unique: true,
    name: 'qr_token',
    type: Types.UUID,
  })
  qrToken!: Types.UUID;

  @Prop({ required: true, unique: true, maxLength: 15, name: 'num_orden' })
  numOrden!: string;

  @Prop({ required: true, enum: OrdenEstado, default: OrdenEstado.RECIBIDO })
  estado!: OrdenEstado;

  @Prop({ required: false, type: [String], default: [], name: 'notas' })
  notas?: string[];

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Cliente',
    name: 'cliente',
  })
  cliente!: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'ClienteVehiculo',
    name: 'vehiculo',
  })
  vehiculo!: Types.ObjectId;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'Diagnostico',
    name: 'diagnostico',
  })
  diagnostico?: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Usuario' }],
    default: [],
    name: 'mecanicos_asignados',
  })
  mecanicosAsignados!: Types.ObjectId[]; //Agregar máximo 5 en el DTO

  //Técnicamente este es el recepcionista que creó la orden, pero lo dejamos como createdBy para mantener consistencia con el resto de los esquemas.
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Usuario',
    name: 'created_by',
  })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const OrdenSchema = SchemaFactory.createForClass(Orden);

OrdenSchema.index({ estado: 1, createdAt: -1 });
OrdenSchema.index({ cliente: 1, createdAt: -1 });
OrdenSchema.index({ mecanicosAsignados: 1, estado: 1 });
