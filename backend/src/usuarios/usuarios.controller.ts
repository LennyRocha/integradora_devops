import { Controller } from '@nestjs/common';
import { HasRol } from 'src/auth/decorators/has-rol.decorator';

@Controller('usuarios')
export class UsuariosController {}
