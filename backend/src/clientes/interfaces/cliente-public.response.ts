import ClienteVehiculoPublicResponse from './cliente-vehiculo-public.response';

export default interface ClientePublicResponse {
  nombreCompleto: string;
  telefono: string;
  status: boolean;
  vehiculo: ClienteVehiculoPublicResponse;
}
