import webpush from 'web-push';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { FIREBASE_OPTIONS } from 'src/common/common.constants';
import { FirebaseModuleOptions } from './firebase.interface';
import { FirebaseService } from './firebase.service';

@Module({})
@Global()
export class FirebaseModule {
  static forRoot(options: FirebaseModuleOptions): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [
        {
          provide: FIREBASE_OPTIONS,
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
        FirebaseService,
      ],
      exports: [FirebaseService],
    };
  }
}
