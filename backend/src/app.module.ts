import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './config/interceptors/http-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { MultimediaModule } from './multimedia/multimedia.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ServiciosModule } from './servicios/servicios.module';
import { RefaccionesModule } from './refacciones/refacciones.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ClientesModule } from './clientes/clientes.module';
import { RolGuard } from './auth/guards/rol.guard';
import { JwtGuard } from './auth/guards/jwt.guard';
import { ArgonPasswordHasher } from './auth/infra/crypto/argon-password.hasher';
import { SseModule } from './sse/sse.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { DiagnosticosModule } from './diagnosticos/diagnosticos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.DEBUG === 'true' ? 'debug' : 'info',
        transport:
          process.env.DEBUG === 'true'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
      },
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/taller_db',
    ),
    AuthModule,
    UsuariosModule,
    MultimediaModule,
    BitacoraModule,
    ServiciosModule,
    RefaccionesModule,
    VehiculosModule,
    ClientesModule,
    SseModule,
    DashboardModule,
    OrdenesModule,
    DiagnosticosModule,
  ],
  controllers: [AppController],
  providers: [
    ArgonPasswordHasher,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolGuard },
  ],
})
export class AppModule {}
