import { ApiProperty } from '@nestjs/swagger';

class WalletDto {
  @ApiProperty({
    description: '아이디',
    type: 'number',
  })
  id: number;

  @ApiProperty({
    description: '지갑 주소',
    type: 'string',
  })
  address: string;
}

export class MeDto {
  @ApiProperty({
    description: '아이디',
    type: 'number',
  })
  id: number;

  @ApiProperty({
    example: 'tester@email.com',
    description: '이메일',
    type: 'string',
  })
  email: string;

  @ApiProperty({
    example: 'tester',
    description: '유저명',
    type: 'string',
  })
  username: string;

  @ApiProperty({
    description: '프로필 url',
    type: 'string',
  })
  profileUrl?: string | null;

  @ApiProperty({
    description: '지갑',
    type: WalletDto,
  })
  wallet: WalletDto;
}

export class MeOkResponseDto {
  @ApiProperty({
    type: 'number',
  })
  resultCode: number;

  @ApiProperty({
    type: 'string',
  })
  message: string | null;

  @ApiProperty({
    type: 'string',
  })
  error: string | null;

  @ApiProperty({
    type: MeDto,
  })
  result: MeDto;
}
