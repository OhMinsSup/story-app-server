import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { MeOkResponseDto } from './dto/me.dto';
import { UsersService } from './users.service';

@ApiTags('사용자')
@Controller('api/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @ApiOkResponse({
    type: MeOkResponseDto,
  })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: AuthUserSchema) {
    return this.service.getUserInfo(user);
  }
}
