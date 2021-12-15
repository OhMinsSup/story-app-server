import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoriesService } from 'src/story/story.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  providers: [SearchService, PrismaService, StoriesService],
  controllers: [SearchController],
})
export class SearchModule {}
