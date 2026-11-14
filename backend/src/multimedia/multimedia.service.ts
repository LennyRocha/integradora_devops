/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// multimedia.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import type { File as MulterFile } from 'multer';
import { Readable } from 'node:stream';
import { CLOUDINARY } from './constants/cloudinary';
import { ImageException } from 'src/config/exceptions/image-exception';
import { UploadOptions } from './interfaces/upload.options';
import { UploadedImage } from './interfaces/uploaded.image';

@Injectable()
export class MultimediaService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  private readonly TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png']);
  private readonly MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  async uploadImage(
    file: MulterFile,
    options: UploadOptions,
  ): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      this.validateFile(file);

      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: `taller/${options.folder}`,
          resource_type: 'image',
          transformation: options.transformation
            ? [
                {
                  ...options.transformation,
                  crop: 'limit',
                },
              ]
            : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(
              new ImageException('No se recibió respuesta de Cloudinary'),
            );

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    const result = await this.cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new ImageException('No se pudo eliminar la imagen de Cloudinary');
    }
  }

  private validateFile(file: MulterFile): void {
    if (!file || file.size === 0) {
      throw new ImageException('Debes seleccionar una imagen');
    }

    if (!this.TIPOS_PERMITIDOS.has(file.mimetype)) {
      throw new ImageException('Formato no permitido. Usa JPG o PNG');
    }

    if (file.size > this.MAX_BYTES) {
      throw new ImageException('La imagen no puede superar 5 MB');
    }
  }
}
