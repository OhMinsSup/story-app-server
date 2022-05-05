import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// constants
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';

// dto
import { DeviceRequestDto } from './dto/device.request.dto';

// types
import type { User } from '@prisma/client';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 푸시 토큰을 저장한다
   * @param {User} user
   * @param {DeviceRequestDto} input
   */
  async create(user: User, input: DeviceRequestDto) {
    const whereDeviceIs = Prisma.validator<Prisma.DeviceWhereInput>()({
      AND: [
        {
          id: user.id,
        },
        {
          token: input.pushToken,
        },
        {
          deletedAt: null,
        },
      ],
    });

    const exists_device = await this.prisma.device.findFirst({
      select: {
        id: true,
        token: true,
        createdAt: true,
      },
      where: whereDeviceIs,
    });

    if (exists_device) {
      const now = new Date();
      const createdAt = new Date(exists_device.createdAt);
      const expiredPushToken =
        now.getTime() - createdAt.getTime() > 15 * 24 * 60 * 60 * 1000;
      // 토큰의 row값은 존재하지만 token이 빈값이면 토큰 만료
      if (expiredPushToken) {
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.PUSH_TOKEN_EXPIRED,
          message: '푸시 토큰이 만료되었습니다.',
          result: exists_device,
        };
      }

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: exists_device,
      };
    }

    const device = await this.prisma.device.create({
      data: {
        userId: user.id,
        token: input.pushToken,
      },
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: device,
    };
  }
}
