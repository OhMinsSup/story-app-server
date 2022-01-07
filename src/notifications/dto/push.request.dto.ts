import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PushRequestDto {
  @IsString()
  @ApiProperty({
    example: '타이틀',
    description: 'Push 타이틀',
    required: true,
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: '내용',
    description: 'Push 내용',
    required: true,
  })
  message: string;

  @IsString()
  @ApiProperty({
    example: 'subscription 정보',
    description: 'subscription 정보',
    required: true,
  })
  subscription: string;
}
