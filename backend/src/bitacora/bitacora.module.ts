import { Module } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';

@Module({
  providers: [BitacoraService],
  controllers: [BitacoraController],
})
export class BitacoraModule {}
