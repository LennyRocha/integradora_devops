import { Controller, Sse, MessageEvent, Get, Header } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { Public } from 'src/config/decorators/public.decorator';

//Controller para probar el funcionamiento del SSE, se puede eliminar después de las pruebas
@Controller('sse')
export class SseController {
  constructor(private readonly service: SseService) {}

  private readonly listaDePrueba = [
    { id: 1, nombre: 'Juan', mensaje: 'Hola desde el servidor' },
    { id: 2, nombre: 'María', mensaje: '¡Bienvenido!' },
    { id: 3, nombre: 'Pedro', mensaje: '¡Adiós!' },
  ];

  @Public()
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  @Sse('test')
  sseOrdenes(): Observable<MessageEvent> {
    return this.service.sse('ordenes');
  }

  @Public()
  @Get()
  emmitOrdenes() {
    let counter = 0;
    const interval = setInterval(() => {
      this.service.emmit('ordenes', this.listaDePrueba, `test-${counter}`);
      counter++;
      if (counter >= 10) {
        clearInterval(interval);
        this.service.emmit(
          'ordenes',
          { message: 'Fin de la transmisión' },
          'test',
        );
      }
    }, 3000);
    return { success: true, message: 'Evento emitido correctamente' };
  }
}
