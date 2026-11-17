import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { type AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import { PaginationDto } from 'src/utils/pagination.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientVehicleDto } from './dto/update-client-vehicle.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

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

  @HttpCode(201)
  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un vehículo' })
  @Post()
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateClientDto,
    @Ip() ip: string,
  ) {
    return this.service.insert(payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @Put(':id')
  putOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateClientDto,
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

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @Patch('vehiculo/:vehicleId/cliente/:clientId')
  putProfile(
    @Param('vehicleId', ParseObjectIdPipe) vehicleId: string,
    @Param('clientId', ParseObjectIdPipe) clientId: string,
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateClientVehicleDto,
    @Ip() ip: string,
  ) {
    return this.service.updateClientVehicle(
      clientId,
      vehicleId,
      payload,
      user,
      ip,
    );
  }
}
