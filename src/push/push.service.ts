import { Inject, Injectable } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

import { PUSH_OPITIONS } from 'src/common/common.constants';

import type { PushModuleOptions } from './push.interface';

@Injectable()
export class PushService {
  constructor(
    @Inject(PUSH_OPITIONS)
    private readonly pushOptions: PushModuleOptions,
  ) {
    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          this.pushOptions.firebaseSpecsPath,
        ),
      });
    }
  }

  private readonly options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };

  private readonly optionsSilent = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
    content_available: true,
  };

  async sendNotification(
    deviceIds: string[],
    payload: firebaseAdmin.messaging.MessagingPayload,
    silent?: boolean,
  ) {
    if (deviceIds.length == 0) {
      throw new Error('You provide an empty device ids list!');
    }

    const result = await firebaseAdmin
      .messaging()
      .sendToDevice(
        deviceIds,
        payload,
        silent ? this.optionsSilent : this.options,
      );

    return result;
  }
}
