export class BitacoraException extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = BitacoraException.name;
  }
}
