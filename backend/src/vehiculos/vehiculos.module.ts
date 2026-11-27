import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import {
  TipoVehiculo,
  TipoVehiculoSchema,
} from './entity/tipo-vehiculo.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BitacoraModule } from 'src/bitacora/bitacora.module';
import { Vehiculo, VehiculoSchema } from './entity/vehiculo.schema';
import { TiposVehiculosController } from './tipos-vehiculos.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TipoVehiculo.name,
        schema: TipoVehiculoSchema,
      },
      {
        name: Vehiculo.name,
        schema: VehiculoSchema,
      },
    ]),
    BitacoraModule,
  ],
  providers: [VehiculosService],
  controllers: [VehiculosController, TiposVehiculosController],
  exports: [VehiculosService],
})
export class VehiculosModule {}
