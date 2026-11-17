import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente, ClienteSchema } from './entity/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BitacoraModule } from 'src/bitacora/bitacora.module';
import {
  ClienteVehiculo,
  ClienteVehiculoSchema,
} from './entity/cliente-vehiculo.schema';
import { VehiculosModule } from 'src/vehiculos/vehiculos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cliente.name,
        schema: ClienteSchema,
      },
      {
        name: ClienteVehiculo.name,
        schema: ClienteVehiculoSchema,
      },
    ]),
    BitacoraModule,
    VehiculosModule,
  ],
  providers: [ClientesService],
  controllers: [ClientesController],
  exports: [ClientesService],
})
export class ClientesModule {}
