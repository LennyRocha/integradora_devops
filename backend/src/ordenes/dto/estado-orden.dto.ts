import { IsEnum, IsNotEmpty } from 'class-validator';
import OrdenEstado from '../entity/orden-estado';
import { ApiProperty } from '@nestjs/swagger';

export class EstadoOrdenDto {
  @ApiProperty({ example: OrdenEstado.DIAGNOSTICO, enum: OrdenEstado })
  @IsNotEmpty({
    message: 'El estado es obligatorio',
  })
  @IsEnum(OrdenEstado, {
    message:
      'El estado debe ser uno de los siguientes: DIAGNOSTICO, REFACCIONES, LISTO, ENTREGADO, CANCELADO',
  })
  estado!: OrdenEstado;
}
