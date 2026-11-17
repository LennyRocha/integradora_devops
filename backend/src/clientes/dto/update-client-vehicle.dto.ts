import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateClientVehicleDto {
  @ApiPropertyOptional({ example: 'ABC123' })
  @IsOptional()
  @MaxLength(15, {
    message: 'Las placas no puede tener más de 15 caracteres',
  })
  placas?: string;

  @ApiPropertyOptional({ example: 'Rojo' })
  @IsOptional()
  @MaxLength(20, {
    message: 'El color no puede tener más de 20 caracteres',
  })
  color?: string;

  @ApiPropertyOptional({ example: 'Puertas color negro, chasis oxidado' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El detalle de la referencia no puede tener más de 50 caracteres',
  })
  detallesReferencia?: string;
}
