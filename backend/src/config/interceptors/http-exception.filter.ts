import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse, type ErrorOrigin } from '../api.response';
import { MongoException } from '../exceptions/mongo-exception';
import { BussinessException } from '../exceptions/bussiness-exception';
import { ValidationException } from '../exceptions/validation-exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let code: ErrorOrigin = 'SERVER_ERROR';
    let obj = {
      message: '',
      details: null as Record<string, unknown> | null,
    };

    if (exception instanceof ValidationException) {
      const errors = exception.errors;
      const message = exception.message;
      status = exception.getStatus();
      code = 'VALIDATION_ERROR';

      obj = { message, details: errors };
    } else if (exception instanceof MongoException) {
      const name = exception.name;
      status = exception.getStatus();
      code = 'DATABASE_ERROR';

      obj = messageAndDetailsFromException(
        exception,
        `Error de base de datos: ${name}`,
      );
    } else if (exception instanceof BussinessException) {
      status = exception.getStatus();
      code = 'BUSSINESS_ERROR';

      obj = messageAndDetailsFromException(exception, 'Error de negocio');
    } else if (exception instanceof UnauthorizedException) {
      status = exception.getStatus();
      code = 'AUTH_ERROR';

      obj = messageAndDetailsFromException(exception, 'No autorizado');
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      obj = messageAndDetailsFromException(
        exception,
        'Error en la operación HTTP',
      );
    }

    const payload = ApiResponse.error(
      code,
      obj.message,
      status,
      request.url,
      request.method,
      obj.details,
    );
    response.status(status).json(payload);
  }
}

function messageAndDetailsFromException(
  exception: HttpException,
  fallbackMessage: string,
) {
  const body = exception.getResponse();

  const message = typeof body === 'string' ? body : fallbackMessage;

  const details =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : null;

  return { message, details };
}
