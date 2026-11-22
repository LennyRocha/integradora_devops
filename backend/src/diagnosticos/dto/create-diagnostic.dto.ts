import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsDecimal,
  Matches,
} from 'class-validator';
import { IsUniquePrimitiveArray } from 'src/config/decorators/isUniqueArray.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';

export class CreateDiagnosticDto {
  @ApiProperty({ example: 'Se detectó un problema con el motor' })
  @IsNotEmpty({
    message: 'El resumen del dianóstico es obligatorio',
  })
  @MaxLength(100, {
    message: 'El resumen del diagnóstico no puede tener más de 100 caracteres',
  })
  resumen!: string;

  @ApiPropertyOptional({ example: ['Nota 1', 'Nota 2'] })
  @IsOptional()
  @IsArray({
    message: 'Las observaciones deben ser un array',
  })
  @IsUniquePrimitiveArray({
    message: 'Las observaciones no pueden repetirse',
  })
  @MinArraySize(1, {
    message: 'Debe haber al menos una observación',
  })
  @MaxArraySize(10, {
    message: 'No puede haber más de 10 observaciones',
  })
  @MaxLength(50, {
    each: true,
    message: 'Cada observación no puede tener más de 50 caracteres',
  })
  observaciones?: string[];

  @ApiPropertyOptional({ example: '150.00' })
  @IsOptional()
  @IsDecimal(
    {
      decimal_digits: '0,2',
      locale: 'en-US',
    },
    {
      message:
        'El cargo adicional debe ser un número decimal con hasta 2 decimales',
    },
  )
  @Matches(/^(?!0+(?:\.0{1,2})?$)\d{1,6}(\.\d{1,2})?$/, {
    message: 'El cargo adicional debe ser mayor a 0 y no superar 999999.99',
  })
  cargoAdicional?: string;
}
