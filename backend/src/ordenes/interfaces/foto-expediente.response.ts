import { MongoImage } from 'src/utils/mongo.image';
import FotoTipo from '../entity/foto-tipo';

export default interface FotoExpedienteResponse {
  imagen: MongoImage;
  tipo: FotoTipo;
  uploadedBy: string;
  fecha: Date;
}
