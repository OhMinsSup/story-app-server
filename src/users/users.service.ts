import { Injectable } from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';
import type { AuthUserSchema } from 'src/libs/get-user.decorator';
import { EXCEPTION_CODE } from '../constants/exception.code';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
  ) {}

  /**
   * @description 유저 정보를 가져온다.
   * @param {AuthUserSchema} user
   */
  async getUserInfo(user: AuthUserSchema) {
    const balance = await this.klaytn.getBalance(user.wallet.address);

    const { price, unit } = this.klaytn.fromPeb(balance);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        ...user,
        wallet: {
          ...user.wallet,
          balance: price,
          unit,
        },
      },
    };
  }
}
