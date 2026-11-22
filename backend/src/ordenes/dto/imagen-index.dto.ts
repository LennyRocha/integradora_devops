import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class ImagenIndexDto {
  @ApiProperty({
    example: 0,
    description: 'El índice de la imagen en la lista',
  })
  @IsNotEmpty({
    message: 'El índice es obligatorio',
  })
  @IsInt({
    message: 'El índice debe ser un número entero',
  })
  @Min(0, {
    message: 'El índice debe ser un número entero mayor o igual a 0',
  })
  @Max(3, {
    message: 'El índice debe ser un número entero menor o igual a 3',
  })
  index!: number;
}
