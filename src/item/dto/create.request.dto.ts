import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: 'string',
    description: '제목',
    maxLength: 100,
    type: 'string',
    required: true,
  })
  title: string;

  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    example: 'string',
    description: '설명',
    maxLength: 1000,
    type: 'string',
    required: true,
  })
  description: string;

  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 3,
  })
  @ApiProperty({
    example: 'number',
    description: '가격',
    type: 'number',
    required: true,
  })
  price: number;

  @IsNumber()
  @ApiProperty({
    example: new Date().getTime(),
    description: '판매시작일',
    type: 'number',
    required: true,
  })
  beginDate: number;

  @IsNumber()
  @ApiProperty({
    example: new Date().getTime(),
    description: '판매종료일',
    type: 'number',
    required: true,
  })
  endDate: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: '공개상태',
    nullable: true,
    required: false,
    type: 'boolean',
    default: false,
  })
  isPublic?: boolean;

  @IsString()
  @IsHexColor()
  @IsOptional()
  @ApiProperty({
    example: '#3ea6ff',
    description: '배경색',
    nullable: true,
    type: 'string',
    required: false,
  })
  backgroundColor?: string | null;

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    example: 'opensea,krafter',
    description: '연관된 사이트',
    nullable: true,
    type: 'string',
    required: false,
  })
  externalSite?: string | null;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    example: ['태그1', '태그2'],
    description: 'NFT 태그',
    required: false,
    type: 'array',
    isArray: true,
    items: {
      type: 'string',
    },
    default: [],
  })
  tags?: string[] | null;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '파일 아이디',
    required: true,
  })
  fileId: number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '썸네일 아이디',
    required: true,
  })
  thumbnailId: number;
}
