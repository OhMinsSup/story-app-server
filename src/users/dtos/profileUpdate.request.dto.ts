import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { GenderEnum, GenderType } from './common.dto';

export class ProfileUpdateRequestDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(GenderEnum)
  @ApiProperty({
    example: GenderEnum.MALE,
    default: GenderEnum.MALE,
    enum: [GenderEnum.FEMALE, GenderEnum.MALE],
    description: '성별',
  })
  gender: GenderType;

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

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: '알림 설정',
  })
  canNotification: boolean;
}
