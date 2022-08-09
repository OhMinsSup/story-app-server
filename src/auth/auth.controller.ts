import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { CreateRequestDto } from './dto/create.request.dto';

@ApiTags('인증')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: CreateRequestDto,
  })
  signup(@Body() input: CreateRequestDto) {
    return this.service.create(input);
  }
}
