import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JoseTokenSigner } from './infra/jwt/jose-token.signer';
import { PASSWORD_HASHER, TOKEN_SIGNER } from './interfaces/token-ports';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schema/refresh-token.schema';
import { Usuario, UsuarioSchema } from 'src/usuarios/entity/usuario.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ArgonPasswordHasher } from './infra/crypto/argon-password.hasher';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    UsuariosModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JoseTokenSigner,
    ArgonPasswordHasher,
    {
      provide: TOKEN_SIGNER,
      useExisting: JoseTokenSigner,
    },
    {
      provide: PASSWORD_HASHER,
      useExisting: ArgonPasswordHasher,
    },
  ],
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
