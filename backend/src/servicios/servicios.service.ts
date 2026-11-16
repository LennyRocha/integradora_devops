/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { Servicio } from './entity/servicio.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import ICrudRepository from 'src/utils/crud-repository';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { ApiResponse } from 'src/config/api.response';
import { handleError } from 'src/config/utils/handle-error';
import { BussinessException } from 'src/config/exceptions/bussiness-exception';
import { ServicioPublicResponse } from './interfaces/servicio-public.response';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiciosService implements ICrudRepository {
  constructor(
    @InjectModel(Servicio.name)
    private readonly servicioModel: Model<Servicio>,
    @InjectPinoLogger(ServiciosService.name)
    private readonly logger: PinoLogger,
    private readonly auditService: BitacoraService,
  ) {}

  /**
   * Obtiene todos los servicios.
   */
  async findAll() {
    try {
      this.logger.info('Obteniendo todos los servicios');
      const data = await this.servicioModel.find();
      return ApiResponse.success(data, 'Servicios obtenidos correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los servicios');
      handleError(error);
    }
  }

  /**
   * Obtiene todos los servicios para la vista pública.
   */
  async findAllPublic() {
    try {
      this.logger.info('Obteniendo todos los servicios para la vista pública');
      const data = await this.servicioModel.find({ status: true });
      const list: ServicioPublicResponse[] = data.map((servicio) => ({
        id: servicio._id.toString(),
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        costo: Number(servicio.costo.toString()),
      }));
      return ApiResponse.success(
        list,
        'Servicios públicos obtenidos correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener los servicios públicos',
      );
      handleError(error);
    }
  }

  /**
   * Administrador obtiene un servicio por su ID.
   * @param id - El ID del usuario a obtener.
   */
  async findOne(id: string) {
    try {
      this.logger.info('Obteniendo un servicio');
      const data = await this.servicioModel.findById(id);
      if (!data) {
        throw new NotFoundException('Servicio no encontrado');
      }
      return ApiResponse.success(data, 'Servicio obtenido correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener el servicio');
      handleError(error);
    }
  }

  /**
   * Administra la creación de un nuevo servicio.
   * @param payload - Los datos del nuevo servicio.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async insert(payload: CreateServiceDto, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Insertando un nuevo servicio');

      const exists = await this.servicioModel.findOne({
        nombre: payload.nombre,
      });

      if (exists) {
        throw new BussinessException('El servicio ya existe');
      }

      const data = await this.servicioModel.create({
        ...payload,
        createdBy: user.sub,
      });

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de servicio ${data._id.toString()} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      this.logger.info('Servicio creado correctamente');

      return ApiResponse.success(data, 'Servicio creado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear el servicio');
      handleError(error);
    }
  }
  /**
   * Administador actualiza un servicio existente.
   * @param id - El ID del servicio a actualizar.
   * @param payload - Los datos a actualizar.
   *  @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async update(
    id: string,
    payload: UpdateServiceDto,
    user: AccessTokenClaims,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando un servicio');

      const exists = await this.servicioModel.findOne({
        nombre: payload.nombre,
        _id: { $ne: id },
      });

      if (exists) {
        throw new BussinessException('El servicio ya existe');
      }

      const data = await this.servicioModel.findByIdAndUpdate(
        id,
        {
          ...payload,
          updatedBy: user.sub,
        },
        { new: true },
      );

      if (!data) {
        throw new NotFoundException('Servicio no encontrado');
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó datos del servicio ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'Servicio actualizado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al actualizar el servicio');
      handleError(error);
    }
  }

  /**
   * Alterna el estado de un servicio.
   * @param id - El ID del servicio a actualizar.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async toggleStatus(id: string, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Actualizando estado de un servicio');
      const existing = await this.servicioModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Servicio no encontrado');
      }

      await this.servicioModel.findByIdAndUpdate(
        id,
        {
          status: !existing.status,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de servicio ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        { status: !existing.status },
        'Estado de servicio actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del servicio',
      );
      handleError(error);
    }
  }
}
