/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import ICrudRepository from 'src/utils/crud-repository';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { ApiResponse } from 'src/config/api.response';
import { handleError } from 'src/config/utils/handle-error';
import { BussinessException } from 'src/config/exceptions/bussiness-exception';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehiculo } from './entity/vehiculo.schema';
import { PaginationDto } from 'src/utils/pagination.dto';
import { TipoVehiculo } from './entity/tipo-vehiculo.schema';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';

@Injectable()
export class VehiculosService implements ICrudRepository {
  constructor(
    @InjectModel(Vehiculo.name)
    private readonly vehiculoModel: Model<Vehiculo>,
    @InjectModel(TipoVehiculo.name)
    private readonly tipoVehiculoModel: Model<TipoVehiculo>,
    @InjectPinoLogger(VehiculosService.name)
    private readonly logger: PinoLogger,
    private readonly auditService: BitacoraService,
  ) {}

  /**
   * Obtiene todos los vehículos.
   * @param query - Parámetro opcional para filtrar por modelo.
   */
  async findAll(query?: string) {
    try {
      this.logger.info('Obteniendo todos los vehículos');
      const data = await this.vehiculoModel
        .find(
          query
            ? { modelo: { $regex: query, $options: 'i' }, status: true }
            : { status: true },
        )
        .populate('tipo', 'tipo')
        .exec();
      return ApiResponse.success(data, 'vehículos obtenidos correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los vehículos');
      handleError(error);
    }
  }

