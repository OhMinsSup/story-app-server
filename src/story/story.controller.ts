import { Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoriesService } from './story.service';

@ApiTags('Stories')
@Controller('/api/stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  @ApiOperation({
    summary: '스토리 생성 API',
  })
  @ApiBody({
    required: true,
    description: '스토리 생성 요청 데이터',
    type: 'object',
  })
  create() {
    return true;
  }
}
