import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StatusRequestDto {
  @IsString()
  @ApiProperty({
    example: 'waiting',
    description: '판매상태 변경',
    enum: ['waiting', 'sale', 'complete', 'end'],
    required: true,
  })
  status: string; // (waiting : 판매대기, sale : 판매중, complete : 판매완료, end: 판매 종료)
}
