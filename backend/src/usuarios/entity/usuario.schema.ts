import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Rol from './rol';
import { type MongoImage } from 'src/utils/mongo.image';
import { MongoImageSchema } from 'src/utils/mongo.image.schema';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, maxLength: 75 })
  nombre!: string;

  @Prop({ required: true, name: 'apellido_p', maxLength: 50 })
  apellidoP!: string;

  @Prop({ required: false, name: 'apellido_m', maxLength: 50 })
  apellidoM?: string;

  @Prop({ required: true, unique: true, maxLength: 100 })
  correo!: string;

  @Prop({ required: true })
  contra!: string;

  @Prop({ required: false, unique: true, maxLength: 15 })
  telefono?: string;

  @Prop({ required: true, enum: Rol })
  rol!: Rol;

  @Prop({
    required: false,
    name: 'perfil_foto',
    type: MongoImageSchema,
  })
  perfilFoto?: MongoImage;

  @Prop({ default: true })
  status: boolean = true;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'created_by' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', name: 'updated_by' })
  updatedBy?: Types.ObjectId;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
