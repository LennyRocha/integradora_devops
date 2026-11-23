import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DiagnosticoDocument = HydratedDocument<Diagnostico>;

@Schema({ timestamps: true })
export class Diagnostico {
  @Prop({ required: true, maxLength: 100 })
  resumen!: string;

  @Prop({ required: false, type: [String], default: [], name: 'observaciones' })
  observaciones?: string[];

  @Prop({
    required: false,
    type: Types.Decimal128,
    max: 999999.99,
    name: 'cargo_adicional',
  })
  cargoAdicional!: Types.Decimal128;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Usuario',
    name: 'responsable',
  })
  responsable!: Types.ObjectId;
}

export const DiagnosticoSchema = SchemaFactory.createForClass(Diagnostico);

DiagnosticoSchema.index({ createdAt: 1 });
DiagnosticoSchema.index({ responsable: 1 });
