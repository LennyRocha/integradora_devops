import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateClientVehicleDto {
  @ApiProperty({ example: 'ABC123' })
  @IsNotEmpty({
    message: 'Las placas son obligatorias',
  })
  @MaxLength(15, {
    message: 'Las placas no puede tener más de 15 caracteres',
  })
  placas!: string;

  @ApiProperty({ example: 'Rojo' })
  @IsNotEmpty({
    message: 'El color es obligatorio',
  })
  @MaxLength(20, {
    message: 'El color no puede tener más de 20 caracteres',
  })
  color!: string;

  @ApiProperty({ example: 'Puertas color negro, chasis oxidado' })
  @IsNotEmpty({
    message: 'El detalle de la referencia es obligatorio',
  })
  @MaxLength(50, {
    message: 'El detalle de la referencia no puede tener más de 50 caracteres',
  })
  detallesReferencia!: string;

  @ApiProperty({ example: '5f9b3c1d2e4f5a6b7c8d9e0f' })
  @IsNotEmpty({
    message: 'El vehículo es obligatorio',
  })
  @IsMongoId({
    message: 'El vehículo debe ser un ObjectId válido',
  })
  vehiculo!: string;
}
