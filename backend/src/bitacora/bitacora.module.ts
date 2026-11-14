import { Module } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { Bitacora, BitacoraSchema } from './entity/bitacora.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bitacora.name,
        schema: BitacoraSchema,
      },
    ]),
  ],
  exports: [BitacoraService],
  providers: [BitacoraService],
  controllers: [BitacoraController],
})
export class BitacoraModule {}
