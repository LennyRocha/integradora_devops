import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { IsUniquePrimitiveArray } from 'src/config/decorators/isUniqueArray.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';

export class CreateOrdenDto {
  @ApiProperty({ example: 'Cambio de aceite y filtro' })
  @IsNotEmpty({
    message: 'El motivo de la orden es obligatorio',
  })
  @MaxLength(100, {
    message: 'El motivo de la orden no puede tener más de 100 caracteres',
  })
  razonServicio!: string;

  @ApiPropertyOptional({ example: ['Nota 1', 'Nota 2'] })
  @IsOptional()
  @IsArray({
    message: 'Las notas deben ser un array',
  })
  @IsUniquePrimitiveArray({
    message: 'Las notas no pueden repetirse',
  })
  @MinArraySize(1, {
    message: 'Debe haber al menos una nota',
  })
  @MaxArraySize(10, {
    message: 'No puede haber más de 10 notas',
  })
  @MaxLength(50, {
    each: true,
    message: 'Cada nota no puede tener más de 50 caracteres',
  })
  notas?: string[];

  @ApiProperty({ example: '5f9b3c1d2e4f5a6b7c8d9e0f' })
  @IsNotEmpty({
    message: 'El vehículo es obligatorio',
  })
  @IsMongoId({
    message: 'El vehículo debe ser un ObjectId válido',
  })
  vehiculo!: string;

  @ApiProperty({ example: '5f9b3c1d2e4f5a6b7c8d9e0f' })
  @IsNotEmpty({
    message: 'El cliente es obligatorio',
  })
  @IsMongoId({
    message: 'El cliente debe ser un ObjectId válido',
  })
  cliente!: string;
}
