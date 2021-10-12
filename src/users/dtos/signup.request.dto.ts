import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { CommonDTO } from './common.dto';

// gender: GenderType;

export class SignupRequestDto extends CommonDTO {
  @IsEmail()
  @ApiProperty({
    example: 'test@email.io',
    description: '이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'nickname123',
    description: '닉네임',
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
  })
  avatarSvg?: string;

  @IsString()
  @ApiProperty({
    example: 'https://cdn.image.io/users',
    description: '유저가 업로드한 이미지 사진',
  })
  profileUrl?: string;

  @IsString()
  @ApiProperty({
    example: '0xc1912fee45d61c87cc5ea59dae31190fffff232d',
    description: '유저의 지갑 주소',
  })
  walletAddress: string;

  @IsString()
  @ApiProperty({
    description: '유저가 로그인한 서명',
  })
  signature: string;
}
