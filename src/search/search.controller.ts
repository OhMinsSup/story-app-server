import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

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
  list(@Query() query: Record<string, any>) {
    return this.searchService.search('');
  }
}
