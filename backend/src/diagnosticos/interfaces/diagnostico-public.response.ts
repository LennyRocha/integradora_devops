export default interface DiagnosticoPublicResponse {
  resumen: string;
  observaciones?: string[];
  cargoAdicional: number;
  responsable: string;
}
