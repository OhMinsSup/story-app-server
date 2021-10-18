import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// guard
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/decorators/get-user.decorator';

// service
import { StoriesService } from './story.service';

// dto
import { StoryCreateRequestDto } from './dtos/create.request.dto';

// types
import type { User } from '.prisma/client';

@ApiTags('Stories')
@Controller('/api/stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Get()
  @UseGuards(NotLoggedInGuard)
  @ApiOperation({ summary: '스토리 리스트 조회' })
  list() {
    return true;
  }

  @Get(':id')
  @UseGuards(NotLoggedInGuard)
  @ApiOperation({
    summary: '스토리 조회 API',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.detail(id);
  }

  @Post()
  @UseGuards(LoggedInGuard)
  @ApiOperation({
    summary: '스토리 생성 API',
  })
  @ApiBody({
    required: true,
    description: '스토리 생성 요청 데이터',
    type: StoryCreateRequestDto,
  })
  create(@AuthUser() user: User, @Body() input: StoryCreateRequestDto) {
    return this.storiesService.create(user, input);
  }

  @Put(':id')
  @UseGuards(LoggedInGuard)
  @ApiOperation({
    summary: '스토리 수정 API',
  })
  @ApiBody({
    required: true,
    description: '스토리 수정 요청 데이터',
    type: StoryCreateRequestDto,
  })
  update(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: StoryCreateRequestDto,
  ) {
    return this.storiesService.update(user, id, input);
  }
}
