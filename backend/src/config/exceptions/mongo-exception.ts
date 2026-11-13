import { HttpException, HttpStatus } from '@nestjs/common';

export class MongoException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly name: string = 'MongoException',
    public readonly cause: Error | undefined = undefined,
  ) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      cause ? { cause } : undefined,
    );
    this.name = 'MongoException';
  }
}
