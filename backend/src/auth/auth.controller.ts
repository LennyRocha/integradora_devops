import { Body, Controller, HttpCode, Post, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @Post('logout')
  logout(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: LogoutDto,
  ) {
    const access = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    return this.service.logout(access, dto.refreshToken);
  }

  @Public()
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refreshToken);
  }
}
