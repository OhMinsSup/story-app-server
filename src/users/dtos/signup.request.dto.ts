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
    example: '0xc1912fee45d61c87cc5ea59dae31190fffff232d',
    description: '유저의 지갑 주소',
    required: true,
  })
  walletAddress: string;

  @IsString()
  @ApiProperty({
    description: '로그인시 발급한 서명 토큰',
    required: true,
    example:
      'f845f84325a0f3d0cd43661cabf53425535817c5058c27781f478cb5459874feaa462ed3a29aa06748abe186269ff10b8100a4b7d7fea274b53ea2905acbf498dc8b5ab1bf4fbc',
  })
  signatureToken: string;
}
