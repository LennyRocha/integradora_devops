import { Injectable, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SseChannels } from './tags/sse.channels';
import { fromEvent, map, Observable } from 'rxjs';

@Injectable()
export class SseService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emite un evento SSE a un canal específico con los datos proporcionados.
   * @param channel - El canal al que se emitirá el evento, del tipo SseChannels.
   * @param data - Los datos que se enviarán en el evento.
   * @param tag - Una etiqueta opcional para identificar el evento.
   */
  emmit(channel: SseChannels, data: object, event: string): void {
    this.eventEmitter.emit(channel, { event, data });
  }

  /**
   * Crea un observable que emite eventos SSE de un canal específico.
   * @param channel - El canal del que se obtendrán los eventos, del tipo SseChannels.
   * @returns Un observable que emite eventos MessageEvent.
   */
  sse(channel: SseChannels): Observable<MessageEvent> {
    const emitter = this.eventEmitter;
    return fromEvent(emitter, channel).pipe(
      map((payload) => ({
        data: JSON.stringify(payload),
      })),
    );
  }
}
