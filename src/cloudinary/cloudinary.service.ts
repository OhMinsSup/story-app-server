import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';

// types
import type { StoryUploadType } from './cloudinary.interfaces';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    storeType: StoryUploadType,
  ) {
    const url = `data:${file.mimetype};base64,${file.buffer.toString(
      'base64',
    )}`;
    const response = await v2.uploader.upload(url, {
      public_id: `story-media/${userId}/${storeType}/${file.originalname}`,
    });
    return response;
  }
}
