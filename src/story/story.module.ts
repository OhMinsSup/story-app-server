import { Module } from '@nestjs/common';
import { StoriesService } from './story.service';
import { StoriesController } from './story.controller';

@Module({
  providers: [StoriesService],
  controllers: [StoriesController],
})
export class StoriesModule {}
