import { HttpStatus } from '@nestjs/common';

export type ErrorOrigin =
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'BUSSINESS_ERROR'
  | 'SERVER_ERROR'
  | null;

export class ApiResponse<T> {
  constructor(
    private readonly success: boolean,
    private readonly data: T | null,
    private readonly message: string,
    private readonly error: ErrorOrigin,
    private readonly statusCode: HttpStatus,
    private readonly timestamp: Date = new Date(),
    private readonly errors: Record<string, unknown> | null = null,
    private readonly path: string | null = null,
    private readonly method: string | null = null,
  ) {}

  static success<T>(
    data: T,
    message = 'Operación exitosa',
    statusCode = HttpStatus.OK,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      true,
      data,
      message,
      null,
      statusCode,
      new Date(),
      null,
      null,
      null,
    );
  }

  static error<T>(
    error: ErrorOrigin,
    message = 'Error en la operación',
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    path: string | null = null,
    method: string | null = null,
    errors: Record<string, unknown> | null = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      false,
      null,
      message,
      error,
      statusCode,
      new Date(),
      errors,
      path,
      method,
    );
  }
}
