import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HasRol } from 'src/config/decorators/has-rol.decorator';
import { UsuariosService } from './usuarios.service';
import { type AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Ip } from 'src/config/decorators/ip.decorator';
import { UpdatePasswordDto } from 'src/auth/dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { CreateUserDto } from './dto/create-user.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { PaginationDto } from 'src/utils/pagination.dto';

@ApiTags('Gestión de usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar usuarios paginados' })
  @Get()
  findAllPaginated(
    @Query() pagination: PaginationDto,
    @Query('query') query?: string,
  ) {
    return this.service.findAllPaginated(pagination, query);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar usuarios para administración' })
  @Get('buscar')
  findAll(@Query('query') query?: string) {
    return this.service.findAll(query);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar mecánicos disponibles  para administración',
  })
  @Get()
  findAllMecanicos(@Query('query') query?: string) {
    return this.service.findAllMecanicos(query);
  }

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar el perfil de un usuario',
  })
  @Get('profile')
  findProfile(@CurrentUser() user: AccessTokenClaims) {
    return this.service.findProfile(user);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultarun usuario para administración' })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un usuario desde administración' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateUserDto,
    @Ip() ip: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png)$/,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: MulterFile,
  ) {
    return this.service.insert(payload, user, ip, file);
  }

  @HasRol(['todos'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el perfil de un usuario' })
  @ApiConsumes('multipart/form-data')
  @Put('profile')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  putProfile(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateUserDto,
    @Ip() ip: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png)$/,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: MulterFile,
  ) {
    return this.service.updateProfile(user, payload, file, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario desde administración' })
  @Put(':id')
  put(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: UpdateUserDto,
    @Ip() ip: string,
  ) {
    return this.service.update(id, payload, user, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar contraseña de un usuario desde administración',
  })
  @Patch('password')
  patchPassword(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdatePasswordDto,
    @Ip() ip: string,
  ) {
    return this.service.updatePassword(user, payload, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de un usuario desde administración',
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
