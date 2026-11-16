import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  Max,
  MaxLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRefactionDto {
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
  @MaxLength(75, {
    message: 'La descripción no puede tener más de 75 caracteres',
  })
  descripcion!: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty({
    message: 'El costo es obligatorio',
  })
  @IsDecimal(
    { decimal_digits: '0,2', force_decimal: false, locale: 'en-US' },
    {
      message: 'El costo debe ser un número decimal',
    },
  )
  @Max(999999.99, {
    message: 'El costo no puede ser mayor a 999999.99',
  })
  costo!: Types.Decimal128;

  @ApiProperty({ example: 10 })
  @IsNotEmpty({
    message: 'La cantidad es obligatoria',
  })
  @Max(999999, {
    message: 'La cantidad no puede ser mayor a 999999',
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'La cantidad debe ser un número' },
  )
  cantidad!: number;
}
