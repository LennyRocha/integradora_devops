// Se obtiene la IP del cliente desde el request de Express para la bitácora de auditoría. Se utiliza un decorador para inyectar la IP en los controladores de NestJS.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Ip = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const ip = request.ip ?? request.socket.remoteAddress ?? '';

    // Convierte direcciones IPv4 representadas como IPv6.
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }

    return ip;
  },
);
