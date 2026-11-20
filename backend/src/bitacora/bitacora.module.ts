import { Module } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { Bitacora, BitacoraSchema } from './entity/bitacora.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SseModule } from 'src/sse/sse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bitacora.name,
        schema: BitacoraSchema,
      },
    ]),
    SseModule,
  ],
  exports: [BitacoraService],
  providers: [BitacoraService],
  controllers: [BitacoraController],
})
export class BitacoraModule {}
