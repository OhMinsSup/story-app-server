import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/middlewares/transform.interceptor';

// service
import { UsersService } from './user.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignupRequestDto })
  @UseInterceptors(TransformInterceptor)
  async signup(@Body() data: SignupRequestDto) {
    return await this.usersService.create(data);
  }
}
