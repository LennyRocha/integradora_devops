import { ServicioPublicResponse } from 'src/servicios/interfaces/servicio-public.response';
import OrdenEstado from '../entity/orden-estado';
import FotoExpedienteResponse from './foto-expediente.response';
import ClientePublicResponse from 'src/clientes/interfaces/cliente-public.response';
import RefaccionPublicResponse from 'src/refacciones/interfaces/refaccion-public.response';
import DiagnosticoPublicResponse from 'src/diagnosticos/interfaces/diagnostico-public.response';

export default interface OrdenPublicResponse {
  id: string;
  razonServicio: string;
  fotosExpediente: FotoExpedienteResponse[];
  refacciones: RefaccionPublicResponse[];
  servicios: ServicioPublicResponse[];
  subtotal: number;
  fechaEntrega?: Date;
  qrToken: string;
  numOrden: string;
  estado: OrdenEstado;
  notas?: string[];
  cliente: ClientePublicResponse;
  diagnostico?: DiagnosticoPublicResponse;
}
