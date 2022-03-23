import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { CommonDTO } from './common.dto';

export class SignupRequestDto extends CommonDTO {
  @IsEmail()
  @ApiProperty({
    example: 'test@email.io',
    description: '이메일',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'nickname123',
    description: '닉네임',
    required: true,
  })
  nickname: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
    default: true,
    description: '기본 썸네일 상태값',
  })
  defaultProfile: boolean;

  @IsString()
  @ApiProperty({
    example: 'iq67vb1nm4p',
    description: '사용자의 기본 아바타 코드',
    required: true,
  })
  avatarSvg: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'test1q2w3e',
  })
  password: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '프로필 주소',
    required: false,
    example:
      'https://res.cloudinary.com/planeshare/image/upload/v1648040719/story-media/1/PROFILE/KakaoTalk_Photo_2021-08-11-01-13-45.jpg',
  })
  profileUrl?: string;
}
