// Source - https://stackoverflow.com/a/65438047
// Posted by sh park
// Retrieved 2026-11-15, License - CC BY-SA 4.0

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        'ObjectId inválido: debe ser una cadena de texto',
      );
    }
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      throw new BadRequestException('ObjectId inválido: formato incorrecto');
    }

    return Types.ObjectId.createFromHexString(value);
  }
}
