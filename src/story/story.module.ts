import { Module } from '@nestjs/common';
import { StoriesService } from './story.service';
import { StoriesController } from './story.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [StoriesService, PrismaService],
  controllers: [StoriesController],
})
export class StoriesModule {}
