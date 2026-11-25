import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import { PaginationDto } from 'src/utils/pagination.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Public } from 'src/config/decorators/public.decorator';
import { CreateOrdenDto } from './dto/create-orden.dto';
import type { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { AsignarComplementosDto } from './dto/asignar-complementos.dto';
import { EstadoOrdenDto } from './dto/estado-orden.dto';
import { AsignarNotasDto } from './dto/asignar-notas.dto';
import { AsignarMecanicosDto } from './dto/asignar-mecanicos.dto';
import { ImagenIndexDto } from './dto/imagen-index.dto';
import type { File as MulterFile } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FotoTipoDto } from './dto/foto-tipo.dto';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly service: OrdenesService) {}

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar lista de órdenes para administración' })
  @Get('buscar')
  findAll(@Query('query') query?: string) {
    return this.service.findAll(query);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar lista de órdenes para administración' })
  @Get('mecanico/:mecanicoId')
  findAllByMecanico(
    @Param('mecanicoId', ParseObjectIdPipe) mecanicoId: string,
    @Query('query') query?: string,
  ) {
    return this.service.findAllByMecanico(mecanicoId, query);
  }

  @Public()
  @ApiOperation({ summary: 'Consultaruna órden de servicio por QR' })
  @Get('qr/:qr')
  findOneByQr(@Param('qr', ParseUUIDPipe) qr: string) {
    return this.service.findOneByQrToken(qr);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar órdenes anteriores paginados' })
  @Get()
  findAllPaginated(@Query() pagination: PaginationDto) {
    return this.service.findAllPaginated(pagination, pagination.query);
  }

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultaruna  órden de servicio' })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una orden' })
  @Post()
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateOrdenDto,
    @Ip() ip: string,
  ) {
    return this.service.insert(payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una orden de servicio' })
  @Put(':id')
  put(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: AsignarComplementosDto,
    @Ip() ip: string,
  ) {
    return this.service.update(id, payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Agregar fotos a una orden de servicio desde administración',
  })
  @ApiConsumes('multipart/form-data')
  @Patch('fotos/:id')
  @UseInterceptors(
    FilesInterceptor('files', 4, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  addFotos(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: FotoTipoDto,
    @Ip() ip: string,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<MulterFile>,
  ) {
    return this.service.addPhotos(id, payload, user, ip, files);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de una orden de servicio según su progreso',
  })
  @Patch('status/:id')
  changeStatus(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: EstadoOrdenDto,
    @Ip() ip: string,
  ) {
    return this.service.toggleStatus(id, payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Agregar notas a una orden de servicio desde administración',
  })
  @Patch('notas/:id')
  addNotas(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: AsignarNotasDto,
    @Ip() ip: string,
  ) {
    return this.service.addNotas(id, payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Asignar un o varios mecánicos a una orden de servicio desde administración',
  })
  @Patch('asignar/:id')
  asignMecanicos(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: AsignarMecanicosDto,
    @Ip() ip: string,
  ) {
    return this.service.asginMecanicos(id, payload, user, ip);
  }

  @HasRol(['administrador', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una foto de una orden de servicio desde administración',
  })
  @Delete('foto/:id')
  deleteFoto(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: ImagenIndexDto,
    @Ip() ip: string,
  ) {
    return this.service.deletePhoto(id, payload, user, ip);
  }
}
