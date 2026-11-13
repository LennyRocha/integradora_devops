import { Module } from '@nestjs/common';
import { MultimediaService } from './multimedia.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
@Module({
  providers: [MultimediaService, CloudinaryProvider],
  exports: [MultimediaService],
})
export class MultimediaModule {}
