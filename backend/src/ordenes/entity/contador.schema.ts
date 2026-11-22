import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false })
export class Contador {
  @Prop({ required: true, unique: true })
  nombre!: string;

  @Prop({ required: true, default: 0 })
  secuencia!: number;
}

export const ContadorSchema = SchemaFactory.createForClass(Contador);
