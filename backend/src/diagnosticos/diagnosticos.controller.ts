import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
} from '@nestjs/common';
import { DiagnosticosService } from './diagnosticos.service';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Ip } from 'src/config/decorators/ip.decorator';
import { type AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Controller('diagnosticos')
export class DiagnosticosController {
  constructor(private readonly service: DiagnosticosService) {}

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar el perfil de un usuario',
  })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar el perfil de un usuario',
  })
  @Post(':id')
  postOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('refacciones', ParseBoolPipe)
    refacciones: boolean,
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateDiagnosticDto,
    @Ip() ip: string,
  ) {
    return this.service.insert(id, payload, user, ip, refacciones);
  }

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar el perfil de un usuario',
  })
  @Delete(':id')
  delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('orden') orden: string,
    @CurrentUser() user: AccessTokenClaims,
    @Ip() ip: string,
  ) {
    return this.service.delete(id, user, ip, orden);
  }
}
