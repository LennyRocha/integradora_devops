import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, LogoutDto, RefreshDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body.correo, body.contrasena);
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.service.logout(dto.refreshToken);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refreshToken);
  }
}
