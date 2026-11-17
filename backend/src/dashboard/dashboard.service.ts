/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SseService } from 'src/sse/sse.service';
import { DashboardEvent } from './interfaces/dashboard-event';
import { ClientesService } from 'src/clientes/clientes.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { ApiResponse } from 'src/config/api.response';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { handleError } from 'src/config/utils/handle-error';
@Injectable()
export class DashboardService {
  constructor(
    @InjectPinoLogger(DashboardService.name)
    private readonly logger: PinoLogger,
    private readonly sseService: SseService,
    private readonly clientesService: ClientesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * Obtiene los datos del dashboard, incluyendo el número de clientes activos, órdenes activas, personal activo e ingresos brutos.
   * @returns Un objeto con los datos del dashboard.
   **/
  async getDashboard() {
    try {
      this.logger.info('Obteniendo dashboard');
      const dashboard = await Promise.all([
        this.clientesService.countActive(),
        this.usuariosService.countActive(),
      ]).then(([clientes, usuarios]) => {
        return {
          clientesActivos: clientes.count,
          ordenesActivas: 0,
          personalActivo: usuarios.count,
          ingresosBrutos: 0,
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
