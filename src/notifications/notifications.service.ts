import { Injectable } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import {
  BaseMessage,
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import DeviceDetector from 'device-detector-js';
import * as bcrypt from 'bcrypt';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from 'src/push/push.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { EXCEPTION_CODE } from 'src/exception/exception.code';
import { SavePushRequestDto } from './dto/savePush.request.dto';

// http://daplus.net/javascript-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EB%B0%A9%EB%AC%B8%ED%95%98%EB%8A%94-%EC%BB%B4%ED%93%A8%ED%84%B0%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%EA%B3%A0%EC%9C%A0%ED%95%98%EA%B2%8C/
// https://nsinc.tistory.com/218

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  send(message: Message) {
    firebaseAdmin
      .messaging()
      .send(message)
      .then((res) => {
        console.log('보내기 성공 메시지: ', res);
      })
      .catch((err) => {
        console.log('보내기 실패 메세지: ', err);
      });
  }

  async sendMulticast(multiMessage: MulticastMessage) {
    return await firebaseAdmin.messaging().sendMulticast(multiMessage);
  }

  async sendPush(input: PushRequestDto) {
    const where = {
      AND: [
        {
          userId: {
            not: null,
          },
        },
        {
          token: {
            not: null,
          },
        },
      ],
    };

    const devices = await this.prisma.device.findMany({
      where,
    });
    console.log('devices: ', devices);
    const tokens: string[] = [];
    while (devices.length > 0) {
      devices.forEach((target) => {
        tokens.push(target.token);
      });
    }

    const multipleMessage: BaseMessage['notification'] = {
      title: input.title,
      body: input.message,
    };

    try {
      this.sendMulticast({
        notification: multipleMessage,
        tokens,
      });
    } catch (error) {
      console.log('error: ', error);
    }

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: {},
    };
  }

  /**
   * @description 푸시 토큰을 저장한다
   * @param {SavePushRequestDto} input
   * @param {string} userAgent
   */
  async save(input: SavePushRequestDto, userAgent: string) {
    try {
      const browserId = await bcrypt.hash(userAgent, 12);
      const deviceDetector = new DeviceDetector();
      const deviceInfo = deviceDetector.parse(userAgent);

      const device = await this.prisma.device.create({
        data: {
          os: deviceInfo.os.name,
          clientType: deviceInfo.client.type,
          deviceType: deviceInfo.device.type,
          deviceHash: browserId,
          token: input.pushToken,
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: device,
      };
    } catch (error) {
      throw error;
    }
  }
}
