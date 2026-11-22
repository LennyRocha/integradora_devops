import FotoTipo from '../entity/foto-tipo';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FotoTipoDto {
  @ApiProperty({ example: FotoTipo.DIAGNOSTICO, enum: FotoTipo })
  @IsNotEmpty({
    message: 'El tipo es obligatorio',
  })
  @IsEnum(FotoTipo, {
    message:
      'El tipo debe ser uno de los siguientes: DIAGNOSTICO, ENTREGA, RECEPCION, REPARACION',
  })
  tipo!: FotoTipo;
}
