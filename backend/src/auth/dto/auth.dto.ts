import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  @MaxLength(50)
  correo!: string;

  @ApiPropertyOptional({ example: 'user123' })
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
  contrasena!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty({
    message: 'El refresh token es obligatorio',
  })
  refreshToken!: string;
}

export class LogoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ example: 'josePASS123$' })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(12, {
    message: 'La contraseña no puede tener más de 12 caracteres',
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
}
