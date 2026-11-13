import { HttpException, HttpStatus } from '@nestjs/common';

export class BussinessException extends HttpException {
  constructor(public readonly message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
