import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoriesService } from 'src/story/story.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  providers: [
    SearchService,
    PrismaService,
    StoriesService,
    NotificationsService,
  ],
  controllers: [SearchController],
})
export class SearchModule {}
