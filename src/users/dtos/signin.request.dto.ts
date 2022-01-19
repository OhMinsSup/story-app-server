import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SigninRequestDto {
  @IsString()
  @ApiProperty({
    description: '유저의 이메일',
    required: true,
    example: 'tester01@email.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: '유저의 비밀번호',
    required: true,
    example: '12345678',
  })
  password: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '디바이스 아이디',
    required: false,
    example: 1,
  })
  deviceId?: number;
}
