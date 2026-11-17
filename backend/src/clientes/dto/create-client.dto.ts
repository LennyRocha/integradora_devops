import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateClientVehicleDto } from './create-client-vehicle.dto';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  @MaxLength(75, {
    message: 'El nombre no puede tener más de 75 caracteres',
  })
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsNotEmpty({
    message: 'El apellido paterno es obligatorio',
  })
  @MaxLength(50, {
    message: 'El apellido paterno no puede tener más de 50 caracteres',
  })
  apellidoP!: string;

  @ApiPropertyOptional({ example: 'López' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El apellido materno no puede tener más de 50 caracteres',
  })
  apellidoM?: string;

  @ApiPropertyOptional({ example: '5551234567' })
  @IsPhoneNumber('MX', {
    message: 'El número de teléfono no es válido',
  })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ type: [CreateClientVehicleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @MinLength(1, {
    message: 'Debe proporcionar al menos un vehículo',
  })
  @MaxLength(10, {
    message: 'No puede proporcionar más de 10 vehículos',
  })
  vehiculos?: CreateClientVehicleDto[];
}
