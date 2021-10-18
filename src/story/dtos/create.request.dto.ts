import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @ApiProperty({
    example: 'Story',
    description: 'NFT 타이틀(이름)',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: '~~~~블라라르랄',
    description: 'NFT 설명',
    required: true,
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'NFT 미디어 id',
    required: true,
  })
  mediaId: number;

  @IsString()
  @IsHexColor()
  @ApiProperty({
    example: '#3ea6ff',
    description: '배경색',
    nullable: true,
  })
  backgroundColor?: string | null;

  @IsString()
  @IsUrl()
  @ApiProperty({
    example: 'https://www.example.com/',
    description: '추가 URL',
    nullable: true,
  })
  externalUrl?: string | null;
}
