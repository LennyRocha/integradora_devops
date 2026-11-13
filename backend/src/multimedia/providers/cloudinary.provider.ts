// cloudinary.provider.ts

import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from '../constants/cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });

    return cloudinary;
  },
};
