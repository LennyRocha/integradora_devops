import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SseModule } from 'src/sse/sse.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [SseModule, ClientesModule, UsuariosModule],
  providers: [DashboardService],
  exports: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
