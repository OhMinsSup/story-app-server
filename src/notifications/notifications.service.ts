import { Injectable } from '@nestjs/common';
import DeviceDetector from 'device-detector-js';
import * as bcrypt from 'bcrypt';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from 'src/push/push.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { EXCEPTION_CODE } from 'src/exception/exception.code';
import { TokenPushRequestDto } from './dto/tokenPush.request.dto';

// http://daplus.net/javascript-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EB%B0%A9%EB%AC%B8%ED%95%98%EB%8A%94-%EC%BB%B4%ED%93%A8%ED%84%B0%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%EA%B3%A0%EC%9C%A0%ED%95%98%EA%B2%8C/
// https://nsinc.tistory.com/218

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  private async makeDeviceInfo(userAgent: string) {
    const deviceHash = await bcrypt.hash(userAgent, 12);
    const deviceDetector = new DeviceDetector();
    const deviceInfo = deviceDetector.parse(userAgent);
    return {
      os: deviceInfo.os.name,
      clientType: deviceInfo.client.type,
      deviceType: deviceInfo.device.type,
      deviceHash,
    };
  }

  findByPushToken(pushToken: string) {
    return this.prisma.device.findFirst({
      where: {
        token: pushToken,
      },
    });
  }

  async pushMessage(input: PushRequestDto) {
    try {
      const devices = await this.prisma.device.findMany({
        where: {
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
        },
      });
      const tokens: string[] = devices.map((device) => device.token);
      if (tokens.length) {
        await this.pushService.pushBulkMessage(
          tokens,
          input.title,
          input.message,
        );
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: null,
        };
      }

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          failureCount: 0,
          successCount: 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async send(input: PushRequestDto) {
    try {
      const devices = await this.prisma.device.findMany({
        where: {
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
        },
      });
      const tokens: string[] = devices.map((device) => device.token);

      if (tokens.length) {
        const message = await this.pushService.sendNotification(tokens, {
          notification: {
            title: input.title,
            body: input.message,
            icon: './images/android-chrome-192x192.png',
          },
        });
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: {
            failureCount: message.failureCount,
            successCount: message.successCount,
          },
        };
      }

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          failureCount: 0,
          successCount: 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description 푸시 토큰을 저장한다
   * @param {TokenPushRequestDto} input
   * @param {string} userAgent
   */
  async token(input: TokenPushRequestDto, userAgent: string) {
    try {
      const exists = await this.findByPushToken(input.pushToken);
      if (exists) {
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: exists,
        };
      }

      const { os, clientType, deviceHash, deviceType } =
        await this.makeDeviceInfo(userAgent);
      const device = await this.prisma.device.create({
        data: {
          os,
          clientType,
          deviceType,
          deviceHash,
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
