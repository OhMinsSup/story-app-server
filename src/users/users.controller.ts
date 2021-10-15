import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { UsersService } from './users.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';
import { SigninRequestDto } from './dtos/signin.request.dto';

import type { Response } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: SignupRequestDto,
  })
  signup(@Body() input: SignupRequestDto) {
    return this.usersService.signup(input);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninRequestDto,
  })
  async signin(@Res() res: Response, @Body() input: SigninRequestDto) {
    const data = await this.usersService.signin(input);
    // set cookie
    if (typeof data.result === 'object' && data.ok) {
      res.cookie('access_token', data.result.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }

    return res.status(HttpStatus.OK).json(data);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(LoggedInGuard)
  logout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true });
    res.status(HttpStatus.OK).json(true);
  }
}
