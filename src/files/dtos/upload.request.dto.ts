import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  StoryUploadType,
  StoryUploadTypeEnum,
} from 'src/cloudinary/cloudinary.interfaces';

export class UploadRequestDto {
  @IsString()
  @ApiProperty({
    example: Object.keys(StoryUploadTypeEnum)
      .map((key) => key)
      .join(', '),
    description: '업로드 파일 타입',
    required: true,
  })
  storyType: StoryUploadType;

  @IsString()
  @ApiProperty({
    example: 'KakaoTalk_Photo_2021-08-11-01-13-45.jpeg',
    description: '업로드 파일',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
