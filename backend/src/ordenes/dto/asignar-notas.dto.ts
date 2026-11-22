import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, MaxLength } from 'class-validator';
import { IsUniquePrimitiveArray } from 'src/config/decorators/isUniqueArray.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';

export class AsignarNotasDto {
  @ApiProperty({ example: ['Nota 1', 'Nota 2'] })
  @IsNotEmpty({
    message: 'Las notas son obligatorias',
  })
  @IsArray({
    message: 'Las notas deben ser un array',
  })
  @IsUniquePrimitiveArray({
    message: 'Las notas no pueden repetirse',
  })
  @MinArraySize(1, {
    message: 'Debe haber al menos una nota',
  })
  @MaxArraySize(10, {
    message: 'No puede haber más de 10 notas',
  })
  @MaxLength(50, {
    each: true,
    message: 'Cada nota no puede tener más de 50 caracteres',
  })
  notas!: string[];
}
