import { Injectable } from '@nestjs/common';
import webPush from 'web-push';

import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';

import { PushRequestDto } from './dto/push.request.dto';
import { EXCEPTION_CODE } from 'src/exception/exception.code';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * @description 푸시 토큰값을 가져온다
   */
  getPushToken() {
    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: this.firebaseService.vapidKey.publicKey,
    };
  }

  /**
   * @description 푸시 메시지를 발송한다
   * @param {PushRequestDto} input
   */
  async push(input: PushRequestDto) {
    console.log(input);
    try {
      const { privateKey, publicKey } = this.firebaseService.vapidKey;

      const subscription: webPush.PushSubscription = JSON.parse(
        input.subscription,
      );

      const payload: string | Buffer = JSON.stringify({
        title: input.title,
        message: input.message,
      });

      const options = {
        vapidDetails: {
          subject: `mailto:${process.env.GMAIL}`,
          publicKey,
          privateKey,
        },
      };

      console.log(subscription, input, payload, options);

      await webPush.sendNotification(subscription, payload, options);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: true,
      };
    } catch (error) {
      throw error;
    }
  }
}
