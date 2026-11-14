/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bitacora } from './entity/bitacora.schema';
import { Model } from 'mongoose';
import { BitacoraPayload } from './interfaces/bitacora-payload';
import { ApiResponse } from 'src/config/api.response';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { BitacoraException } from 'src/config/exceptions/bitacora-exception';
import { handleError } from 'src/config/utils/handle-error';
import { PaginationDto } from 'src/utils/pagination.dto';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectModel(Bitacora.name)
    private readonly bitacoraModel: Model<Bitacora>,
    @InjectPinoLogger(BitacoraService.name)
    private readonly logger: PinoLogger,
  ) {}

  private async registrar(payload: BitacoraPayload) {
    try {
      await this.bitacoraModel.create({
        usuario: payload.usuario,
        accion: payload.accion,
        tipo: payload.tipo,
        ipOrigen: payload.ipOrigen,
      });
      this.logger.info(
        {
          usuario: payload.usuario.toString(),
          accion: payload.accion,
          tipo: payload.tipo,
          ipOrigen: payload.ipOrigen,
        },
        'Auditoría registrada',
      );
    } catch (error) {
      this.logger.error(
        { err: error, accion: payload.accion },
        'Falló el registro de auditoría',
      );

      throw new BitacoraException(
        'No se pudo registrar la acción en la bitácora',
        error,
      );
    }
  }

  async auditar(payload: BitacoraPayload) {
    try {
      await this.registrar(payload);
    } catch (error) {
      if (error instanceof BitacoraException) {
        this.logger.error(
          { err: error },
          'La operación continuó sin registrar la auditoría',
        );
        return;
      }

      throw error;
    }
  }

  async findAll(user: AccessTokenClaims, pagination: PaginationDto) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      this.logger.info(
        { usuario: user.sub, page, limit },
        'Usuario solicitó consultar la bitácora',
      );

      const [data, total] = await Promise.all([
        this.bitacoraModel
          .find()
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.bitacoraModel.countDocuments(),
      ]);

      return ApiResponse.success(
        {
          items: data,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
          },
        },
        'Bitácora obtenida correctamente',
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener la bitácora');

      handleError(error);
    }
  }
}
