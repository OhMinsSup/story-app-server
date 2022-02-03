import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from 'src/push/push.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'pushTokens',
    timeZone: 'Asia/Seoul',
  })
  async pushTokens() {
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

    const deletedDevices = devices.filter((device) => {
      const now = new Date();
      const createdAt = new Date(device.createdAt);
      return now.getTime() - createdAt.getTime() > 30 * 24 * 60 * 60 * 1000;
    });

    if (deletedDevices.length) {
      // push 토큰이 유효하지 않은 기기를 삭제한다.(push token 제거)
      await Promise.all(
        deletedDevices.map((device) =>
          this.prisma.device.update({
            data: { token: '' },
            where: { id: device.id },
          }),
        ),
      );
    }

    this.logger.debug({
      message: 'pushTokens - EVERY_DAY_AT_MIDNIGHT',
      payload: deletedDevices.map((device) => device.id),
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'notification',
    timeZone: 'Asia/Seoul',
  })
  async notification() {
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

    const validdDevices = devices
      .filter((device) => {
        const now = new Date();
        const createdAt = new Date(device.createdAt);
        return now.getTime() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000;
      })
      .filter((device) => device.token);

    const tokens = validdDevices.map((device) => device.token);

    if (tokens.length) {
      // push token이 유효한 기기만 메시지 발송
      await this.pushService.pushBulkMessage(tokens, '', '');
    }

    this.logger.debug({
      message: 'notification - EVERY_DAY_AT_MIDNIGHT',
      payload: validdDevices.map((device) => device.id),
    });
  }
}
