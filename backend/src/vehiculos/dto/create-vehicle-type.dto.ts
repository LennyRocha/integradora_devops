import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateVehicleTypeDto {
  @ApiProperty({ example: 'Cambio de aceite' })
  @IsNotEmpty({
    message: 'El tipo a agregar es obligatorio',
  })
  @MaxLength(25, {
    message: 'El tipo no puede tener más de 25 caracteres',
  })
  tipo!: string;
}
