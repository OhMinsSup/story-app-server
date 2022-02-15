import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EXCEPTION_CODE } from 'src/exception/exception.code';
import { KlaytnService } from 'src/klaytn/klaytn.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { historiesSelect } from 'src/common/select.option';

import type { User } from '.prisma/client';
import { SellerRequestDto } from './dto/seller.request.dto';

@Injectable()
export class NftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytnService: KlaytnService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * @description 토큰 판매 취소
   * @param user {User}
   * @param storyId {number}
   */
  async cancel(user: User, storyId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const story = await tx.story.findFirst({
        where: { id: storyId },
        select: {
          userId: true,
          tokenId: true,
          owner: {
            select: {
              account: {
                select: {
                  privateKey: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      // if (typeof story.price === 'undefined' || story.price === null) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '가격이 제시가 안된 NFT 입니다.',
      //   });
      // }

      // if (!story.unit) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '유형이 올바르지 않습니다.',
      //   });
      // }

      // const klayUnit = this.klaytnService.klayUnit();
      // if (!klayUnit[story.unit]) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '유형이 올바르지 않습니다.',
      //   });
      // }

      const receipt = await this.klaytnService.cancel({
        tokenId: story.tokenId,
        owner: {
          address: story.owner.account.address,
          privateKey: story.owner.account.privateKey,
        },
      });

      if (!receipt) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NFT_FAIL,
          msg: 'NFT 판매 취소가 실패했습니다.',
        });
      }

      // 발생 NFT 토큰 ID
      const transformBlockNumber = `${receipt.blockNumber}`;

      await tx.transaction.create({
        data: {
          status: 'CANCEL',
          storyId: storyId,
          blockHash: receipt.blockHash,
          blockNumber: transformBlockNumber,
          transactionHash: receipt.transactionHash,
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: storyId,
        },
      };
    });

    return result;
  }

  /**
   * @description 토큰 구매자 설정
   * @param user {User}
   * @param storyId {number}
   */
  async buyer(user: User, storyId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const story = await tx.story.findFirst({
        where: { id: storyId },
        select: {
          userId: true,
          tokenId: true,
          owner: {
            select: {
              account: {
                select: {
                  privateKey: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      // if (typeof story.price === 'undefined' || story.price === null) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '가격이 올바르지 않습니다.',
      //   });
      // }

      // if (!story.unit) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '유형이 올바르지 않습니다.',
      //   });
      // }

      // const klayUnit = this.klaytnService.klayUnit();
      // if (!klayUnit[story.unit]) {
      //   throw new BadRequestException({
      //     resultCode: EXCEPTION_CODE.INVALID_PARAM,
      //     msg: '유형이 올바르지 않습니다.',
      //   });
      // }

      const receipt = await this.klaytnService.buy(
        {
          tokenId: story.tokenId,
          // price: story.price,
          price: 1000,
          owner: {
            address: story.owner.account.address,
            privateKey: story.owner.account.privateKey,
          },
        },
        // story.unit,
        'ped',
      );

      if (!receipt) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NFT_FAIL,
          msg: 'NFT 구매가 실패했습니다.',
        });
      }

      // 발생 NFT 토큰 ID
      const transformBlockNumber = `${receipt.blockNumber}`;

      await tx.transaction.create({
        data: {
          status: 'BUYER',
          storyId: storyId,
          blockHash: receipt.blockHash,
          blockNumber: transformBlockNumber,
          transactionHash: receipt.transactionHash,
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: storyId,
        },
      };
    });

    return result;
  }

  /**
   * @description 토큰 판매자 설정
   * @param user {User}
   * @param storyId {number}
   * @param input {SellerRequestDto}
   */
  async seller(user: User, storyId: number, input: SellerRequestDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const story = await tx.story.findFirst({
        where: { id: storyId },
        select: {
          tokenId: true,
          userId: true,
          owner: {
            select: {
              account: {
                select: {
                  privateKey: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      const klayUnit = this.klaytnService.klayUnit();
      if (!klayUnit[input.unit]) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.INVALID_PARAM,
          msg: '유형이 올바르지 않습니다.',
        });
      }

      const receipt = await this.klaytnService.seller(
        {
          tokenId: story.tokenId,
          price: input.price,
          owner: {
            address: story.owner.account.address,
            privateKey: story.owner.account.privateKey,
          },
        },
        input.unit,
      );

      if (!receipt) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NFT_FAIL,
          msg: 'NFT 판매가 실패했습니다.',
        });
      }

      // 발생 NFT 토큰 ID
      const transformBlockNumber = `${receipt.blockNumber}`;

      await Promise.all([
        // 스토리 소유권 이전
        tx.story.update({
          where: {
            id: storyId,
          },
          data: {
            // price: input.price,
            // unit: input.unit,
          },
        }),
        // 스토리 히스토리 등록
        tx.transaction.create({
          data: {
            status: 'SELLER',
            storyId: storyId,
            blockHash: receipt.blockHash,
            blockNumber: transformBlockNumber,
            transactionHash: receipt.transactionHash,
          },
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: storyId,
        },
      };
    });

    return result;
  }

  /**
   * @description 토큰 소유권 이전
   * @param user {User}
   * @param storyId {number}
   */
  async transferOwnership(user: User, storyId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const story = await tx.story.findFirst({
        where: {
          id: storyId,
        },
        include: {
          owner: {
            select: {
              account: true,
            },
          },
        },
      });

      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      if (story.ownerId === user.id) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NO_PERMISSION_ACTION,
          msg: '자신의 스토리는 소유권을 이전할 수 없습니다.',
        });
      }

      // 로그인한 유저의 privateKey를 가져옴
      const account = await tx.account.findFirst({
        where: {
          address: (user as any).account.address,
        },
      });
      if (!account) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '소유권을 이전할 수 없습니다.',
        });
      }

      const receipt = await this.klaytnService.transferOwnership({
        tokenId: story.tokenId,
        ownerAddress: story.owner.account.address,
        ownerPrivateKey: story.owner.account.privateKey,
        buyerAddress: account.address,
        buyerPrivateKey: account.privateKey,
      });

      if (!receipt) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.NFT_FAIL,
          msg: '스토리 생성에 실패했습니다.',
        });
      }

      // 발생 NFT 토큰 ID
      const transformBlockNumber = `${receipt.blockNumber}`;

      await Promise.all([
        // 스토리 소유권 이전
        tx.story.update({
          where: {
            id: storyId,
          },
          data: {
            ownerId: user.id,
          },
        }),
        // 스토리 히스토리 등록
        tx.transaction.create({
          data: {
            status: 'TRANSFER',
            storyId: story.id,
            blockHash: receipt.blockHash,
            blockNumber: transformBlockNumber,
            transactionHash: receipt.transactionHash,
          },
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: storyId,
        },
      };
    });

    return result;
  }

  /**
   * @description - 상세에서 해당 작품을 생성한 거래내역 정보
   * @param storyUserId
   * @param param
   */
  async histories(id: number) {
    const histories = await this.prisma.transaction.findMany({
      where: {
        storyId: id,
      },
      select: {
        ...historiesSelect,
      },
      take: 30,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: {
        list: histories,
      },
    };
  }
}
