import { Body, Controller, Get, Ip, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import type { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { VehiculosService } from './vehiculos.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';

@Controller('tipos-vehiculos')
export class TiposVehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar tipos de vehículos para administración' })
  @Get()
  findAllTiposVehiculos() {
    return this.service.findAllTiposVehiculos();
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar un tipo de vehículo para administración',
  })
  @Post()
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateVehicleTypeDto,
    @Ip() ip: string,
  ) {
    return this.service.insertTipoVehiculo(payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de un tipo de vehículo para administración',
  })
  @Patch('status/:id')
  changeStatus(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Ip() ip: string,
  ) {
    return this.service.toggleStatusTipoVehiculo(id, user, ip);
  }
}
