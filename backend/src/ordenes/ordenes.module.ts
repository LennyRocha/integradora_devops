import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { BitacoraModule } from 'src/bitacora/bitacora.module';
import { Orden, OrdenSchema } from './entity/orden.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Diagnostico,
  DiagnosticoSchema,
} from 'src/diagnosticos/entity/diagnostico.schema';
import { MultimediaModule } from 'src/multimedia/multimedia.module';
import { Usuario, UsuarioSchema } from 'src/usuarios/entity/usuario.schema';
import { Servicio, ServicioSchema } from 'src/servicios/entity/servicio.schema';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Contador, ContadorSchema } from './entity/contador.schema';
import { SseModule } from 'src/sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Orden.name,
        schema: OrdenSchema,
      },
      {
        name: Diagnostico.name,
        schema: DiagnosticoSchema,
      },
      {
        name: Usuario.name,
        schema: UsuarioSchema,
      },
      {
        name: Servicio.name,
        schema: ServicioSchema,
      },
      { name: Contador.name, schema: ContadorSchema },
    ]),
    BitacoraModule,
    MultimediaModule,
    DashboardModule,
    UsuariosModule,
    SseModule,
  ],
  providers: [OrdenesService],
  controllers: [OrdenesController],
})
export class OrdenesModule {}
