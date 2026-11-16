import { Module } from '@nestjs/common';
import { RefaccionesService } from './refacciones.service';
import { RefaccionesController } from './refacciones.controller';

@Module({
  providers: [RefaccionesService],
  controllers: [RefaccionesController],
})
export class RefaccionesModule {}
