import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  @MaxLength(50)
  correo!: string;

  @ApiPropertyOptional({ example: 'user123' })
  @IsString()
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(12)
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
