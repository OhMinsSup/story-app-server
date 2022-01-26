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

  async pushMessage(input: PushRequestDto) {
    try {
      const devices = await this.prisma.device.findMany({
        where: {
          AND: [
            {
              token: {
                not: null,
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
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
              token: {
                not: null,
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
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
      const exists = await this.prisma.device.findFirst({
        where: {
          token: input.pushToken,
        },
      });

      if (exists) {
        // 토큰의 row값은 존재하지만 token이 빈값이면 토큰 만료
        if (!exists.token) {
          return {
            ok: true,
            resultCode: EXCEPTION_CODE.PUSH_TOKEN_EXPIRED,
            message: '푸시 토큰이 만료되었습니다.',
            result: exists,
          };
        }
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: exists,
        };
      }

      const result = await this.makeDeviceInfo(userAgent);
      const { os, clientType, deviceHash, deviceType } = result;
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
