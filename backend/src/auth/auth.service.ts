import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Model, Error as MongoError } from 'mongoose';
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
import { MongoException } from 'src/config/exceptions/mongo-exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly userModel: Model<Usuario>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SIGNER) private readonly tokens: TokenSignerPort,
  ) {}

  private readonly refreshTtlSec = Number(
    process.env.JWT_REFRESH_TTL_SECONDS ?? 604800,
  );

  async login(correo: string, contrasena: string) {
    try {
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

      return this.issueSession(user, randomUUID());
    } catch (error) {
      if (error instanceof MongoError) {
        throw new MongoException(error.message, error.name, error);
      } else {
        throw error;
      }
    }
  }

  async refresh(refreshToken: string) {
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

      return this.issueSession(usuario, stored.sessionId, nextRefreshToken);
    } catch (error) {
      if (error instanceof MongoError) {
        throw new MongoException(error.message, error.name, error);
      }

      throw error;
    }
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
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

      return ApiResponse.success({ loggedOut: true }, 'Sesión cerrada', 200);
    } catch (error) {
      if (error instanceof MongoError) {
        throw new MongoException(error.message, error.name, error);
      } else {
        throw error;
      }
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
      role: String(usuario.rol),
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
