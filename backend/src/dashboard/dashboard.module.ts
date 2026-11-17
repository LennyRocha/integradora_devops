import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SseModule } from 'src/sse/sse.module';
import { DashboardController } from './dashboard.controller';
import { Usuario, UsuarioSchema } from 'src/usuarios/entity/usuario.schema';
import { Cliente, ClienteSchema } from 'src/clientes/entity/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';

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
    ]),
    SseModule,
  ],
  providers: [DashboardService],
  exports: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
