import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('Gestión de usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar usuarios para administración' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @HasRol(['administrador', 'mecanico', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar el perfil de un usuario',
  })
  @Get('me')
  findProfile(@CurrentUser() user: AccessTokenClaims) {
    return this.service.findProfile(user);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultarun usuario para administración' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un usuario desde administración' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  postOne(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: CreateUserDto,
    @Ip() ip: string,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.service.insertOne(user, payload, file, ip);
  }

  @HasRol(['administrador', 'mecanico', 'recepcionista'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el perfil de un usuario' })
  @ApiConsumes('multipart/form-data')
  @Patch('me')
  @UseInterceptors(FileInterceptor('file'))
  patchProfile(
    @CurrentUser() user: AccessTokenClaims,
    @Body() payload: UpdateUserDto,
    @Ip() ip: string,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.service.patchProfile(user, payload, file, ip);
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
    return this.service.patchPassword(user, payload, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de un usuario desde administración',
  })
  @Patch('status/:id')
  patchStatus(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Ip() ip: string,
  ) {
    return this.service.patchStatus(user, id, ip);
  }

  @HasRol(['administrador'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario desde administración' })
  @Patch(':id')
  patchOne(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
    @Ip() ip: string,
  ) {
    return this.service.patchOne(user, id, payload, ip);
  }
}
