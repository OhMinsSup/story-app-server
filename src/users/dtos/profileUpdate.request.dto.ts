import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { CommonDTO } from './common.dto';

export class ProfileUpdateRequestDto extends CommonDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'nickname123',
    description: '닉네임',
  })
  nickname: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: true,
    default: true,
    description: '기본 썸네일 상태값',
  })
  defaultProfile: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'iq67vb1nm4p',
    description: '사용자의 기본 아바타 코드',
  })
  avatarSvg: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'https://www.google.com/',
    description: '유저 프로필 주소',
  })
  profileUrl: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '간단한 설명...',
    description: '유저 설명',
  })
  bio: string;
}
