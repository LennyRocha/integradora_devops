import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { HasRol } from 'src/config/decorators/has-rol.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @HasRol(['administrador'])
  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
