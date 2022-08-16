import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EXCEPTION_CODE } from 'src/constants/exception.code';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';

@ApiTags('사용자')
@Controller('api/users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: '내 정보' })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: AuthUserSchema) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: user,
    };
  }
}
