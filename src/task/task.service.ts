import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'staleStoredTokens',
    timeZone: 'Asia/Seoul',
  })
  async staleStoredTokens() {
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
      message: 'staleStoredTokens - EVERY_DAY_AT_MIDNIGHT',
      payload: deletedDevices.map((device) => device.id),
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'notification',
    timeZone: 'Asia/Seoul',
  })
  async notification() {
    this.logger.debug('Called every EVERY_DAY_AT_MIDNIGHT');
  }
}
