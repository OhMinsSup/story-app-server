import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeviceRequestDto {
  @IsString()
  @ApiProperty({
    example: 'string',
    description: '푸시 토큰값',
    required: true,
  })
  pushToken: string;
}
