import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Cambio de aceite' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El nombre no puede tener más de 50 caracteres',
  })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Cambio de aceite y filtro de aceite' })
  @IsOptional()
  @MaxLength(75, {
    message: 'La descripción no puede tener más de 75 caracteres',
  })
  descripcion?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo debe ser un número con máximo 2 decimales' },
  )
  @Min(0, {
    message: 'El costo no puede ser menor a 0',
  })
  @Max(999999.99, {
    message: 'El costo no puede ser mayor a 999999.99',
  })
  costo?: number;
}
