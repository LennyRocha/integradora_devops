import { Module } from '@nestjs/common';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { Servicio, ServicioSchema } from './entity/servicio.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BitacoraModule } from 'src/bitacora/bitacora.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Servicio.name, schema: ServicioSchema },
    ]),
    BitacoraModule,
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
