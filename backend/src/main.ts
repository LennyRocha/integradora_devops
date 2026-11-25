/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationException } from './config/exceptions/validation-exception';
import { ValidationError } from 'class-validator';
import formatErrors from './utils/format-dto-errors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3003;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(
          'Error de validación',
          formatErrors(errors),
        );
      },
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Generar documento OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Sistema de taller mecánico')
    .setDescription(
      'API de gestión de usuarios y autenticación para el sistema de taller mecánico desarrollado con NestJS y MongoDB.',
    )
    .setVersion('1.0')
    .build();

  // Swagger UI en /api
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //Scalar en /docs
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  // CORS: solo aceptamos el origen del api-gateway (allowlist).
  const devOrigins = ['http://127.0.0.1:2000', 'http://localhost:5173'];
  const origin = process.env.DEBUG === 'true' ? '*' : process.env.FRONTEND_URL;
  app.enableCors({
    origin: [origin, ...devOrigins],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'QUERY', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    console.log(`Scalar docs en http://localhost:${port}/docs`);
    console.log(`OpenAPI JSON en http://localhost:${port}/api-json`);
  });
}

bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});
