import { Injectable, NotFoundException } from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';
import type { AuthUserSchema } from 'src/libs/get-user.decorator';
import { EXCEPTION_CODE } from '../constants/exception.code';

@Injectable()
export class TxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
  ) {}

  /**
   * @description 거래 영수증 정보를 가져온다.
   * @param {string} txHash
   */
  async getTransactionReceipt(txHash: string) {
    const txInfo = await this.prisma.transactionReceipt.findUnique({
      where: {
        transactionHash: txHash,
      },
    });

    if (!txInfo) {
      throw new NotFoundException({
        status: EXCEPTION_CODE.NOT_EXIST,
        msg: ['존재하지 않는 영수증 내역입니다.'],
        error: 'NOT_EXIST',
      });
    }

    const item = await this.prisma.item.findFirst({
      where: {
        nftId: txInfo.nftId,
      },
      select: {
        title: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        beginDate: true,
        endDate: true,
        backgroundColor: true,
        externalSite: true,
        status: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        file: {
          select: {
            publicId: true,
            version: true,
            foramt: true,
            secureUrl: true,
            mediaType: true,
          },
        },
      },
    });

    const receipt = await this.klaytn.getReceipt(txHash);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        item,
        receipt,
      },
    };
  }
}
