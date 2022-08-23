import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, AuthUserSchema } from 'src/libs/get-user.decorator';
import { LoggedInGuard } from 'src/modules/auth/logged-in.guard';
import { CreateRequestDto } from './dto/create.request.dto';
import { ItemService } from './item.service';

@ApiTags('아이템')
@Controller('api/items')
export class ItemController {
  constructor(private readonly service: ItemService) {}

  @Post()
  @ApiOperation({ summary: '아이템 등록' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: CreateRequestDto,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: AuthUserSchema, @Body() input: CreateRequestDto) {
    return this.service.create(user, input);
  }
}
