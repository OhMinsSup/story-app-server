import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class paginationRequestDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: 'limit',
    type: 'number',
    required: false,
    description: '페이지 크기',
    default: 20,
  })
  limit?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: 'cursor',
    type: 'number',
    required: false,
    description: '페이지 커서',
  })
  cursor?: number;
}
