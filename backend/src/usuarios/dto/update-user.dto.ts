import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional({
    message: 'El nombre es obligatorio',
  })
  @MaxLength(75, {
    message: 'El nombre no puede tener más de 75 caracteres',
  })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional({
    message: 'El apellido paterno es obligatorio',
  })
  @MaxLength(50, {
    message: 'El apellido paterno no puede tener más de 50 caracteres',
  })
  apellidoP?: string;

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
}
