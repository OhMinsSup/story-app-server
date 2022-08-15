import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
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
  @MaxLength(255)
  @ApiProperty({
    example: 'tester',
    description: '유저명',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  username: string;

  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: '패스워드',
    maxLength: 10,
    type: 'string',
    required: true,
  })
  password: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  @ApiProperty({
    description: '프로필 url',
    maxLength: 1000,
    type: 'string',
    required: false,
    nullable: true,
  })
  profileUrl?: string | null;
}

export class CreateKeystoreRequestDto extends CreateRequestDto {
  @ApiProperty({
    example: 'KakaoTalk_Photo_2021-08-11-01-13-45.json',
    description: '업로드 파일',
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
