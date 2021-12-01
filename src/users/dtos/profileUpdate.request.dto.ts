import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { CommonDTO } from './common.dto';

export class ProfileUpdateRequestDto extends CommonDTO {
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
    example: 'https://www.google.com/',
    description: '유저 프로필 주소',
    required: true,
  })
  profileUrl: string;
}
