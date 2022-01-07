import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { NotificationController } from './notifications.controller';

@Module({
  providers: [NotificationsService, PrismaService],
  controllers: [NotificationController],
})
export class NotificationseModule {}
