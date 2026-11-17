export type SseEvents =
  | 'orden.nueva'
  | 'orden.estado'
  | 'orden.modificada'
  | 'orden.finalizada'
  | 'orden.diagnostico'
  | 'seguimiento.actualizado'
  | 'notificacion.nueva'
  | 'notificacion.leida'
  | 'dashboard.estadisticas'
  | 'dashboard.movimientos';
