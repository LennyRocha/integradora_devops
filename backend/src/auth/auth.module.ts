import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JoseTokenSigner } from './infra/jwt/jose-token.signer';
import { ArgonPasswordHasher } from './infra/crypto/argon-password.hasher';
import { PASSWORD_HASHER, TOKEN_SIGNER } from './interfaces/token-ports';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { RolGuard } from './guards/rol.guard';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schema/refresh-token.schema';
import { Usuario, UsuarioSchema } from 'src/usuarios/entity/usuario.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
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
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolGuard },
  ],
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
