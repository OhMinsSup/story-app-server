import { Module } from '@nestjs/common';

// controllers
import { StoriesController } from './story.controller';

// service
import { StoriesService } from './story.service';
import { PrismaService } from 'src/prisma/prisma.service';
// import { TagsService } from 'src/tags/tags.service';
// import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  providers: [
    StoriesService,
    PrismaService,
    // TagsService, NotificationsService
  ],
  controllers: [StoriesController],
})
export class StoriesModule {}
