import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('/api/tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: '태그 리스트' })
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
  list(
    @Query('pageNo', ParseIntPipe) pageNo: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.tagsService.list(pageNo, pageSize);
  }
}
