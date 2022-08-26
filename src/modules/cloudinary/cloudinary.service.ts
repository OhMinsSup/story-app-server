import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import type { UploadType } from '../../file/dto/upload.request.dto';

interface ItemUploadParams {
  file: Express.Multer.File;
  uploadType: UploadType;
  userId: number;
}

type ItemThumbnailParams = Omit<ItemUploadParams, 'uploadType'>;

@Injectable()
export class CloudinaryService {
  /**
   * @description - This method is used to make a data url from a file
   * @param {Express.Multer.File} file - file to make data url
   */
  private makeDataURL(file: Express.Multer.File) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  private currentDate() {
    const now = new Date();
    const year = now.getFullYear(); // 년도
    const month = now.getMonth() + 1; // 월
    const date = now.getDate(); // 날
    return `${year}_${month}_${date}`;
  }

  /**
   * @description - 썸네일을 업로드하는 함수
   * @param {ItemThumbnailParams} params - 파일 업로드 파라미터
   */
  itemThumbnailUpload(params: ItemThumbnailParams) {
    const { file, userId } = params;
    const dataURL = this.makeDataURL(file);
    return v2.uploader.upload(dataURL, {
      resource_type: 'image',
      folder: `media/${userId}/thumbnail/${this.currentDate()}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    });
  }

  /**
   * @description - 아이템을 업로드하는 함수
   * @param {ItemUploadParams} params - 파일 업로드 파라미터
   */
  itemImageUpload(params: ItemUploadParams) {
    const { file, uploadType, userId } = params;
    const dataURL = this.makeDataURL(file);
    return v2.uploader.upload(dataURL, {
      resource_type: 'image',
      folder: `media/${userId}/${uploadType.toLowerCase()}/image/${this.currentDate()}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    });
  }

  /**
   * @description - 비디오를 업로드하는 함수
   * @param {ItemUploadParams} params - 파일 업로드 파라미터
   */
  itemVideoUpload(params: ItemUploadParams) {
    const { file, uploadType, userId } = params;
    const dataURL = this.makeDataURL(file);
    return v2.uploader.upload_large(dataURL, {
      resource_type: 'video',
      folder: `media/${userId}/${uploadType.toLowerCase()}/video/${this.currentDate()}`,
      allowed_formats: ['mp4'],
    });
  }

  /**
   * @description - 3d 모델을 업로드하는 함수
   * @param {ItemUploadParams} params - 파일 업로드 파라미터
   */
  item3DModelUpload(params: ItemUploadParams) {
    const { file, uploadType, userId } = params;
    const dataURL = this.makeDataURL(file);
    return v2.uploader.upload(dataURL, {
      resource_type: 'image',
      folder: `media/${userId}/${uploadType.toLowerCase()}/model/${this.currentDate()}`,
      allowed_formats: ['glb', 'gltf', 'ply', 'zip'],
    });
  }
}
