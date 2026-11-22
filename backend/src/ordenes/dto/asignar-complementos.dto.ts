import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsUniquePrimitiveArray } from 'src/config/decorators/isUniqueArray.decorator';
import { MaxArraySize } from 'src/config/decorators/maxArraySize.decorator';
import { MinArraySize } from 'src/config/decorators/minArraySize.decorator';
import { CreateRefactionDto } from 'src/refacciones/dto/create-refaction.dto';

export class AsignarComplementosDto {
  @ApiProperty({ example: ['servicio1', 'servicio2'] })
  @IsNotEmpty({
    message: 'Los servicios son obligatorios',
  })
  @IsArray({
    message: 'Los servicios deben ser un array',
  })
  @IsUniquePrimitiveArray({
    message: 'Los servicios no pueden repetirse',
  })
  @MinArraySize(1, {
    message: 'Debe haber al menos un servicio',
  })
  @MaxArraySize(20, {
    message: 'No puede haber más de 20 servicios',
  })
  @IsMongoId({
    each: true,
    message: 'Cada servicio debe ser un ObjectId válido',
  })
  servicios!: string[];

  @ApiProperty({ type: [CreateRefactionDto] })
  @IsNotEmpty({
    message: 'Las refacciones son obligatorios',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRefactionDto)
  @MinArraySize(1, {
    message: 'Debe proporcionar al menos una refacción',
  })
  @MaxArraySize(20, {
    message: 'No puede proporcionar más de 20 refacciones',
  })
  refacciones!: CreateRefactionDto[];

  @ApiPropertyOptional({ example: ['Nota 1', 'Nota 2'] })
  @IsOptional()
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
  notas?: string[];
}
