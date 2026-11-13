/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// POR QUÉ: extraer claims verificados evita que controladores vuelvan a interpretar el JWT.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenClaims } from '../../auth/interfaces/access-token-claims';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenClaims => {
    return ctx.switchToHttp().getRequest().user;
  },
);
