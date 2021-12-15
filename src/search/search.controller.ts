import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

import type { StorySearchParams } from 'src/story/dtos/story.interface';

@ApiTags('Search')
@Controller('/api/search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: '검색 API',
  })
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
    name: 'background',
    type: String,
    required: false,
    description: '배경 이미지',
  })
  @ApiQuery({
    name: 'tags',
    type: String,
    required: false,
    isArray: true,
    description: '태그',
  })
  search(@Query() query: StorySearchParams) {
    return this.searchService.search(query);
  }
}
