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
import { ServiciosService } from './servicios.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import { Public } from 'src/config/decorators/public.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import type { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from 'src/utils/pagination.dto';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly service: ServiciosService) {}

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar servicios para administración' })
  @Get('buscar')
  findAll() {
    return this.service.findAll();
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar servicios paginados' })
  @Get()
  findAllPaginated(@Query() pagination: PaginationDto) {
    return this.service.findAllPaginated(pagination, pagination.query);
  }

  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar servicios para el público en general' })
  @Get('public')
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultarun servicio para administración' })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un servicio desde administración' })
  @Post()
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateServiceDto,
    @Ip() ip: string,
  ) {
    return this.service.insert(payload, user, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @Put(':id')
  putOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateServiceDto,
    @Ip() ip: string,
  ) {
    return this.service.update(id, payload, user, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de un servicio desde administración',
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
