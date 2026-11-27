/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Diagnostico } from './entity/diagnostico.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { Orden } from 'src/ordenes/entity/orden.schema';
import { SseService } from 'src/sse/sse.service';
import { handleError } from 'src/config/utils/handle-error';
import { ApiResponse } from 'src/config/api.response';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import OrdenEstado from 'src/ordenes/entity/orden-estado';

@Injectable()
export class DiagnosticosService {
  constructor(
    @InjectModel(Orden.name)
    private readonly ordenModel: Model<Orden>,
    @InjectModel(Diagnostico.name)
    private readonly diagnosticoModel: Model<Diagnostico>,
    @InjectPinoLogger(DiagnosticosService.name)
    private readonly logger: PinoLogger,
    private readonly auditService: BitacoraService,
    private readonly sseService: SseService,
  ) {}

  async findOne(id: string) {
    try {
      this.logger.info({ id }, 'Obteniendo diagnostico por ID');
      const diagnostico = await this.diagnosticoModel
        .findById(id)
        .populate('responsable')
        .exec();
      if (!diagnostico) {
        this.logger.warn({ id }, 'Diagnostico no encontrado');
        throw new NotFoundException('Diagnostico no encontrado');
      }
      return ApiResponse.success(
        diagnostico,
        'Diagnostico obtenido correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener el diagnostico por ID',
      );
      handleError(error);
    }
  }

  async insert(
    ordenId: string,
    payload: CreateDiagnosticDto,
    user: AccessTokenClaims,
    ip: string,
    requireRefacciones: boolean = false,
  ) {
    try {
      this.logger.info({ ordenId }, 'Insertando diagnóstico de la órden');
      const orden = await this.ordenModel.findById(ordenId);

      if (!orden) {
        this.logger.warn({ ordenId }, 'Órden no encontrada');
        throw new NotFoundException('Órden no encontrada');
      }

      if (orden.diagnostico) {
        this.logger.warn({ ordenId }, 'La órden ya tiene un diagnóstico');
        throw new NotFoundException('La órden ya tiene un diagnóstico');
      }

      const newDiagnostico = new this.diagnosticoModel({
        ...payload,
        orden: ordenId,
        responsable: new Types.ObjectId(user.sub),
      });

      const savedDiagnostico = await newDiagnostico.save();

      orden.diagnostico = savedDiagnostico._id;
      orden.estado = requireRefacciones
        ? OrdenEstado.REFACCIONES
        : OrdenEstado.PENDIENTE;
      orden.updatedBy = new Types.ObjectId(user.sub);

      await orden.save();

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de diagnóstico para la órden ${orden.numOrden} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      this.logger.info(
        { ordenId },
        'Diagnóstico levantado correctamente para la órden',
      );

      this.sseService.emmit(
        'ordenes',
        {
          modified: true,
          ordenId: orden._id,
          diagnosticoId: savedDiagnostico._id,
        },
        'orden.diagnostico',
      );

      //TODO generar notificaciones para todos los mecánicos asignados a la órden

      return ApiResponse.success(
        savedDiagnostico,
        'Diagnóstico insertado correctamente',
        201,
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al insertar el diagnóstico');
      handleError(error);
    }
  }

  async delete(
    id: string,
    user: AccessTokenClaims,
    ip: string,
    numOrden: string,
  ) {
    try {
      this.logger.info(`Eliminando diagnostico con id: ${id}`);
      const diagnostico = await this.diagnosticoModel.findById(id);
      if (!diagnostico) {
        this.logger.warn(`Diagnostico con id: ${id} no encontrado`);
        return { success: false, message: 'Diagnostico no encontrado' };
      }
      await this.diagnosticoModel.deleteOne({ _id: id });
      this.logger.info(`Diagnostico con id: ${id} eliminado`);

      await this.ordenModel.updateOne(
        { diagnostico: diagnostico._id },
        {
          $unset: { diagnostico: 1 },
          $set: {
            updatedBy: new Types.ObjectId(user.sub),
          },
        },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} eliminó el diagnostico ${id.toString()} para la orden ${numOrden}`,
        tipo: 'DELETE',
        ipOrigen: ip,
      });

      this.sseService.emmit(
        'ordenes',
        { modified: true, ordenId: id, diagnosticoId: diagnostico._id },
        'orden.diagnostico',
      );

      return ApiResponse.success(
        diagnostico,
        'Diagnostico eliminado correctamente',
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al eliminar el diagnostico');
      handleError(error);
    }
  }
}
