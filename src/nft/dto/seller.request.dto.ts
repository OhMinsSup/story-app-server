import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SellerRequestDto {
  @IsString()
  @ApiProperty({
    description: '가격 제시',
    required: true,
    example: '0.1',
  })
  price: string;

  @IsString()
  @ApiProperty({
    description: 'KLAY 단위',
    required: true,
    example: `
      (선택 사항, 기본값은 "KLAY") KLAY로 변환하려고 하는 "peb"입니다. number에는 주어진 단위에 대해 다음 승수 중 하나로 나누어 집니다:
      - peb: '1'
      - kpeb: '1000'
      - Mpeb: '1000000'
      - Gpeb: '1000000000'
      - Ston: '1000000000'
      - uKLAY: '1000000000000'
      - mKLAY: '1000000000000000'
      - KLAY: '1000000000000000000'
      - kKLAY: '1000000000000000000000'
      - MKLAY: '1000000000000000000000000'
      - GKLAY: '1000000000000000000000000000'
    `,
  })
  unit: string;
}
