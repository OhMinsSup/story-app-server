import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { UsersService } from './users.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';
import { SigninRequestDto } from './dtos/signin.request.dto';
import { User } from '.prisma/client';
import type { Response } from 'express';

// decorators
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { EXCEPTION_CODE } from 'src/exception/exception.code';
import { ProfileUpdateRequestDto } from './dtos/profileUpdate.request.dto';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  @ApiOperation({
    summary: '로그인한 유저 정보',
  })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: User) {
    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: user,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '유저 정보',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.detail(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '유저 정보 수정',
  })
  @ApiBody({
    required: true,
    description: '유저 정보 수정',
    type: ProfileUpdateRequestDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: ProfileUpdateRequestDto,
  ) {
    this.usersService.update(id, input);
  }

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
