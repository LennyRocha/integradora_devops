/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from 'src/usuarios/entity/usuario.schema';
import {
  PASSWORD_HASHER,
  type PasswordHasherPort,
  TOKEN_SIGNER,
  type TokenSignerPort,
} from './interfaces/token-ports';
import { randomUUID } from 'node:crypto';
import { RefreshToken } from './schema/refresh-token.schema';
import { hashOpaqueToken, newOpaqueToken } from './helpers/auth.helpers';
import { ApiResponse } from 'src/config/api.response';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { handleError } from 'src/config/utils/handle-error';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly userModel: Model<Usuario>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SIGNER) private readonly tokens: TokenSignerPort,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
  ) {}

  private readonly refreshTtlSec = Number(
    process.env.JWT_REFRESH_TTL_SECONDS ?? 604800,
  );

  async login(correo: string, contrasena: string) {
    try {
      this.logger.info('Intento de inicio de sesión');

      const email = correo.toLowerCase().trim();
      const password = contrasena.trim();
      const user = await this.userModel.findOne({ correo: email });

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const ok = await this.hasher.verify(user.contra, password);

      if (!ok || !user.status) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.info('Inicio de sesión exitoso', { userId: user._id });
      return this.issueSession(user, randomUUID());
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('Intento de inicio de sesión rechazado');
      } else {
        this.logger.error({ err: error }, 'Error en el inicio de sesión');
      }
      handleError(error);
    }
  }

  async refresh(refreshToken: string) {
    this.logger.info('Intento de refresh de token');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh inválido');
    }

    const tokenHash = hashOpaqueToken(refreshToken);

    try {
      const stored = await this.refreshTokenModel.findOne({
        tokenHash,
      });

      if (!stored) {
        throw new UnauthorizedException('Refresh inválido');
      }

      const now = new Date();

      if (stored.revokedAt != null) {
        // El token ya fue utilizado o revocado.
        // Revocar los demás tokens de esta sesión.
        await this.refreshTokenModel.updateMany(
          {
            sessionId: stored.sessionId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: now },
          },
        );

        throw new UnauthorizedException('Refresh inválido');
      }

      if (stored.expiresAt <= now) {
        throw new UnauthorizedException('Refresh expirado');
      }

      // Consumir el refresh token de forma atómica.
      const consumed = await this.refreshTokenModel.updateOne(
        {
          _id: stored._id,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
        {
          $set: { revokedAt: now },
        },
      );

      if (consumed.modifiedCount !== 1) {
        // Otra petición pudo consumirlo simultáneamente.
        await this.refreshTokenModel.updateMany(
          {
            sessionId: stored.sessionId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: now },
          },
        );

        throw new UnauthorizedException('Refresh inválido');
      }

      const usuario = await this.userModel.findById(stored.usuario);

      if (!usuario?.status) {
        await this.refreshTokenModel.updateMany(
          {
            sessionId: stored.sessionId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: now },
          },
        );

        throw new UnauthorizedException('Usuario no disponible');
      }

      // Crear el refresh token sucesor.
      const nextRefreshToken = newOpaqueToken();

      await this.refreshTokenModel.create({
        usuario: stored.usuario,
        sessionId: stored.sessionId,
        tokenHash: hashOpaqueToken(nextRefreshToken),
        expiresAt: new Date(Date.now() + this.refreshTtlSec * 1000),
      });

      this.logger.info('Refresh de token exitoso', { userId: usuario._id });
      return this.issueSession(usuario, stored.sessionId, nextRefreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('Intento de refresh de token rechazado');
      } else {
        this.logger.error({ err: error }, 'Error en el refresh de token');
      }
      handleError(error);
    }
  }

  async logout(refreshToken: string | undefined) {
    this.logger.info('Intento de cierre de sesión');
    if (!refreshToken) {
      this.logger.info('Cierre de sesión exitoso');
      return ApiResponse.success({ loggedOut: true }, 'Sesión cerrada', 200);
    }

    try {
      const tokenHash = hashOpaqueToken(refreshToken);

      const stored = await this.refreshTokenModel.findOne({
        tokenHash,
      });

      if (stored) {
        await this.refreshTokenModel.updateMany(
          {
            sessionId: stored.sessionId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: new Date() },
          },
        );
      }

      this.logger.info(
        {
          sessionId: stored?.sessionId,
        },
        'Cierre de sesión exitoso',
      );
      return ApiResponse.success({ loggedOut: true }, 'Sesión cerrada', 200);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('Intento de cierre de sesión rechazado');
      } else {
        this.logger.error({ err: error }, 'Error en el cierre de sesión');
      }
      handleError(error);
    }
  }

  private async issueSession(
    usuario: UsuarioDocument,
    sessionId?: string,
    rotatedRefreshToken?: string,
  ) {
    const currentSessionId = sessionId ?? randomUUID();

    const accessToken = await this.tokens.signAccess({
      sub: usuario._id.toString(),
      tid: currentSessionId,
      email: usuario.correo,
      rol: String(usuario.rol),
    });

    const refreshToken = rotatedRefreshToken ?? newOpaqueToken();

    if (!rotatedRefreshToken) {
      await this.refreshTokenModel.create({
        usuario: usuario.id,
        sessionId: currentSessionId,
        tokenHash: hashOpaqueToken(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshTtlSec * 1000),
      });
    }

    const usuarioResponse = {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellidoP: usuario.apellidoP,
      apellidoM: usuario.apellidoM,
      correo: usuario.correo,
      rol: usuario.rol,
      perfil_foto: usuario.perfilFoto,
    };

    const res = {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      usuarioResponse,
    };

    return ApiResponse.success(res, 'Inicio de sesión exitoso', 200);
  }
}
