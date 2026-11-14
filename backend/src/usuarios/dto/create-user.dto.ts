import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import Rol from '../entity/rol';

export class CreateUserDto {
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

  @ApiProperty({ example: 'juanperez@example.com' })
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  correo!: string;

  @ApiPropertyOptional({ example: '5551234567' })
  @IsPhoneNumber('MX', {
    message: 'El número de teléfono no es válido',
  })
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'juanPASS123&' })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(15, {
    message: 'La contraseña no puede tener más de 15 caracteres',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña del usuario debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un símbolo',
    },
  )
  contra!: string;

  @ApiProperty({ example: Rol.MECANICO, enum: Rol })
  @IsNotEmpty({
    message: 'El rol es obligatorio',
  })
  @IsEnum(Rol, {
    message:
      'El rol debe ser uno de los siguientes: admin, mecanico, recepcionista',
  })
  rol!: Rol;
}
