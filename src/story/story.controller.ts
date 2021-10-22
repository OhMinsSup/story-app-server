import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// guard
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
  @ApiOperation({ summary: '스토리 리스트 조회' })
  @ApiQuery({
    name: 'pageNo',
    type: Number,
    required: false,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: '페이지 사이즈',
  })
  @ApiQuery({
    name: 'isPrivate',
    type: Boolean,
    required: false,
    description: '개인 스토리 여부',
  })
  list(
    @AuthUser() user: User,
    @Query('pageNo', ParseIntPipe) pageNo: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('isPrivate', ParseBoolPipe) isPrivate: boolean,
  ) {
    return this.storiesService.list(user, { pageNo, pageSize, isPrivate });
  }

  @Delete(':id')
  @UseGuards(LoggedInGuard)
  @ApiOperation({
    summary: '스토리 삭제 API',
  })
  delete(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.storiesService.delete(user, id);
  }

  @Get(':id')
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
