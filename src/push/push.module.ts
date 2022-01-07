import webpush from 'web-push';
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
          useValue: (() => {
            // VAPID keys should only be generated only once.
            const vapidKeys = webpush.generateVAPIDKeys();
            webpush.setGCMAPIKey(options.fcmServerkey);
            webpush.setVapidDetails(
              `mailto:${options.gmail}`,
              vapidKeys.publicKey,
              vapidKeys.privateKey,
            );
            return vapidKeys;
          })(),
        },
        PushService,
      ],
      exports: [PushService],
    };
  }
}
