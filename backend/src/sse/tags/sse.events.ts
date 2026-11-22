export type SseEvents =
  | 'orden.nueva'
  | 'orden.estado'
  | 'orden.modificada'
  | 'orden.finalizada'
  | 'orden.diagnostico'
  | 'orden.mecanicos'
  | 'seguimiento.actualizado'
  | 'notificacion.nueva'
  | 'notificacion.leida'
  | 'dashboard.estadisticas'
  | 'dashboard.movimientos';
