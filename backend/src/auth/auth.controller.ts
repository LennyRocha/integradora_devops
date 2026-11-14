import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, LogoutDto, RefreshDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../config/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Iniciar sesión' })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body.correo, body.contrasena);
  }

  @Public()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.service.logout(dto.refreshToken);
  }

  @Public()
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refreshToken);
  }
}
