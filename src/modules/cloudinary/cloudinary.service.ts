import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * @description - This method is used to upload a file to cloudinary
   * @param {Express.Multer.File} file - file to upload
   * @param {number} userId - user id
   */
  async upload(file: Express.Multer.File, userId: number) {
    const dataURL = this.makeDataURL(file);
    const splitFileName: string[] = file.originalname.split('.');
    const filename: string = splitFileName[0];
    return v2.uploader.upload(dataURL, {
      public_id: `story-media/${userId}/${filename}`,
    });
  }

  /**
   * @description - This method is used to make a data url from a file
   * @param {Express.Multer.File} file - file to make data url
   */
  private makeDataURL(file: Express.Multer.File) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
}
