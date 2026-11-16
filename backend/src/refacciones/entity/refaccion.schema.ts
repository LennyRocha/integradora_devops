import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Refaccion {
  @Prop({ required: true, maxLength: 50 })
  nombre!: string;

  @Prop({ required: true, maxLength: 75 })
  descripcion!: string;

  @Prop({ required: true, type: Types.Decimal128, max: 999999.99 })
  costo!: Types.Decimal128;

  @Prop({ required: true, type: Number, min: 0 })
  cantidad: number = 0;
}

export const RefaccionSchema = SchemaFactory.createForClass(Refaccion);
