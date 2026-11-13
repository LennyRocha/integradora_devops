import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './config/interceptors/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MultimediaModule } from './multimedia/multimedia.module';
import { BitacoraModule } from './bitacora/bitacora.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/taller_db',
    ),
    AuthModule,
    UsuariosModule,
    MultimediaModule,
    BitacoraModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
