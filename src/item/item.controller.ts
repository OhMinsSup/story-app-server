import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListRequestDto } from './dto/list.request.dto';
import { AuthUser, AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
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

  @Get(':id')
  @ApiOperation({ summary: '아이템 조회' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Get()
  @ApiOperation({ summary: '아이템 목록 조회' })
  @ApiQuery({
    name: 'query',
    type: ListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  list(@Query() query: ListRequestDto) {
    return this.service.list(query);
  }
}
