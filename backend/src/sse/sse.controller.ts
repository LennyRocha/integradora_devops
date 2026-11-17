import { Controller, Sse, MessageEvent, Get, Header } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { Public } from 'src/config/decorators/public.decorator';
import { HasRol } from 'src/config/decorators/has-rol.decorator';

@Controller('sse')
export class SseController {
  constructor(private readonly service: SseService) {}

  @HasRol(['todos'])
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  //@Header('Access-Control-Allow-Origin', '*') Descomentar en producción si se necesita permitir solicitudes desde cualquier origen
  @Sse('ordenes')
  sseOrdenes(): Observable<MessageEvent> {
    return this.service.sse('ordenes');
  }

  @HasRol(['administrador'])
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  //@Header('Access-Control-Allow-Origin', '*') Descomentar en producción si se necesita permitir solicitudes desde cualquier origen
  @Sse('dashboard')
  sseDashboard(): Observable<MessageEvent> {
    return this.service.sse('dashboard');
  }

  @HasRol(['todos'])
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  //@Header('Access-Control-Allow-Origin', '*') Descomentar en producción si se necesita permitir solicitudes desde cualquier origen
  @Sse('notificaciones')
  sseNotificaciones(): Observable<MessageEvent> {
    return this.service.sse('notificaciones');
  }

  @Public()
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  //@Header('Access-Control-Allow-Origin', '*') Descomentar en producción si se necesita permitir solicitudes desde cualquier origen
  @Sse('seguimiento  ')
  sseSeguimiento(): Observable<MessageEvent> {
    return this.service.sse('seguimiento');
  }

  private readonly listaDePrueba = [
    { id: 1, nombre: 'Juan', mensaje: 'Hola desde el servidor' },
    { id: 2, nombre: 'María', mensaje: '¡Bienvenido!' },
    { id: 3, nombre: 'Pedro', mensaje: '¡Adiós!' },
  ];

  @Public()
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  @Header('Access-Control-Allow-Origin', '*') // Permitir solicitudes desde cualquier origen
  @Sse('test')
  sseTest(): Observable<MessageEvent> {
    return this.service.sse('ordenes');
  }

  @Public()
  @Get()
  emmitOrdenes() {
    let counter = 0;
    const interval = setInterval(() => {
      this.service.emmit('ordenes', this.listaDePrueba, 'orden.nueva');
      counter++;
      if (counter >= 10) {
        clearInterval(interval);
        this.service.emmit(
          'ordenes',
          { message: 'Fin de la transmisión' },
          'orden.finalizada',
        );
      }
    }, 3000);
    return { success: true, message: 'Evento emitido correctamente' };
  }
}
