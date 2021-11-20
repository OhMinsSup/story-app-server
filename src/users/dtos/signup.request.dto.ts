import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
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
    required: false,
  })
  avatarSvg?: string;

  @IsString()
  @ApiProperty({
    example: 'https://cdn.image.io/users',
    description: '유저가 업로드한 이미지 사진',
    required: false,
  })
  profileUrl?: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'test1q2w3e',
  })
  password: string;
}
