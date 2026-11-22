import { Module } from '@nestjs/common';
import { DiagnosticosService } from './diagnosticos.service';
import { DiagnosticosController } from './diagnosticos.controller';
import { BitacoraModule } from 'src/bitacora/bitacora.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Diagnostico,
  DiagnosticoSchema,
} from 'src/diagnosticos/entity/diagnostico.schema';
import { Orden, OrdenSchema } from 'src/ordenes/entity/orden.schema';

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
    ]),
    BitacoraModule,
  ],
  providers: [DiagnosticosService],
  controllers: [DiagnosticosController],
})
export class DiagnosticosModule {}
