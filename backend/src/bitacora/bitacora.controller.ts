import { Controller, Get, Query } from '@nestjs/common';
import { type AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { PaginationDto } from 'src/utils/pagination.dto';
import { BitacoraService } from './bitacora.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';

@ApiTags('Bitacora de auditoría')
@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly service: BitacoraService) {}

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar la bitácora de auditoría' })
  @Get()
  findAll(
    @CurrentUser() user: AccessTokenClaims,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAll(user, pagination);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar últimos 10 registros de la bitácora' })
  @Get('/dashboard')
  getRecentTen() {
    return this.service.getRecentTen();
  }
}
