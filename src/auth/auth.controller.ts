import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CookiInterceptor } from '../libs/cookie.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';

import {
  CreateKeystoreRequestDto,
  CreateRequestDto,
} from './dto/create.request.dto';
import {
  SigninByKeyStoryRequestDto,
  SigninRequestDto,
} from './dto/signin.request.dto';

// types
import type { Response } from 'express';
import { LogoutResponseDto } from './dto/auth.dto';

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

  @Post('keystore/signup')
  @ApiOperation({ summary: 'keystore 회원가입' })
  @ApiBody({
    required: true,
    type: CreateKeystoreRequestDto,
    description: 'keystore 회원가입 API',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(CookiInterceptor)
  signupForKeystore(
    @Body() input: CreateKeystoreRequestDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'json',
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.createForKeystore(input, file);
  }

  @Post('keystore/signin')
  @ApiOperation({ summary: 'keystore 로그인' })
  @ApiBody({
    required: true,
    type: SigninByKeyStoryRequestDto,
    description: 'keystore 로그인 API',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(CookiInterceptor)
  signinForKeystore(
    @Body() input: SigninByKeyStoryRequestDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'json',
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.signinForKeystore(input, file);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({
    type: LogoutResponseDto,
  })
  @UseGuards(LoggedInGuard)
  logout(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.service.logout(res));
  }
}
