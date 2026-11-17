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
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: '5551234567' })
  @IsNotEmpty({
    message: 'El número de teléfono es obligatorio',
  })
  @MaxLength(10, {
    message: 'El número de teléfono no puede tener más de 10 caracteres',
  })
  @MinLength(10, {
    message: 'El número de teléfono no puede tener menos de 10 caracteres',
  })
  @IsPhoneNumber('MX', {
    message: 'El número de teléfono no es válido',
  })
  telefono!: string;

  @ApiPropertyOptional({ type: [CreateClientVehicleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClientVehicleDto)
  @MinArraySize(1, {
    message: 'Debe proporcionar al menos un vehículo',
  })
  @MaxArraySize(10, {
    message: 'No puede proporcionar más de 10 vehículos',
  })
  vehiculos?: CreateClientVehicleDto[];
}
