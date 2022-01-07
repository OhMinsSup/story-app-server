import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { MessageController } from './notifications.controller';

@Module({
  providers: [NotificationsService, PrismaService],
  controllers: [MessageController],
})
export class NotificationseModule {}
