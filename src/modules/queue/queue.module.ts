import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE, QUEUE_CONSTANTS } from '../../constants/config';
import { QueueService } from './queue.service';
import { PrismaService } from '../../database/prisma.service';
import { MintingConsumer } from './minting.consumer';
import { ItemConsumer } from './item.consumer';

@Module({
  providers: [PrismaService],
})
@Global()
export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        BullModule.registerQueue({
          name: QUEUE_CONSTANTS.MINTING,
          redis: {
            host: 'localhost',
            port: 6379,
            connectTimeout: 5000,
          },
        }),
        BullModule.registerQueue({
          name: QUEUE_CONSTANTS.ITEM,
          redis: {
            host: 'localhost',
            port: 6379,
            connectTimeout: 5000,
          },
        }),
      ],
      providers: [
        {
          provide: QUEUE,
          useValue: undefined,
        },
        QueueService,
        MintingConsumer,
        ItemConsumer,
      ],
      exports: [QueueService],
    };
  }
}
