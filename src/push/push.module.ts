import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PUSH_OPITIONS, QUEUE_CONSTANTS } from 'src/common/common.constants';
import { PushModuleOptions } from './push.interface';

import { PushService } from './push.service';
import { TokenConsumer } from './token.consumer';
import { MessageConsumer } from './message.consumer';

@Module({})
@Global()
export class PushModule {
  static forRoot(options: PushModuleOptions): DynamicModule {
    return {
      module: PushModule,
      imports: [
        BullModule.registerQueue({
          name: QUEUE_CONSTANTS.TOKEN,
          redis: {
            host: 'localhost',
            port: 6379,
            connectTimeout: 5000,
          },
        }),
        BullModule.registerQueue({
          name: QUEUE_CONSTANTS.MESSAGE,
          redis: {
            host: 'localhost',
            port: 6379,
            connectTimeout: 5000,
          },
        }),
      ],
      providers: [
        {
          provide: PUSH_OPITIONS,
          useValue: options,
        },
        PushService,
        TokenConsumer,
        MessageConsumer,
      ],
      exports: [PushService],
    };
  }
}
