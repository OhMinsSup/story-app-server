import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class StoryCreateRequestDto {
  @IsString()
  @ApiProperty({
    example: 'Story',
    description: 'NFT 타이틀(이름)',
    required: true,
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: '~~~~블라라르랄',
    description: 'NFT 설명',
    required: true,
  })
  description: string;

  @IsString()
  @IsHexColor()
  @ValidateIf((object, value) => value !== null)
  @ApiProperty({
    example: '#3ea6ff',
    description: '배경색',
    nullable: true,
    required: false,
  })
  backgroundColor?: string | null;

  @IsString()
  @IsUrl()
  @ValidateIf((object, value) => value !== null)
  @ApiProperty({
    example: 'opensea,krafter',
    description: '연관된 사이트',
    nullable: true,
    required: false,
  })
  externalSite?: string | null;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'NFT 노출 여부',
    nullable: true,
    required: false,
    default: false,
  })
  isPublic: boolean;

  @IsString()
  @ApiProperty({
    example: '1000',
    description: '가격',
    nullable: false,
    required: true,
  })
  price: string;

  @IsNumber()
  @ApiProperty({
    example: new Date().getTime(),
    description: '판매시작일',
    nullable: false,
    required: true,
  })
  beginDate: Date;

  @IsNumber()
  @ApiProperty({
    example: new Date().getTime(),
    description: '판매종료일',
    nullable: false,
    required: true,
  })
  endDate: Date;

  @IsArray()
  @ApiProperty({
    example: ['태그1', '태그2'],
    description: 'NFT 태그',
    required: false,
    default: [],
  })
  tags: string[];

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'NFT 미디어 id',
    required: true,
  })
  mediaId: number;
}
