/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SseService } from 'src/sse/sse.service';
import { DashboardEvent } from './interfaces/dashboard-event';
import { ApiResponse } from 'src/config/api.response';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { handleError } from 'src/config/utils/handle-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente } from 'src/clientes/entity/cliente.schema';
import { Usuario } from 'src/usuarios/entity/usuario.schema';
import { Orden } from 'src/ordenes/entity/orden.schema';
import OrdenEstado from 'src/ordenes/entity/orden-estado';

@Injectable()
export class DashboardService {
  constructor(
    @InjectPinoLogger(DashboardService.name)
    private readonly logger: PinoLogger,
    @InjectModel(Cliente.name)
    private readonly clienteModel: Model<Cliente>,
    @InjectModel(Orden.name)
    private readonly ordenModel: Model<Orden>,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
    private readonly sseService: SseService,
  ) {}

  /**
   * Obtiene los datos del dashboard, incluyendo el número de clientes activos, órdenes activas, personal activo e ingresos brutos.
   * @returns Un objeto con los datos del dashboard.
   **/
  async getDashboard() {
    try {
      this.logger.info('Obteniendo dashboard');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      const dashboard = await Promise.all([
        this.clienteModel.countDocuments({ status: true }),
        this.ordenModel.countDocuments({
          estado: {
            $in: [
              OrdenEstado.DIAGNOSTICO,
              OrdenEstado.PENDIENTE,
              OrdenEstado.REFACCIONES,
              OrdenEstado.LISTO,
            ],
          },
        }),
        this.usuarioModel.countDocuments({ status: true }),
        this.ordenModel.aggregate([
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
        ]),
      ]).then(([clientes, ordenes, usuarios, ingresos]) => {
        return {
          clientesActivos: clientes,
          ordenesActivas: ordenes,
          personalActivo: usuarios,
          ingresosBrutos: ingresos.length > 0 ? ingresos[0]?.total : 0,
        };
      });
      this.logger.info({ dashboard }, 'Dashboard obtenido correctamente');
      return ApiResponse.success(dashboard, 'Dashboard obtenido correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener dashboard');
      handleError(error);
    }
  }

  /**
   * Actualiza un KPI en el dashboard.
   * @param kpi - El KPI a actualizar.
   * @param count - El nuevo valor del KPI.
   */
  updateDashboardKpi(event: DashboardEvent): void {
    this.sseService.emmit('dashboard', event, 'dashboard.estadisticas');
  }
}
