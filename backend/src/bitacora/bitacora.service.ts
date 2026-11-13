import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bitacora } from './entity/bitacora.schema';
import { Model } from 'mongoose';
import { BitacoraPayload } from './interfaces/bitacora-payload';
import { ApiResponse } from 'src/config/api.response';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectModel(Bitacora.name)
    private readonly bitacoraModel: Model<Bitacora>,
  ) {}

  async auditar(payload: BitacoraPayload) {
    await this.bitacoraModel.create({
      usuario: payload.usuario,
      accion: payload.accion,
      tipo: payload.tipo,
      ipOrigen: payload.ipOrigen,
    });
  }

  async findAll() {
    const data = await this.bitacoraModel.find();
    return ApiResponse.success(data, 'Bitácora obtenida correctamente');
  }
}
