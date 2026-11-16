import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import type { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { VehiculosService } from './vehiculos.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from 'src/utils/pagination.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar vehículos paginados' })
  @Get()
  findAllPaginated(@Query() pagination: PaginationDto) {
    return this.service.findAllPaginated(pagination);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar vehículos para levantar órdenes' })
  @Get('buscar')
  findAll(@Query('query') query?: string) {
    return this.service.findAll(query);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultarun vehículo' })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un vehículo' })
  @Post()
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateVehicleDto,
    @Ip() ip: string,
  ) {
    return this.service.insert(payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @Put(':id')
  putProfile(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateVehicleDto,
    @Ip() ip: string,
  ) {
    return this.service.update(id, payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de un vehículo',
  })
  @Patch('status/:id')
  changeStatus(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Ip() ip: string,
  ) {
    return this.service.toggleStatus(id, user, ip);
  }
}
