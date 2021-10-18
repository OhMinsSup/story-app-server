import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// guard
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/decorators/get-user.decorator';

// service
import { StoriesService } from './story.service';

// dto
import { CreateRequestDto } from './dtos/create.request.dto';

// types
import type { User } from '.prisma/client';

@ApiTags('Stories')
@Controller('/api/stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  @UseGuards(LoggedInGuard)
  @ApiOperation({
    summary: '스토리 생성 API',
  })
  @ApiBody({
    required: true,
    description: '스토리 생성 요청 데이터',
    type: CreateRequestDto,
  })
  create(@AuthUser() user: User, @Body() input: CreateRequestDto) {
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
    type: CreateRequestDto,
  })
  update(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: CreateRequestDto,
  ) {
    return this.storiesService.update(user, id, input);
  }
}
