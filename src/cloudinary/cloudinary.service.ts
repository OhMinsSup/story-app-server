import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';

// types
import type { StoryUploadType } from './cloudinary.interfaces';

@Injectable()
export class CloudinaryService {
  /**
   * @description - This method is used to upload a file to cloudinary
   * @param file
   * @param userId
   * @param storeType
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    storeType: StoryUploadType,
  ) {
    const url = this.makeDataUrl(file);
    const response = await v2.uploader.upload(url, {
      public_id: `story-media/${userId}/${storeType}/${file.originalname}`,
    });
    return response;
  }

  /**
   * @description - This method is used to make a data url from a file
   * @param {Express.Multer.File} file
   */
  private makeDataUrl(file: Express.Multer.File) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
}
