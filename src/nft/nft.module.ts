import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  controllers: [NftController],
  providers: [PrismaService, NotificationsService, NftService],
})
export class NftModule {}
