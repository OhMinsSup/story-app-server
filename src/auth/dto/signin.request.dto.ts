import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SigninRequestDto {
  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    example: 'tester@email.com',
    description: '이메일',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  email: string;

  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: '패스워드',
    maxLength: 10,
    type: 'string',
    required: true,
  })
  password: string;
}
