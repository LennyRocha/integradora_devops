import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsMongoId,
} from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Honda' })
  @IsOptional()
  @MaxLength(25, {
    message: 'La marca no puede tener más de 25 caracteres',
  })
  marca!: string;

  @ApiPropertyOptional({ example: 'Civic' })
  @IsOptional()
  @MaxLength(25, {
    message: 'El modelo no puede tener más de 25 caracteres',
  })
  modelo?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
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
  ano?: number;

  @ApiPropertyOptional({ example: '5f9b3c1d2e4f5a6b7c8d9e0f' })
  @IsOptional()
  @IsMongoId({
    message: 'El tipo de vehículo debe ser un ObjectId válido',
  })
  tipo?: string;
}
