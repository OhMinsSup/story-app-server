import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { CreateRequestDto } from './dto/create.request.dto';
import { SigninRequestDto } from './dto/signin.request.dto';

@ApiTags('인증')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninRequestDto,
  })
  signin(@Body() input: SigninRequestDto) {
    // if (typeof data.result === 'object' && data.ok) {
    //   res.cookie('access_token', data.result.accessToken, {
    //     httpOnly: true,
    //     domain: 'localhost',
    //     path: '/',
    //     maxAge: 1000 * 60 * 60 * 24 * 30,
    //     sameSite: 'lax',
    //   });
    // }
    return this.service.signin(input);
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: CreateRequestDto,
  })
  signup(@Body() input: CreateRequestDto) {
    // if (typeof data.result === 'object' && data.ok) {
    //   res.cookie('access_token', data.result.accessToken, {
    //     httpOnly: true,
    //     domain: 'localhost',
    //     path: '/',
    //     maxAge: 1000 * 60 * 60 * 24 * 30,
    //     sameSite: 'lax',
    //   });
    // }
    return this.service.create(input);
  }
}
