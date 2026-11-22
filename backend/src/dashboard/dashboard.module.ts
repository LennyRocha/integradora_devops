import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SseModule } from 'src/sse/sse.module';
import { DashboardController } from './dashboard.controller';
import { Usuario, UsuarioSchema } from 'src/usuarios/entity/usuario.schema';
import { Cliente, ClienteSchema } from 'src/clientes/entity/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Orden, OrdenSchema } from 'src/ordenes/entity/orden.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Usuario.name,
        schema: UsuarioSchema,
      },
      {
        name: Cliente.name,
        schema: ClienteSchema,
      },
      {
        name: Orden.name,
        schema: OrdenSchema,
      },
    ]),
    SseModule,
  ],
  providers: [DashboardService],
  exports: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
