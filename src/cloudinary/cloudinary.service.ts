import { Injectable, Logger } from '@nestjs/common';
import { v2 } from 'cloudinary';

// types
import type { StoryUploadType } from './cloudinary.interfaces';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  /**
   * @description - This method is used to upload a file to cloudinary
   * @param {Express.Multer.File} file - file to upload
   * @param {number} userId - user id
   * @param {StoryUploadType} storeType - story type
   */
  async upload(
    file: Express.Multer.File,
    userId: number,
    type: StoryUploadType,
  ) {
    const dataURL = this.makeDataURL(file);
    const splitFileName: string[] = file.originalname.split('.');
    const filename: string = splitFileName[0];
    return v2.uploader.upload(
      dataURL,
      {
        public_id: `story-media/${userId}/${type}/${filename}`,
      },
      (error, result) => {
        this.logger.debug({
          message: 'uploadFile',
          payload: { error, result },
        });
      },
    );
  }

  /**
   * @description - This method is used to make a data url from a file
   * @param {Express.Multer.File} file - file to make data url
   */
  private makeDataURL(file: Express.Multer.File) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
}
