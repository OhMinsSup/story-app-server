import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { UsersService } from './user.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';
import { SigninRequestDto } from './dtos/signin.request.dto';

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
  signup(@Body() data: SignupRequestDto) {
    return this.usersService.signup(data);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninRequestDto,
  })
  signin(@Body() data: SigninRequestDto) {
    return this.usersService.signin(data);
  }
}
