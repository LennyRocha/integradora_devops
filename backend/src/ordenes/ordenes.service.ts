/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Orden } from './entity/orden.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Model, Types } from 'mongoose';
import { handleError } from 'src/config/utils/handle-error';
import { ApiResponse } from 'src/config/api.response';
import { PaginationDto } from 'src/utils/pagination.dto';
import OrdenEstado from './entity/orden-estado';
import { SseService } from 'src/sse/sse.service';
import { DashboardEvent } from 'src/dashboard/interfaces/dashboard-event';
import OrdenPublicResponse from './interfaces/orden-public.response';
import { Cliente } from 'src/clientes/entity/cliente.schema';
import { ClienteVehiculo } from 'src/clientes/entity/cliente-vehiculo.schema';
import { TipoVehiculo } from 'src/vehiculos/entity/tipo-vehiculo.schema';
import { Vehiculo } from 'src/vehiculos/entity/vehiculo.schema';
import { Usuario } from 'src/usuarios/entity/usuario.schema';
import { Diagnostico } from 'src/diagnosticos/entity/diagnostico.schema';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { AsignarComplementosDto } from './dto/asignar-complementos.dto';
import { EstadoOrdenDto } from './dto/estado-orden.dto';
import { AsignarNotasDto } from './dto/asignar-notas.dto';
import { AsignarMecanicosDto } from './dto/asignar-mecanicos.dto';
import { ImagenIndexDto } from './dto/imagen-index.dto';
import { MultimediaService } from 'src/multimedia/multimedia.service';
import type { File as MulterFile } from 'multer';
import { FotoTipoDto } from './dto/foto-tipo.dto';
import { BussinessException } from 'src/config/exceptions/bussiness-exception';
import { MongoImage } from 'src/utils/mongo.image';
import { Servicio } from 'src/servicios/entity/servicio.schema';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Contador } from './entity/contador.schema';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectModel(Orden.name)
    private readonly ordenModel: Model<Orden>,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
    @InjectModel(Servicio.name)
    private readonly servicioModel: Model<Servicio>,
    @InjectModel(Contador.name)
    private readonly contadorModel: Model<Contador>,
    @InjectPinoLogger(OrdenesService.name)
    private readonly logger: PinoLogger,
    private readonly fileService: MultimediaService,
    private readonly auditService: BitacoraService,
    private readonly sseService: SseService,
    private readonly dashboardService: DashboardService,
    private readonly usuarioService: UsuariosService,
  ) {}

  /**
   * Obtiene todos los vehículos.
   * @param query - Parámetro opcional para filtrar por modelo.
   */
  async findAll(query?: string) {
    try {
      this.logger.info(
        'Obteniendo todas las órdenes para el tablero de órdenes',
      );
      const data = await this.ordenModel
        .find(
          query
            ? {
                numOrden: { $regex: query, $options: 'i' },
                estado: {
                  $in: [
                    OrdenEstado.DIAGNOSTICO,
                    OrdenEstado.PENDIENTE,
                    OrdenEstado.REFACCIONES,
                    OrdenEstado.LISTO,
                  ],
                },
              }
            : {},
        )
        .populate('cliente')
        .populate('vehiculo')
        .populate('vehiculo.vehiculo')
        .populate('vehiculo.vehiculo.tipo')
        .populate('diagnostico')
        .populate('mecanicosAsignados')
        .exec();
      return ApiResponse.success(data, 'órdenes obtenidas correctamente');
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener las órdenes para el tablero de órdenes',
      );
      handleError(error);
    }
  }

  /**
   * Obtiene una orden por su ID.
   * @param id - El ID de la orden a obtener.
   */
  async findOne(id: string) {
    try {
      this.logger.info({ id }, 'Obteniendo orden por ID');
      const orden = await this.ordenModel
        .findById(id)
        .populate('cliente')
        .populate('vehiculo')
        .populate('vehiculo.vehiculo')
        .populate('vehiculo.vehiculo.tipo')
        .populate('diagnostico')
        .populate('mecanicosAsignados')
        .exec();
      if (!orden) {
        this.logger.warn({ id }, 'Orden no encontrada');
        throw new NotFoundException('Orden no encontrada');
      }
      return ApiResponse.success(orden, 'Orden obtenida correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener la orden por ID');
      handleError(error);
    }
  }

  /**
   * Obtiene todos los vehículos con paginación.
   * @param query - Parámetro opcional para filtrar por modelo.
   * @param dto - Parámetros de paginación.
   */
  async findAllPaginated(dto: PaginationDto, query?: string) {
    try {
      const { page, limit } = dto;
      const skip = (page - 1) * limit;

      this.logger.info(
        { page, limit },
        'Consultando órdenes concluidas (canceladas o entregadas) con paginación',
      );

      const [data, total] = await Promise.all([
        this.ordenModel
          .find(
            query
              ? {
                  numOrden: { $regex: query, $options: 'i' },
                  estado: {
                    $in: [OrdenEstado.CANCELADO, OrdenEstado.ENTREGADO],
                  },
                }
              : {},
          )
          .populate('cliente')
          .populate('vehiculo')
          .populate('vehiculo.vehiculo')
          .populate('vehiculo.vehiculo.tipo')
          .populate('diagnostico')
          .populate('mecanicosAsignados')
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.ordenModel.countDocuments(
          query
            ? {
                numOrden: { $regex: query, $options: 'i' },
                estado: {
                  $in: [OrdenEstado.CANCELADO, OrdenEstado.ENTREGADO],
                },
              }
            : {},
        ),
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
        'Órdenes obtenidas correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener las órdenes con paginación',
      );
      handleError(error);
    }
  }

  /**
   * Obtiene una orden por su token QR.
   * @param qrToken - El token QR de la orden.
   * @returns Una promesa que resuelve con la orden encontrada.
   */
  async findOneByQrToken(qrToken: string) {
    try {
      this.logger.info({ qrToken }, 'Obteniendo orden por QR token');
      const orden = await this.ordenModel
        .findOne({ qrToken })
        .populate<OrdenQrPopulated>([
          { path: 'cliente' },
          { path: 'vehiculo' },
          { path: 'vehiculo.vehiculo' },
          { path: 'vehiculo.vehiculo.tipo' },
          { path: 'diagnostico' },
          { path: 'diagnostico.responsable' },
        ])
        .exec();
      if (!orden) {
        this.logger.warn({ qrToken }, 'Orden no encontrada');
        throw new NotFoundException('Orden no encontrada');
      }
      const response: OrdenPublicResponse = {
        id: orden._id.toString(),
        razonServicio: orden.razonServicio,

        fotosExpediente: orden.fotosExpediente.map((foto) => ({
          imagen: foto.imagen,
          tipo: foto.tipo,
          uploadedBy: foto.uploadedBy.toString(),
          fecha: foto.fecha,
        })),

        refacciones: orden.refacciones.map((refaccion) => ({
          nombre: refaccion.nombre,
          descripcion: refaccion.descripcion,
          costo: Number(refaccion.costo.toString()),
          cantidad: refaccion.cantidad,
        })),

        servicios: orden.servicios.map((servicio) => ({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          costo: Number(servicio.costo.toString()),
        })),

        subtotal: Number(orden.subtotal.toString()),
        fechaEntrega: orden.fechaEntrega,
        qrToken: orden.qrToken.toString(),
        notas: orden.notas,
        numOrden: orden.numOrden,
        estado: orden.estado,

        cliente: {
          nombreCompleto: orden.cliente.nombreCompleto ?? orden.cliente.nombre,
          telefono: orden.cliente.telefono,
          status: orden.cliente.status,
          vehiculo: {
            tipo: orden.vehiculo.vehiculo.tipo.tipo,
            modelo: orden.vehiculo.vehiculo.modelo,
            ano: orden.vehiculo.vehiculo.ano,
            marca: orden.vehiculo.vehiculo.marca,
            placas: orden.vehiculo.placas,
            color: orden.vehiculo.color,
            detallesReferencia: orden.vehiculo.detallesReferencia,
          },
        },

        diagnostico: orden.diagnostico
          ? {
              resumen: orden.diagnostico.resumen,
              observaciones: orden.diagnostico.observaciones,
              cargoAdicional: Number(
                orden.diagnostico.cargoAdicional.toString(),
              ),
              responsable:
                orden.diagnostico?.responsable.nombreCompleto ??
                orden.diagnostico?.responsable.nombre,
            }
          : undefined,
      };
      return ApiResponse.success(response, 'Orden obtenida correctamente');
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener la orden por QR token',
      );
      handleError(error);
    }
  }

  /**
   * Inserta una nueva órden.
   * @param payload - Datos para crear la nueva órden.
   * @param user - Usuario que realiza la acción.
   * @param ip - Dirección IP del cliente.
   */
  async insert(payload: CreateOrdenDto, user: AccessTokenClaims, ip: string) {
    try {
      this.logger.info('Insertando nueva órden');
      const soloAdmins = await this.usuarioService.soloHayAdministradores();
      //Si solo hay admins, la órden se le asigna al admin que la registra
      const numOrden = await this.generarNumeroOrden();
      const newOrden = new this.ordenModel({
        ...payload,
        subtotal: 0,
        qrToken: new Types.UUID(),
        numOrden,
        estado: soloAdmins ? OrdenEstado.PENDIENTE : OrdenEstado.RECIBIDO,
        mecanicosAsignados: soloAdmins ? [new Types.ObjectId(user.sub)] : [],
        createdBy: user.sub,
      });
      const savedOrden = await newOrden.save();
      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de usuario ${savedOrden._id.toString()} por ${user.sub}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      const event = await this.countActive();
      this.dashboardService.updateDashboardKpi(event);

      //TODO generar notificaciones para todos

      this.logger.info('Órden creada correctamente');
      return ApiResponse.success(savedOrden, 'Órden insertada correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al insertar la órden');
      handleError(error);
    }
  }

  /**
   * Actualiza los complementos de una órden.
   * @param id - ID de la órden.
   * @param payload - Datos para actualizar los complementos (refacciones y servicios y notas opcionales).
   * @param user - Usuario que realiza la acción.
   * @param ip - Dirección IP del cliente.
   */
  async update(
    id: string,
    payload: AsignarComplementosDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Actualizando complementos de una órden');
      const existing = await this.ordenModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Órden no encontrada');
      }

      const servicios = await this.servicioModel.find({
        _id: { $in: payload.servicios },
      });

      if (servicios.length !== payload.servicios.length) {
        throw new NotFoundException('Uno o más servicios no encontrados');
      }

      const subtotal = existing.subtotal;
      const totalServicios = servicios.reduce(
        (acc, servicio) => acc + Number(servicio.costo.toString()),
        0,
      );
      const totalRefacciones = payload.refacciones.reduce(
        (acc, refaccion) =>
          acc + Number(refaccion.costo.toString()) * refaccion.cantidad,
        0,
      );

      this.logger.info(
        { subtotal, totalServicios, totalRefacciones },
        'Calculando subtotal de la órden',
      );

      await this.ordenModel.findByIdAndUpdate(
        id,
        {
          refacciones: payload.refacciones,
          servicios: payload.servicios,
          updatedBy: user.sub,
          notas: payload.notas ?? existing.notas,
          subtotal: totalServicios + totalRefacciones,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó los complementos de la órden ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      this.sseService.emmit(
        'ordenes',
        { modified: true, ordenId: id },
        'orden.modificada',
      );

      return ApiResponse.success(
        { updated: true },
        'Complementos de la órden actualizados correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar los complementos de la órden',
      );
      handleError(error);
    }
  }

  /**
   * Actualiza el estado de una órden existente.
   * @param id - ID de la órden.
   * @param payload - Datos del estado a actualizar.
   * @param user - Usuario que realiza la acción.
   * @param ip - IP de origen.
   * @returns Una promesa que resuelve con la respuesta de la operación.
   */
  async toggleStatus(
    id: string,
    payload: EstadoOrdenDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Actualizando estado de órden');
      const existing = await this.ordenModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Órden no encontrada');
      }

      /**
       * Qué significa cada estado:
       * RECIBIDO: La orden ha sido recibida y está en espera de ser procesada (por defecto).
       * PENDIENTE: Se asignaron mecánicos a la orden y está en espera de diagnóstico.
       * DIAGNOSTICO: La orden está siendo diagnosticada por los mecánicos asignados.
       * REFACCIONES: La orden está en espera de refacciones para continuar con el trabajo.
       * LISTO: La orden está lista para ser entregada al cliente.
       * ENTREGADO: La orden ha sido entregada al cliente y se registra la fecha de entrega.
       * CANCELADO: La orden ha sido cancelada y no se realizará el trabajo.
       */

      this.handleEstado(payload.estado, existing);

      if (payload.estado === OrdenEstado.ENTREGADO) {
        await this.ordenModel.findByIdAndUpdate(
          id,
          {
            estado: payload.estado,
            updatedBy: user.sub,
            fechaEntrega: new Date(),
          },
          { new: true },
        );
      } else {
        await this.ordenModel.findByIdAndUpdate(
          id,
          {
            estado: payload.estado,
            updatedBy: user.sub,
          },
          { new: true },
        );
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de órden ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      if (
        payload.estado === OrdenEstado.ENTREGADO ||
        payload.estado === OrdenEstado.CANCELADO
      ) {
        this.sseService.emmit(
          'dashboard',
          { kpi: 'ordenes', success: true, count: 1 },
          'dashboard.estadisticas',
        );
        const event = await this.ingresosBrutosDelMes();
        this.dashboardService.updateDashboardKpi(event);
      } else {
        this.sseService.emmit(
          'ordenes',
          { id, newEstado: payload.estado },
          'orden.estado',
        );
      }
      //TODO generar notificaciones para todos
      return ApiResponse.success(
        { newEstado: payload.estado },
        'Estado de órden actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado de la órden',
      );
      handleError(error);
    }
  }

  /**
   * Agrega fotos a una órden existente.
   * @param id - ID de la órden.
   * @param payload - Datos del tipo de foto.
   * @param user - Usuario que realiza la acción.
   * @param ip - IP de origen.
   * @param files - Archivos a subir.
   * @returns Una promesa que resuelve con la respuesta de la operación.
   */
  async addPhotos(
    id: string,
    payload: FotoTipoDto,
    user: AccessTokenClaims,
    ip: string,
    files: MulterFile[],
  ) {
    try {
      this.logger.info('Agregando fotos a una órden');

      if (!files || files.length === 0) {
        throw new BussinessException(
          'No se han proporcionado archivos para subir',
        );
      }

      if (files.length > 4) {
        throw new BussinessException('No se pueden subir más de 4 archivos');
      }

      const existing = await this.ordenModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Órden no encontrada');
      }

      if (existing.fotosExpediente.length >= 4) {
        throw new BussinessException(
          'No se pueden subir más de 4 fotos por órden',
        );
      }

      const remainingSlots = 4 - existing.fotosExpediente.length;

      if (files.length > remainingSlots) {
        throw new BussinessException(
          `No se pueden subir más de ${remainingSlots} fotos adicionales`,
        );
      }

      const filesPerSlots = files.slice(0, remainingSlots);

      const uploaded: MongoImage[] = await Promise.all(
        filesPerSlots.map((file, index) => {
          return this.fileService.uploadImage(
            file,
            {
              folder: 'ordenes',
            },
            `orden_${existing.numOrden}_#${index + 1}`,
          );
        }),
      );

      try {
        const fotos = uploaded.map((uploadedImage) => ({
          imagen: uploadedImage,
          tipo: payload.tipo,
          uploadedBy: new Types.ObjectId(user.sub),
          fecha: new Date(),
        }));
        existing.fotosExpediente.push(...fotos);
        await existing.save();
      } catch (error) {
        this.logger.error(
          { err: error },
          'Error al guardar las fotos en la base de datos, se eliminarán las imágenes subidas',
        );
        await Promise.allSettled(
          uploaded.map((image) => this.fileService.deleteImage(image.publicId)),
        );
        throw error;
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} agregó ${uploaded.length} fotos a la órden ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      this.sseService.emmit(
        'ordenes',
        { modified: true, ordenId: id },
        'orden.modificada',
      );

      return ApiResponse.success(
        { updated: true },
        `Se agregaron ${uploaded.length} fotos a la órden actualizadas correctamente`,
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al agregar fotos a la órden');
      handleError(error);
    }
  }

  /**
   * Agrega notas a una órden existente.
   * @param id - ID de la órden.
   * @param payload - Datos de las notas.
   * @param user - Usuario que realiza la acción.
   * @param ip - IP de origen.
   * @returns Una promesa que resuelve con la respuesta de la operación.
   */
  async addNotas(
    id: string,
    payload: AsignarNotasDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Actualizando notas de una órden');
      const existing = await this.ordenModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Orden no encontrada');
      }

      await this.ordenModel.findByIdAndUpdate(
        id,
        {
          notas: payload.notas,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de la órden ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      this.sseService.emmit(
        'ordenes',
        { modified: true, ordenId: id },
        'orden.modificada',
      );

      return ApiResponse.success(
        { updated: true },
        'Notas de la órden actualizadas correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar las notas de la órden',
      );
      handleError(error);
    }
  }

  /**
   * Asigna mecánicos a una órden existente.
   * @param id - ID de la órden.
   * @param payload - Datos de los mecánicos a asignar.
   * @param user - Usuario que realiza la acción.
   * @param ip - IP de origen.
   * @returns Una promesa que resuelve con la respuesta de la operación.
   */
  async asginMecanicos(
    id: string,
    payload: AsignarMecanicosDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Asignando mecánicos a una órden');
      const existing = await this.ordenModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Orden no encontrada');
      }

      const existingMecanicos = await this.usuarioModel.find({
        _id: { $in: payload.mecanicos },
      });

      const ids = existingMecanicos.map((mecanico) => mecanico._id);

      if (ids.length !== payload.mecanicos.length) {
        throw new NotFoundException('Uno o más mecánicos no encontrados');
      }

      await this.ordenModel.findByIdAndUpdate(
        id,
        {
          mecanicosAsignados: ids,
          estado: OrdenEstado.PENDIENTE,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de usuario ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      const mecanicos = await this.usuarioModel.find({
        _id: { $in: payload.mecanicos },
      });

      const emails = mecanicos.map((mecanico) => mecanico.correo);

      //Emite el evento y el frontend reacciona solo si el mecanico fue asignado a la orden, de lo contrario no hace nada
      this.sseService.emmit(
        'ordenes',
        { orden: id, mecanicos: emails },
        'orden.mecanicos',
      );

      //TODO generar notificaciones para los mecanicos asignados a la orden

      return ApiResponse.success(
        { updatedMecanicos: payload.mecanicos },
        `Se asignaron ${payload.mecanicos.length} mecánicos a la órden`,
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del usuario',
      );
      handleError(error);
    }
  }

  /**
   * Elimina una foto de una órden existente.
   * @param id - ID de la órden.
   * @param payload - Datos del índice de la foto a eliminar.
   * @param user - Usuario que realiza la acción.
   * @param ip - IP de origen.
   * @returns Una promesa que resuelve con la respuesta de la operación.
   */
  async deletePhoto(
    id: string,
    payload: ImagenIndexDto,
    user: AccessTokenClaims,
    ip: string,
  ) {
    try {
      this.logger.info('Eliminando foto de una órden');
      const existing = await this.ordenModel.findById(id);
      if (!existing) {
        throw new NotFoundException('Orden no encontrada');
      }
      const index = payload.index;
      if (index < 0 || index >= existing.fotosExpediente.length) {
        throw new NotFoundException('Foto no encontrada');
      }
      const [foto] = existing.fotosExpediente.splice(index, 1);

      existing.updatedBy = new Types.ObjectId(user.sub);
      await existing.save();

      await this.fileService.deleteImage(foto.imagen.publicId);

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} removió una foto de la órden ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      this.sseService.emmit(
        'ordenes',
        { modified: true, ordenId: id },
        'orden.modificada',
      );

      return ApiResponse.success(
        { updated: true },
        'Foto de la órden eliminada correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al eliminar la foto de la órden',
      );
      handleError(error);
    }
  }

  /**
   * Cuenta el número de órdenes activas y emite un evento al dashboard.
   * @returns Un objeto DashboardEvent con el resultado de la operación.
   */
  async countActive(): Promise<DashboardEvent> {
    try {
      const count = await this.ordenModel.countDocuments({
        estado: {
          $in: [
            OrdenEstado.DIAGNOSTICO,
            OrdenEstado.PENDIENTE,
            OrdenEstado.REFACCIONES,
            OrdenEstado.LISTO,
          ],
        },
      });
      return { kpi: 'ordenes', success: true, count };
    } catch (error) {
      this.logger.error({ err: error }, 'Error al contar las órdenes activos');
      return {
        kpi: 'ordenes',
        success: false,
        count: 0,
        message: 'Error al contar órdenes activos',
      };
    }
  }

  /**
   * Calcula los ingresos brutos del mes (sólo órdenes entregadas) y emite un evento al dashboard.
   * @returns Un objeto DashboardEvent con el resultado de la operación.
   */
  async ingresosBrutosDelMes(): Promise<DashboardEvent> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);

      const total = await this.ordenModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            estado: OrdenEstado.ENTREGADO,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$subtotal' },
          },
        },
      ]);

      return {
        kpi: 'ingresos',
        success: true,
        count: total[0]?.total || 0,
      };
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al calcular los ingresos brutos del mes',
      );
      return {
        kpi: 'ingresos',
        success: false,
        count: 0,
        message: 'Error al calcular los ingresos brutos del mes',
      };
    }
  }

  /**
   * Maneja la lógica de validación para cambiar el estado de una órden.
   * @param estado - El nuevo estado a asignar.
   * @param existing - La órden existente a la que se le cambiará el estado.
   */
  private handleEstado(estado: OrdenEstado, existing: Orden) {
    switch (estado) {
      case OrdenEstado.RECIBIDO:
        throw new BussinessException(
          'No se puede cambiar el estado a RECIBIDO manualmente',
        );
      case OrdenEstado.PENDIENTE:
        if (existing.estado !== OrdenEstado.RECIBIDO) {
          throw new BussinessException(
            'La órden debe estar en estado RECIBIDO para ser marcada como PENDIENTE',
          );
        }
        break;
      case OrdenEstado.DIAGNOSTICO:
        if (existing.estado !== OrdenEstado.PENDIENTE) {
          throw new BussinessException(
            'La órden debe estar pendiente para ser marcada como en diagnóstico',
          );
        }
        break;
      case OrdenEstado.REFACCIONES:
        if (existing.estado !== OrdenEstado.DIAGNOSTICO) {
          throw new BussinessException(
            'La órden debe estar en diagnóstico para ser marcada como esperando refacciones',
          );
        }
        break;
      case OrdenEstado.LISTO:
        if (
          existing.estado !== OrdenEstado.DIAGNOSTICO &&
          existing.estado !== OrdenEstado.REFACCIONES
        ) {
          throw new BussinessException(
            'La órden debe estar en diagnóstico o esperando refacciones para ser marcada como lista',
          );
        }
        break;
      case OrdenEstado.ENTREGADO:
        if (existing.estado !== OrdenEstado.LISTO) {
          throw new BussinessException(
            'La órden debe estar lista para ser entregada',
          );
        }
        break;
      case OrdenEstado.CANCELADO:
        if (
          existing.estado !== OrdenEstado.PENDIENTE &&
          existing.estado !== OrdenEstado.DIAGNOSTICO
        ) {
          throw new BussinessException(
            'No se puede cancelar una órden que ya está fue atendida o entregada',
          );
        }
    }
  }

  /**
   * Genera un número de orden único.
   * @returns Un string con el número de orden generado.
   */
  private async generarNumeroOrden(): Promise<string> {
    const contador = await this.contadorModel.findOneAndUpdate(
      { nombre: 'ordenes' },
      { $inc: { secuencia: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!contador) {
      throw new Error('No se pudo generar el número de orden');
    }

    return contador.secuencia.toString().padStart(6, '0');
  }
}

type OrdenQrPopulated = {
  cliente: Cliente;
  vehiculo: ClienteVehiculo & {
    vehiculo: Vehiculo & {
      tipo: TipoVehiculo;
    };
  };
  diagnostico?: Diagnostico & {
    responsable: Usuario;
  };
};
