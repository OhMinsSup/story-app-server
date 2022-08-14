import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookiInterceptor } from 'src/libs/cookie.interceptor';
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
  @UseInterceptors(CookiInterceptor)
  signin(@Body() input: SigninRequestDto) {
    return this.service.signin(input);
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: CreateRequestDto,
  })
  @UseInterceptors(CookiInterceptor)
  signup(@Body() input: CreateRequestDto) {
    return this.service.create(input);
  }
}
