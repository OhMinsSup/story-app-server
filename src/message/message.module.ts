import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { MessageController } from './message.controller';

@Module({
  providers: [MessageService, PrismaService],
  controllers: [MessageController],
})
export class MessageModule {}
