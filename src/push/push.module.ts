import { DynamicModule, Global, Module } from '@nestjs/common';
import { PUSH_OPITIONS } from 'src/common/common.constants';
import { PushModuleOptions } from './push.interface';

import { PushService } from './push.service';

@Module({})
@Global()
export class PushModule {
  static forRoot(options: PushModuleOptions): DynamicModule {
    return {
      module: PushModule,
      providers: [
        {
          provide: PUSH_OPITIONS,
          useValue: options,
        },
        PushService,
      ],
      exports: [PushService],
    };
  }
}