  /**
   * Obtiene todos los vehículos con paginación.
   * @param dto - Parámetros de paginación.
   */
  async findAllPaginated(dto: PaginationDto) {
    try {
      const { page, limit } = dto;
      const skip = (page - 1) * limit;

      this.logger.info({ page, limit }, 'Consultando vehículos con paginación');

      const [data, total] = await Promise.all([
        this.vehiculoModel
          .find(dto.activeOnly ? { status: true } : {})
          .populate('tipo', 'tipo')
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.vehiculoModel.countDocuments(),
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
        'Vehículos obtenidos correctamente',
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los vehículos');
      handleError(error);
    }
  }

  /**
   * Administrador obtiene un vehiculo por su ID.
   * @param id - El ID del usuario a obtener.
   */
  async findOne(id: string) {
    try {
      this.logger.info('Obteniendo un vehiculo');
      const data = await this.vehiculoModel.findById(id);
      if (!data) {
        this.logger.warn({ id }, 'Vehiculo no encontrado');
        throw new NotFoundException('vehiculo no encontrado');
      }
      return ApiResponse.success(data, 'vehiculo obtenido correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener el vehiculo');
      handleError(error);
    }
  }

  /**
   * Administra la creación de un nuevo vehiculo.
   * @param payload - Los datos del nuevo vehiculo.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async insert(payload: CreateVehicleDto, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Insertando un nuevo vehiculo');

      const exists = await this.vehiculoModel.findOne(payload);

      if (exists) {
        throw new BussinessException('El vehiculo ya existe');
      }

      const tipo = await this.tipoVehiculoModel.findById(payload.tipo);

      if (!tipo) {
        throw new BussinessException('El tipo de vehiculo no existe');
      }

      const data = await this.vehiculoModel.create({
        ...payload,
        createdBy: user.sub,
      });

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de vehiculo ${data._id.toString()} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      this.logger.info('vehiculo creado correctamente');

      return ApiResponse.success(data, 'vehiculo creado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear el vehiculo');
      handleError(error);
    }
  }
  /**
   * Administador actualiza un vehiculo existente.
   * @param id - El ID del vehiculo a actualizar.
   * @param payload - Los datos a actualizar.
   *  @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async update(
    id: string,
    payload: UpdateVehicleDto,
    user: AccessTokenClaims,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando un vehiculo');

      const exists = await this.vehiculoModel.findOne({
        ...payload,
        _id: { $ne: id },
      });

      if (exists) {
        throw new BussinessException('El vehiculo ya existe');
      }

      const tipo = await this.tipoVehiculoModel.findById(payload.tipo);

      if (!tipo) {
        throw new BussinessException('El tipo de vehiculo no existe');
      }

      const data = await this.vehiculoModel.findByIdAndUpdate(
        id,
        {
          ...payload,
          updatedBy: user.sub,
        },
        { new: true, runValidators: true },
      );

      if (!data) {
        throw new NotFoundException('vehiculo no encontrado');
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó datos del vehiculo ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'vehiculo actualizado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al actualizar el vehiculo');
      handleError(error);
    }
  }

  /**
   * Alterna el estado de un vehiculo.
   * @param id - El ID del vehiculo a actualizar.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async toggleStatus(id: string, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Actualizando estado de un vehiculo');
      const existing = await this.vehiculoModel.findById(id);

      if (!existing) {
        throw new NotFoundException('vehiculo no encontrado');
      }

      await this.vehiculoModel.findByIdAndUpdate(
        id,
        {
          status: !existing.status,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de vehiculo ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        { status: !existing.status },
        'Estado de vehiculo actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del vehiculo',
      );
      handleError(error);
    }
  }

  /**
   * Obtiene todos los tipos de vehículos.
   */
  async findAllTiposVehiculos() {
    try {
      this.logger.info('Obteniendo todos los tipos de vehículos');
      const data = await this.tipoVehiculoModel.find();
      return ApiResponse.success(
        data,
        'Tipos de vehículos obtenidos correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener los tipos de vehículos',
      );
      handleError(error);
    }
  }

  /**
   * Administra la creación de un nuevo tipo de vehículo.
   * @param payload - Los datos del nuevo tipo de vehículo.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async insertTipoVehiculo(
    payload: CreateVehicleTypeDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Insertando un nuevo tipo de vehículo');

      const exists = await this.tipoVehiculoModel.findOne(payload);

      if (exists) {
        throw new BussinessException('El tipo de vehículo ya existe');
      }

      const data = await this.tipoVehiculoModel.create({
        ...payload,
        createdBy: user.sub,
      });

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de tipo de vehículo ${data._id.toString()} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear el tipo de vehículo');
      handleError(error);
    }
  }

  /**
   * Alterna el estado de un tipo de vehículo.
   * @param id - El ID del tipo de vehículo a actualizar.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async toggleStatusTipoVehiculo(
    id: string,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Actualizando estado de un tipo de vehículo');
      const existing = await this.tipoVehiculoModel.findById(id);
      if (!existing) {
        throw new NotFoundException('Tipo de vehículo no encontrado');
      }
      await this.tipoVehiculoModel.findByIdAndUpdate(
        id,
        {
          status: !existing.status,
          updatedBy: user.sub,
        },
        { new: true },
      );
      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado del tipo de vehículo ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        { status: !existing.status },
        'Estado del tipo de vehículo actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del tipo de vehículo',
      );
      handleError(error);
    }
  }
  //Para uso interno
  /**
   * Verifica si un tipo de vehículo existe en la base de datos.
   * @param id - El ID del tipo de vehículo a verificar.
   * @returns Un booleano indicando si el tipo de vehículo existe o no.
   */
  async existsTipoVehiculo(id: string) {
    try {
      this.logger.info('Verificando existencia de tipo de vehículo');
      const exists = await this.tipoVehiculoModel.exists({ _id: id });
      return !!exists;
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al verificar existencia del tipo de vehículo',
      );
      handleError(error);
    }
  }

  /**
   * Verifica si un vehículo existe en la base de datos.
   * @param id - El ID del vehículo a verificar.
   * @returns Un booleano indicando si el vehículo existe o no.
   */
  async existsVehiculo(id: string) {
    try {
      this.logger.info('Verificando existencia de vehículo');
      const exists = await this.vehiculoModel.exists({ _id: id });
      return !!exists;
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al verificar existencia del vehículo',
      );
      handleError(error);
    }
  }

  /**
   * Verifica si un vehículo está activo.
   * @param id - El ID del vehículo a verificar.
   * @returns Un booleano indicando si el vehículo está activo o no.
   */
  async isVehicleActive(id: string) {
    try {
      this.logger.info('Verificando si el vehículo está activo');
      const vehicle = await this.vehiculoModel.findById(id);
      if (!vehicle) {
        throw new NotFoundException('Vehículo no encontrado');
      }
      return vehicle.status;
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al verificar si el vehículo está activo',
      );
      handleError(error);
    }
  }
}
