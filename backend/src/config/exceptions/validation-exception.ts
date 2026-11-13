import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly errors: Record<string, unknown>,
  ) {
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}
