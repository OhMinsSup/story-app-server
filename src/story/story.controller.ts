import {
  Body,
  Controller,
  //   Delete,
  //   Get,
  //   Param,
  //   ParseIntPipe,
  Post,
  //   Put,
  //   Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  // ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// guard
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/auth/get-user.decorator';

// service
import { StoriesService } from './story.service';

// dto
import { StoryCreateRequestDto } from './dtos/create.request.dto';

// types
import type { User } from '.prisma/client';
// import type { SearchParams } from './dtos/story.interface';
// import { StatusRequestDto } from './dtos/status.request.dto';

@ApiTags('Stories')
@Controller('/api/stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  //   @Get()
  //   @ApiOperation({ summary: '스토리 리스트 조회' })
  //   @ApiQuery({
  //     name: 'pageNo',
  //     type: Number,
  //     required: false,
  //     description: '페이지 번호',
  //   })
  //   @ApiQuery({
  //     name: 'pageSize',
  //     type: Number,
  //     required: false,
  //     description: '페이지 사이즈',
  //   })
  //   @ApiQuery({
  //     name: 'isPrivate',
  //     type: Boolean,
  //     required: false,
  //     description: '개인 스토리 여부',
  //   })
  //   @ApiQuery({
  //     name: 'userId',
  //     type: Number,
  //     required: false,
  //     description: '유저 아이디',
  //   })
  //   list(@Query() query: Partial<SearchParams>) {
  //     return this.storiesService.list(query);
  //   }

  //   @Delete(':id')
  //   @UseGuards(LoggedInGuard)
  //   @ApiOperation({
  //     summary: '스토리 삭제 API',
  //   })
  //   delete(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
  //     return this.storiesService.delete(user, id);
  //   }

  //   @Get(':id')
  //   @ApiOperation({
  //     summary: '스토리 조회 API',
  //   })
  //   detail(@Param('id', ParseIntPipe) id: number) {
  //     return this.storiesService.detail(id);
  //   }

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

  //   @Put(':id')
  //   @UseGuards(LoggedInGuard)
  //   @ApiOperation({
  //     summary: '스토리 수정 API',
  //   })
  //   @ApiBody({
  //     required: true,
  //     description: '스토리 수정 요청 데이터',
  //     type: StoryCreateRequestDto,
  //   })
  //   update(
  //     @AuthUser() user: User,
  //     @Param('id', ParseIntPipe) id: number,
  //     @Body() input: StoryCreateRequestDto,
  //   ) {
  //     return this.storiesService.update(user, id, input);
  //   }

  //   @Get(':id/anothers/:userId')
  //   @ApiOperation({ summary: '작품을 작성한 사람의 다른 작품 리스트 조회' })
  //   anothers(
  //     @Param('id', ParseIntPipe) id: number,
  //     @Param('userId', ParseIntPipe) userId: number,
  //   ) {
  //     return this.storiesService.anotherStories(id, userId);
  //   }

  //   @Post(':id/like')
  //   @UseGuards(LoggedInGuard)
  //   @ApiOperation({ summary: '스토리 좋아요 API' })
  //   like(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
  //     return this.storiesService.like(user, id);
  //   }

  //   @Delete(':id/like')
  //   @UseGuards(LoggedInGuard)
  //   @ApiOperation({ summary: '스토리 좋아요 취소 API' })
  //   unlike(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
  //     return this.storiesService.unlike(user, id);
  //   }

  //   @Get(':id/likes')
  //   @ApiQuery({
  //     name: 'pageNo',
  //     type: Number,
  //     required: false,
  //     description: '페이지 번호',
  //   })
  //   @ApiQuery({
  //     name: 'pageSize',
  //     type: Number,
  //     required: false,
  //     description: '페이지 사이즈',
  //   })
  //   @ApiOperation({ summary: '스토리 좋아요 리스트 조회 API' })
  //   likes(
  //     @Param('id', ParseIntPipe) id: number,
  //     @Query() query: Partial<Pick<SearchParams, 'pageNo' | 'pageSize'>>,
  //   ) {
  //     return this.storiesService.storyLikes(id, query.pageNo, query.pageSize);
  //   }

  //   @Put(':id/status')
  //   @UseGuards(LoggedInGuard)
  //   @ApiBody({
  //     required: true,
  //     description: '스토리 판매 상태 변경 데이터',
  //     type: StatusRequestDto,
  //   })
  //   @ApiOperation({ summary: '스토리 판매 상태 변경 API' })
  //   statusChange(
  //     @AuthUser() user: User,
  //     @Param('id', ParseIntPipe) id: number,
  //     @Body() input: StatusRequestDto,
  //   ) {
  //     return this.storiesService.statusChange(user, id, input);
  //   }
}
