import { Module } from '@nestjs/common';

// controllers
import { StoriesController } from './story.controller';

// service
import { StoriesService } from './story.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagsService } from 'src/tags/tags.service';

@Module({
  providers: [StoriesService, PrismaService, TagsService],
  controllers: [StoriesController],
})
export class StoriesModule {}
