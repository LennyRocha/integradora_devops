import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bitacora } from './entity/bitacora.schema';
import { Model } from 'mongoose';
import { BitacoraPayload } from './interfaces/bitacora-payload';
import { ApiResponse } from 'src/config/api.response';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectModel(Bitacora.name)
    private readonly bitacoraModel: Model<Bitacora>,
    @InjectPinoLogger(BitacoraService.name)
    private readonly logger: PinoLogger,
  ) {}

  async auditar(payload: BitacoraPayload) {
    this.logger.info(
      {
        usuario: payload.usuario.toString(),
        accion: payload.accion,
        tipo: payload.tipo,
        ipOrigen: payload.ipOrigen,
      },
      'Auditoría registrada',
    );
    await this.bitacoraModel.create({
      usuario: payload.usuario,
      accion: payload.accion,
      tipo: payload.tipo,
      ipOrigen: payload.ipOrigen,
    });
  }

  async findAll(user: AccessTokenClaims) {
    this.logger.info(`Usuario ${user.sub} solicitó la bitácora completa`);
    const data = await this.bitacoraModel.find();
    return ApiResponse.success(data, 'Bitácora obtenida correctamente');
  }
}
