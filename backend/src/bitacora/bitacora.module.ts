import { Module } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';

@Module({
  providers: [BitacoraService]
})
export class BitacoraModule {}
