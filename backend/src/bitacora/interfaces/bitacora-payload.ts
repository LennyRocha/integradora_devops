import { Types } from 'mongoose';

export interface BitacoraPayload {
  usuario: Types.ObjectId;
  accion: string;
  tipo: 'INSERT' | 'UPDATE' | 'DELETE';
  ipOrigen?: string;
}
