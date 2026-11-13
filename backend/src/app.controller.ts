import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Public } from './config/decorators/public.decorator';

@ApiTags('App')
@Controller('ping')
export class AppController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Verificar disponibilidad del servidor',
  })
  @ApiOkResponse({
    description: 'El servidor está funcionando correctamente',
    schema: {
      type: 'string',
      example: 'pong',
    },
  })
  ping(): string {
    return 'pong';
  }
}
