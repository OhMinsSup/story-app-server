import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UploadType } from 'src/cloudinary/cloudinary.enum';

import type { StoryUploadType } from 'src/cloudinary/cloudinary.interfaces';

export class UploadRequestDto {
  @IsString()
  @ApiProperty({
    example: Object.keys(UploadType)
      .map((key) => key.toUpperCase())
      .join(', '),
    enum: Object.keys(UploadType).map((key) => key.toUpperCase()),
    description: '업로드 파일 타입',
    required: true,
  })
  storyType: StoryUploadType;

  @ApiProperty({
    example: 'KakaoTalk_Photo_2021-08-11-01-13-45.jpeg',
    description: '업로드 파일',
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
