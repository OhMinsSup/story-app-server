import { Injectable } from '@nestjs/common';
import webPush from 'web-push';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from 'src/push/push.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { EXCEPTION_CODE } from 'src/exception/exception.code';
import { SavePushRequestDto } from './dto/savePush.request.dto';

// types
import type { User } from '@prisma/client';

// http://daplus.net/javascript-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EB%B0%A9%EB%AC%B8%ED%95%98%EB%8A%94-%EC%BB%B4%ED%93%A8%ED%84%B0%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%EA%B3%A0%EC%9C%A0%ED%95%98%EA%B2%8C/

@Injectable()
export class NotificationsService {
  constructor(
    // https://nsinc.tistory.com/218
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  /**
   * @description 푸시 토큰을 저장한다
   * @param {User} user
   * @param {SavePushRequestDto} input
   */
  async save(user: User, input: SavePushRequestDto) {
    try {
      return null;
    } catch (error) {
      throw error;
    }
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
