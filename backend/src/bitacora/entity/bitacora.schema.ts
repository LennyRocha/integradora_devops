import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Usuario } from 'src/usuarios/entity/usuario.schema';

@Schema({ timestamps: true })
export class Bitacora {
  @Prop({ required: true, type: Types.ObjectId, ref: Usuario.name })
  usuario!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  accion!: string;

  @Prop({ required: true, enum: ['INSERT', 'UPDATE', 'DELETE'] })
  tipo!: string;

  @Prop({ required: false })
  ipOrigen?: string;
}

export const BitacoraSchema = SchemaFactory.createForClass(Bitacora);
