import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Cambio de aceite' })
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  @MaxLength(50, {
    message: 'El nombre no puede tener más de 50 caracteres',
  })
  nombre!: string;

  @ApiProperty({ example: 'Cambio de aceite y filtro de aceite' })
  @IsNotEmpty({
    message: 'La descripción es obligatoria',
  })
  @MaxLength(100, {
    message: 'La descripción no puede tener más de 100 caracteres',
  })
  descripcion!: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty({
    message: 'El costo es obligatorio',
  })
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
  costo!: number;
}
