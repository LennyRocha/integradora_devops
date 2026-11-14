import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario, UsuarioSchema } from './entity/usuario.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MultimediaModule } from 'src/multimedia/multimedia.module';
import { BitacoraModule } from 'src/bitacora/bitacora.module';
import { ArgonPasswordHasher } from 'src/auth/infra/crypto/argon-password.hasher';
import { PASSWORD_HASHER } from 'src/auth/interfaces/token-ports';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Usuario.name,
        schema: UsuarioSchema,
      },
    ]),
    MultimediaModule,
    BitacoraModule,
  ],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    {
      provide: PASSWORD_HASHER,
      useClass: ArgonPasswordHasher,
    },
  ],
})
export class UsuariosModule {}
