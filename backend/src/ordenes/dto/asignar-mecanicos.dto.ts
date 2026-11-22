import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { IsUniquePrimitiveArray } from 'src/config/decorators/isUniqueArray.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';

export class AsignarMecanicosDto {
  @ApiProperty({ example: ['servicio1', 'servicio2'] })
  @IsNotEmpty({
    message: 'Los mecanicos son obligatorios',
  })
  @IsArray({
    message: 'Los mecanicos deben ser un array',
  })
  @IsUniquePrimitiveArray({
    message: 'Los mecanicos no pueden repetirse',
  })
  @MinArraySize(1, {
    message: 'Debe haber al menos un mecanico',
  })
  @MaxArraySize(5, {
    message: 'No puede haber más de 5 mecanicos asignados a esta órden',
  })
  @IsMongoId({
    each: true,
    message: 'Cada mecanico debe ser un ObjectId válido',
  })
  mecanicos!: string[];
}
