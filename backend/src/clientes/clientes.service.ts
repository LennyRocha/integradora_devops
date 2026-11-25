/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Cliente } from './entity/cliente.schema';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from 'src/config/api.response';
import { Model, Types } from 'mongoose';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { BussinessException } from 'src/config/exceptions/bussiness-exception';
import { handleError } from 'src/config/utils/handle-error';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from 'src/utils/pagination.dto';
import { UpdateClientVehicleDto } from './dto/update-client-vehicle.dto';
import { VehiculosService } from 'src/vehiculos/vehiculos.service';
import { DashboardEvent } from 'src/dashboard/interfaces/dashboard-event';
import { DashboardService } from 'src/dashboard/dashboard.service';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name)
    private readonly clienteModel: Model<Cliente>,
    @InjectPinoLogger(ClientesService.name)
    private readonly logger: PinoLogger,
    private readonly auditService: BitacoraService,
    private readonly vehiculosService: VehiculosService,
    private readonly dashboardService: DashboardService,
  ) {}

  /**
   * Obtiene todos los clientes.
   * @param query - Parámetro opcional para filtrar por nombre.
   */
  async findAll(query?: string) {
    try {
      this.logger.info('Obteniendo todos los clientes');
      const data = await this.clienteModel
        .find(
          query
            ? { nombre: { $regex: query, $options: 'i' }, status: true }
            : { status: true },
        )
        .exec();
      return ApiResponse.success(data, 'clientes obtenidos correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los clientes');
      handleError(error);
    }
  }

  /**
   * Obtiene todos los clientes con paginación.
   * @param dto - Parámetros de paginación.
   * @param query - La consulta para filtrar los clientes.
   */
  async findAllPaginated(dto: PaginationDto, query?: string) {
    try {
      const { page, limit } = dto;
      const skip = (page - 1) * limit;

      this.logger.info({ page, limit }, 'Consultando clientes con paginación');

      const filter = query ? { nombre: { $regex: query, $options: 'i' } } : {};

      const [data, total] = await Promise.all([
        this.clienteModel
          .find({ ...filter, ...(dto.activeOnly ? { status: true } : {}) })
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.clienteModel.countDocuments({
          ...filter,
          ...(dto.activeOnly ? { status: true } : {}),
        }),
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
          activeOnly: dto.activeOnly,
        },
        'Clientes obtenidos correctamente',
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los clientes');
      handleError(error);
    }
  }

  /**
   * Administrador obtiene un cliente por su ID.
   * @param id - El ID del cliente a obtener.
   */
  async findOne(id: string) {
    try {
      this.logger.info('Obteniendo un cliente por su ID');
      const data = await this.clienteModel.findById(id);
      if (!data) {
        this.logger.warn({ id }, 'Cliente no encontrado');
        throw new NotFoundException('cliente no encontrado');
      }
      return ApiResponse.success(data, 'cliente obtenido correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener el cliente');
      handleError(error);
    }
  }

  /**
   * Administra la creación de un nuevo cliente.
   * @param payload - Los datos del nuevo cliente.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async insert(payload: CreateClientDto, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Insertando un nuevo cliente');

      const exists = await this.clienteModel.findOne({
        telefono: payload.telefono,
      });

      if (exists) {
        throw new BussinessException('El cliente ya existe');
      }

      if (payload.vehiculos && payload.vehiculos.length > 0) {
        await Promise.all(
          payload.vehiculos.map(async (vehiculo) => {
            const vehicleExists = await this.vehiculosService.existsVehiculo(
              vehiculo.vehiculo.toString(),
            );
            if (!vehicleExists) {
              throw new BussinessException(
                `El vehículo con ID ${vehiculo.vehiculo} no existe`,
              );
            }
          }),
        );
      }

      const data = await this.clienteModel.create({
        ...payload,
        createdBy: user.sub,
      });

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de cliente ${data._id.toString()} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      const event = await this.countActive();
      this.dashboardService.updateDashboardKpi(event);

      this.logger.info('cliente creado correctamente');

      return ApiResponse.success(data, 'cliente creado correctamente', 201);
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear el cliente');
      handleError(error);
    }
  }
  /**
   * Administador actualiza un cliente existente.
   * @param id - El ID del cliente a actualizar.
   * @param payload - Los datos a actualizar.
   *  @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async update(
    id: string,
    payload: UpdateClientDto,
    user: AccessTokenClaims,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando un cliente');

      if (payload.telefono) {
        const exists = await this.clienteModel.findOne({
          telefono: payload.telefono,
          _id: { $ne: id },
        });

        if (exists) {
          throw new BussinessException('El número de teléfono ya existe');
        }
      }

      const data = await this.clienteModel.findByIdAndUpdate(
        id,
        {
          ...payload,
          updatedBy: user.sub,
        },
        { new: true, runValidators: true },
      );

      if (!data) {
        throw new NotFoundException('cliente no encontrado');
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó datos del cliente ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'cliente actualizado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al actualizar el cliente');
      handleError(error);
    }
  }

  /**
   * Alterna el estado de un cliente.
   * @param id - El ID del cliente a actualizar.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async toggleStatus(id: string, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Actualizando estado de un cliente');
      const existing = await this.clienteModel.findById(id);

      if (!existing) {
        throw new NotFoundException('cliente no encontrado');
      }

      await this.clienteModel.findByIdAndUpdate(
        id,
        {
          status: !existing.status,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de cliente ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        { status: !existing.status },
        'Estado de cliente actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del cliente',
      );
      handleError(error);
    }
  }

  /**
   * Actualiza un vehículo específico de un cliente.
   * @param clientId - El ID del cliente.
   * @param vehicleId - El ID del vehículo a actualizar.
   * @param payload - Los datos a actualizar del vehículo.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param ip - La dirección IP del cliente.
   */
  async updateClientVehicle(
    clientId: string,
    vehicleId: string,
    payload: UpdateClientVehicleDto,
    user: AccessTokenClaims,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando vehículo de un cliente');
      const client = await this.clienteModel.findById(clientId);
      if (!client) {
        throw new NotFoundException('cliente no encontrado');
      }

      const vehicle = client.vehiculos.id(vehicleId);

      if (!vehicle) {
        throw new NotFoundException('Vehículo no encontrado para este cliente');
      }

      vehicle.set({
        ...payload,
        updatedBy: new Types.ObjectId(user.sub),
      });

      await client.save();

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el vehículo ${vehicleId.toString()} del cliente ${clientId.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        vehicle,
        'vehículo del cliente actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el vehículo del cliente',
      );
      handleError(error);
    }
  }

  //Para uso interno
  /**
   * Administrador obtiene los vehículos de un cliente por su ID.
   * @param id - El ID del cliente a obtener.
   */
  async findVehiculosCliente(id: string) {
    try {
      this.logger.info('Obteniendo los vehículos de un cliente por su ID');
      const data = await this.clienteModel.findById(id);
      if (!data) {
        throw new NotFoundException('cliente no encontrado');
      }
      return data.vehiculos;
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener el cliente');
      handleError(error);
    }
  }

  /**
   * Verifica si un cliente tiene un vehículo específico.
   * @param clientId - El ID del cliente a verificar.
   * @param vehicleId - El ID del vehículo a verificar.
   */
  async clientHasThatVehicle(clientId: string, vehicleId: string) {
    try {
      this.logger.info('Verificando si el cliente tiene ese vehículo');
      const client = await this.clienteModel.findById(clientId);
      if (!client) {
        throw new NotFoundException('cliente no encontrado');
      }
      const hasVehicle = client.vehiculos.some(
        (vehiculo) => vehiculo._id.toString() === vehicleId,
      );
      return hasVehicle;
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al verificar el vehículo del cliente',
      );
      handleError(error);
    }
  }

  /**
   * Cuenta el número de clientes activos y emite un evento al dashboard.
   * @returns Un objeto DashboardEvent con el resultado de la operación.
   */
  async countActive(): Promise<DashboardEvent> {
    try {
      const count = await this.clienteModel.countDocuments({ status: true });
      return { kpi: 'clientes', success: true, count };
    } catch (error) {
      this.logger.error({ err: error }, 'Error al contar clientes activos');
      return {
        kpi: 'clientes',
        success: false,
        count: 0,
        message: 'Error al contar clientes activos',
      };
    }
  }
}
