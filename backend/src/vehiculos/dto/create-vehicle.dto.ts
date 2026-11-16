import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Honda' })
  @IsNotEmpty({
    message: 'La marca es obligatoria',
  })
  @MaxLength(25, {
    message: 'La marca no puede tener más de 25 caracteres',
  })
  marca!: string;

  @ApiProperty({ example: 'Civic' })
  @IsNotEmpty({
    message: 'El modelo es obligatorio',
  })
  @MaxLength(25, {
    message: 'El modelo no puede tener más de 25 caracteres',
  })
  modelo!: string;

  @ApiProperty({ example: 2020 })
  @IsNotEmpty({
    message: 'El año es obligatorio',
  })
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'El año debe ser un número entero' },
  )
  @Min(1900, {
    message: 'El año no puede ser menor a 1900',
  })
  @Max(new Date().getFullYear(), {
    message: `El año no puede ser mayor a ${new Date().getFullYear()}`,
  })
  ano!: number;

  @ApiProperty({ example: '5f9b3c1d2e4f5a6b7c8d9e0f' })
  @IsNotEmpty({
    message: 'El tipo de vehículo es obligatorio',
  })
  @IsMongoId({
    message: 'El tipo de vehículo debe ser un ObjectId válido',
  })
  tipo!: string;
}
