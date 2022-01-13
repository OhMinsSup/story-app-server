import { Injectable } from '@nestjs/common';
import webPush from 'web-push';

import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from 'src/push/push.service';

import { PushRequestDto } from './dto/push.request.dto';
import { EXCEPTION_CODE } from 'src/exception/exception.code';

@Injectable()
export class NotificationsService {
  constructor(
    // https://nsinc.tistory.com/218
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  /**
   * @description 푸시 토큰값을 가져온다
   */
  getPushToken() {
    const { publicKey } = this.pushService.getVapidKeys;
    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: publicKey,
    };
  }

  /**
   * @description 푸시 메시지를 발송한다
   * @param {PushRequestDto} input
   */
  async push(input: PushRequestDto) {
    try {
      const { privateKey, publicKey } = this.pushService.getVapidKeys;

      const subscription: webPush.PushSubscription = JSON.parse(
        input.subscription,
      );

      const payload: string | Buffer = JSON.stringify({
        title: input.title,
        message: input.message,
        ...(input.linkUrl && { linkUrl: input.linkUrl }),
      });

      const options = {
        vapidDetails: {
          subject: `mailto:${process.env.GMAIL}`,
          publicKey,
          privateKey,
        },
      };

      await webPush.sendNotification(subscription, payload, options);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
