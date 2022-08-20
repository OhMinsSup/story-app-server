import { ApiProperty } from '@nestjs/swagger';
import {} from 'class-validator';

const UPLOAD_TYPE = {
  PROFILE: 'PROFILE',
  NFT: 'NFT',
};

export type UploadType = keyof typeof UPLOAD_TYPE;

const MEDIA_TYPE = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
};

export type MediaType = keyof typeof MEDIA_TYPE;

export class UploadRequestDto {
  @ApiProperty({
    example: 'KakaoTalk_Photo_2021-08-11-01-13-45.json',
    description: '업로드 파일',
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    enum: UPLOAD_TYPE,
    required: true,
  })
  uploadType: UploadType;

  @ApiProperty({
    type: 'string',
    enum: MEDIA_TYPE,
    required: true,
  })
  mediaType: MediaType;
}
