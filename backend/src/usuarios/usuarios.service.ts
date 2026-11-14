/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario, UsuarioDocument } from './entity/usuario.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { handleError } from 'src/config/utils/handle-error';
import { ApiResponse } from 'src/config/api.response';
import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { CreateUserDto } from './dto/create-user.dto';
import type { File as MulterFile } from 'multer';
import { MultimediaService } from 'src/multimedia/multimedia.service';
import { BitacoraService } from 'src/bitacora/bitacora.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from 'src/auth/dto/auth.dto';
import { BussinessException } from 'src/config/exceptions/bussiness-exception';
import {
  PASSWORD_HASHER,
  type PasswordHasherPort,
} from 'src/auth/interfaces/token-ports';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
    @InjectPinoLogger(UsuariosService.name)
    private readonly logger: PinoLogger,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    private readonly fileService: MultimediaService,
    private readonly auditService: BitacoraService,
  ) {}

  /**
   * Obtiene todos los usuarios.
   */
  async findAll() {
    try {
      this.logger.info('Obteniendo todos los usuarios');
      const data = await this.usuarioModel.find();
      return ApiResponse.success(data, 'Usuarios obtenidos correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener los usuarios');
      handleError(error);
    }
  }

  /**
   * Administrador obtiene un usuario por su ID.
   * @param id - El ID del usuario a obtener.
   */
  async findOne(id: string) {
    try {
      this.logger.info('Obteniendo un usuario');
      const data = await this.usuarioModel.findById(id);
      if (!data) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return ApiResponse.success(data, 'Usuario obtenido correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al obtener el usuario');
      handleError(error);
    }
  }

  /**
   * Obtiene el perfil de un usuario.
   * @param user - Las credenciales del usuario.
   */
  async findProfile(user: AccessTokenClaims) {
    try {
      this.logger.info('Obteniendo el perfil de un usuario');
      const data = await this.usuarioModel.findById(user.sub);
      if (!data) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const response = {
        _id: data?._id,
        nombre: data?.nombre,
        apellidoP: data?.apellidoP,
        apellidoM: data?.apellidoM,
        correo: data?.correo,
        telefono: data?.telefono,
        rol: data?.rol,
        perfilFoto: data?.perfilFoto,
        status: data?.status,
      };
      return ApiResponse.success(response, 'Perfil obtenido correctamente');
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al obtener el perfil del usuario',
      );
      handleError(error);
    }
  }

  /**
   * Administra la creación de un nuevo usuario.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param payload - Los datos del nuevo usuario.
   * @param foto - La imagen del perfil del usuario.
   * @param ip - La dirección IP del cliente.
   */
  async insertOne(
    user: AccessTokenClaims,
    payload: CreateUserDto,
    foto?: MulterFile,
    ip?: string,
  ) {
    try {
      this.logger.info('Insertando un nuevo usuario');

      const existingByEmail = await this.usuarioModel.findOne({
        correo: payload.correo,
      });

      if (existingByEmail) {
        throw new BussinessException('El correo electrónico ya está en uso');
      }

      const existingByPhone = await this.usuarioModel.findOne({
        telefono: payload.telefono,
      });

      if (existingByPhone) {
        throw new BussinessException('El número de teléfono ya está en uso');
      }

      const uploaded = foto
        ? await this.fileService.uploadImage(foto, {
            folder: 'usuarios',
          })
        : undefined;

      let data: UsuarioDocument;

      const hashedPassword = await this.hasher.hash(payload.contra);

      try {
        data = await this.usuarioModel.create({
          ...payload,
          contra: hashedPassword,
          perfilFoto: uploaded,
          createdBy: user.sub,
        });
      } catch (error) {
        if (uploaded) {
          this.logger.error(
            'Error al insertar el usuario. Eliminando imagen de Cloudinary',
          );

          await this.fileService.deleteImage(uploaded.publicId);
        }
        throw error;
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Creación de usuario ${data._id.toString()}`,
        tipo: 'INSERT',
        ipOrigen: ip,
      });

      this.logger.info('Usuario creado correctamente');

      return ApiResponse.success(data, 'Usuario creado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear el usuario');
      handleError(error);
    }
  }

  /**
   * Administador actualiza un usuario existente.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param id - El ID del usuario a actualizar.
   * @param payload - Los datos a actualizar.
   * @param ip - La dirección IP del cliente.
   */
  async patchOne(
    user: AccessTokenClaims,
    id: string,
    payload: UpdateUserDto,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando un usuario');

      const existingByPhone = await this.usuarioModel.findOne({
        telefono: payload.telefono,
        _id: { $ne: id },
      });

      if (existingByPhone) {
        throw new BussinessException('El número de teléfono ya está en uso');
      }

      const data = await this.usuarioModel.findByIdAndUpdate(
        id,
        {
          ...payload,
          updatedBy: user.sub,
        },
        { new: true },
      );

      if (!data) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó datos de usuario ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'Usuario actualizado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al actualizar el usuario');
      handleError(error);
    }
  }

  /**
   * Un usuario actualiza su perfil.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param payload - Los datos a actualizar.
   * @param foto - La imagen del perfil del usuario.
   * @param ip - La dirección IP del cliente.
   */
  async patchProfile(
    user: AccessTokenClaims,
    payload: UpdateUserDto,
    foto?: MulterFile,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando perfil de usuario');

      const existingByPhone = await this.usuarioModel.findOne({
        telefono: payload.telefono,
        _id: { $ne: user.sub },
      });

      if (existingByPhone) {
        throw new BussinessException('El número de teléfono ya está en uso');
      }

      const existing = await this.usuarioModel.findById(user.sub);

      if (!existing) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const uploaded = foto
        ? await this.fileService.uploadImage(foto, {
            folder: 'usuarios',
          })
        : undefined;

      let data: UsuarioDocument | null;

      try {
        data = await this.usuarioModel.findByIdAndUpdate(
          user.sub,
          {
            ...payload,
            updatedBy: user.sub,
            ...(uploaded && { perfilFoto: uploaded }),
          },
          { new: true },
        );
        if (!data) {
          if (uploaded) {
            await this.fileService.deleteImage(uploaded.publicId);
          }
          throw new NotFoundException('Usuario no encontrado');
        }
      } catch (error) {
        if (uploaded) {
          this.logger.error(
            'Error al actualizar el perfil. Eliminando imagen nueva de Cloudinary',
          );

          await this.fileService.deleteImage(uploaded.publicId);
        }

        throw error;
      }

      if (uploaded && existing.perfilFoto?.publicId) {
        await this.fileService.deleteImage(existing.perfilFoto.publicId);
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó su perfil`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'Usuario actualizado correctamente');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al actualizar el usuario');
      handleError(error);
    }
  }

  /**
   * Un usuario actualiza su contraseña.
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param payload - La nueva contraseña.
   * @param ip - La dirección IP del cliente.
   */
  async patchPassword(
    user: AccessTokenClaims,
    payload: UpdatePasswordDto,
    ip?: string,
  ) {
    try {
      this.logger.info('Actualizando contraseña de usuario');
      const hashedPassword = await this.hasher.hash(payload.contra);
      const data = await this.usuarioModel.findByIdAndUpdate(
        user.sub,
        {
          contra: hashedPassword,
          updatedBy: user.sub,
        },
        { new: true },
      );

      if (!data) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó su contraseña`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(data, 'Contraseña actualizada correctamente');
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar la contraseña del usuario',
      );
      handleError(error);
    }
  }

  /**
   * Un usuario actualiza su estado (activo/inactivo).
   * @param user - Las credenciales del usuario que realiza la acción.
   * @param id - El ID del usuario a actualizar.
   * @param ip - La dirección IP del cliente.
   */
  async patchStatus(user: AccessTokenClaims, id: string, ip?: string) {
    try {
      this.logger.info('Actualizando estado de usuario');
      const existing = await this.usuarioModel.findById(id);

      if (!existing) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.usuarioModel.findByIdAndUpdate(
        id,
        {
          status: !existing.status,
          updatedBy: user.sub,
        },
        { new: true },
      );

      await this.auditService.auditar({
        usuario: new Types.ObjectId(user.sub),
        accion: `Usuario ${user.sub} actualizó el estado de usuario ${id.toString()}`,
        tipo: 'UPDATE',
        ipOrigen: ip,
      });

      return ApiResponse.success(
        { status: !existing.status },
        'Estado de usuario actualizado correctamente',
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error al actualizar el estado del usuario',
      );
      handleError(error);
    }
  }
}
