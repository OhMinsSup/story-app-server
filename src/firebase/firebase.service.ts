import webpush from 'web-push';
import { Inject, Injectable } from '@nestjs/common';
import { FIREBASE_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject(FIREBASE_OPTIONS)
    private readonly vapidKeys: webpush.VapidKeys,
  ) {}

  get vapidKey(): webpush.VapidKeys {
    return this.vapidKeys;
  }
}
