import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninRequestDto {
  @IsString()
  @ApiProperty({
    example: '0xc1912fee45d61c87cc5ea59dae31190fffff232d',
    description: '유저의 지갑 주소',
    required: true,
  })
  walletAddress: string;

  @IsString()
  @ApiProperty({
    description: '유저가 로그인한 서명',
    required: true,
    example:
      'f845f84325a0f3d0cd43661cabf53425535817c5058c27781f478cb5459874feaa462ed3a29aa06748abe186269ff10b8100a4b7d7fea274b53ea2905acbf498dc8b5ab1bf4fbc',
  })
  signature: string;
}
