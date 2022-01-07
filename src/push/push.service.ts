import webpush from 'web-push';
import { Inject, Injectable } from '@nestjs/common';

import { PUSH_OPITIONS } from 'src/common/common.constants';

@Injectable()
export class PushService {
  constructor(
    @Inject(PUSH_OPITIONS)
    private readonly vapidKeys: webpush.VapidKeys,
  ) {}

  get getVapidKeys(): webpush.VapidKeys {
    return this.vapidKeys;
  }
}
