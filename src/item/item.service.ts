import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';
import { IpfsService } from '../modules/ipfs/ipfs.service';
import { ConfigService } from '@nestjs/config';

import { CreateRequestDto } from './dto/create.request.dto';
import { AuthUserSchema } from 'src/libs/get-user.decorator';

import { EXCEPTION_CODE } from 'src/constants/exception.code';
import { isEmpty, isNull, isNumber, isUndefined } from '../libs/assertion';
import { escapeForUrl } from 'src/libs/utils';

import type { Tag } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
    private readonly nftClient: IpfsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 아이템 상세
   * @param {number} id
   */
  async detail(id: number) {
    const item = await this.prisma.item.findFirst({
      where: { AND: [{ id }, { isPublic: true }] },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profileUrl: true,
            wallet: {
              select: {
                address: true,
              },
            },
          },
        },
        title: true,
        description: true,
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
        thumbnail: {
          select: {
            secureUrl: true,
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
        nft: {
          select: {
            tokenId: true,
            cid: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException({
        status: EXCEPTION_CODE.NOT_EXIST,
        msg: ['존재하지 않는 아이템입니다.'],
        error: 'NOT_EXIST',
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: item,
    };
  }

  /**
   * @description 아이템 등록
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.findFirst({
        where: {
          address: user.wallet.address,
        },
        select: {
          privateKey: true,
        },
      });

      const file = await tx.file.findUnique({
        where: {
          id: input.fileId,
        },
      });
      if (!file) {
        throw new NotFoundException({
          status: EXCEPTION_CODE.NOT_EXIST,
          msg: ['존재하지 않는 파일입니다.'],
          error: 'Not Found File',
        });
      }

      const thumbnail = await tx.thumbnail.findUnique({
        where: {
          id: input.thumbnailId,
        },
      });
      if (!thumbnail) {
        throw new NotFoundException({
          status: EXCEPTION_CODE.NOT_EXIST,
          msg: ['존재하지 않는 썸네일입니다.'],
          error: 'Not Found Thumbnail',
        });
      }

      let createdTags: Tag[] = [];
      // 태크 체크
      if (!isEmpty(input.tags) && input.tags) {
        const tags = await Promise.all(
          input.tags.map(async (tag) => {
            const name = escapeForUrl(tag);
            const tagData = await tx.tag.findFirst({
              where: {
                name,
              },
            });
            if (!tagData) {
              return tx.tag.create({
                data: {
                  name,
                },
              });
            }
            return tagData;
          }),
        );
        createdTags = tags;
      }

      const item = await tx.item.create({
        data: {
          userId: user.id,
          fileId: file.id,
          thumbnailId: thumbnail.id,
          nftId: null,
          title: input.title,
          description: input.description,
          price: input.price,
          beginDate: new Date(input.beginDate),
          endDate: new Date(input.endDate),
          isPublic:
            isUndefined(input.isPublic) || isNull(input.isPublic)
              ? false
              : input.isPublic,
          backgroundColor: input.backgroundColor ?? null,
          externalSite: input.externalSite ?? null,
        },
      });

      await Promise.all(
        createdTags.map((tag) =>
          tx.itemsOnTags.create({
            data: {
              item: {
                connect: {
                  id: item.id,
                },
              },
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            },
          }),
        ),
      );

      if (this.config.get('NODE_ENV') === 'production') {
        const metadata = await this.nftClient.add({
          name: item.title,
          description: item.description,
          thumbnailUrl: thumbnail.secureUrl,
          contentUrl: file.secureUrl,
          tags: input.tags ?? [],
          price: item.price,
          backgroundColor: item.backgroundColor ?? null,
          externalSite: item.externalSite ?? null,
        });

        const { receipt, tokenId } = await this.klaytn.mint(
          user.wallet.address,
          wallet.privateKey,
          item.id,
          metadata.url,
        );

        if (!tokenId) {
          throw new BadRequestException({
            status: EXCEPTION_CODE.NFT_FAIL,
            msg: ['토큰 아이디 생성이 실패하였습니다.'],
            error: 'NFT Create Fail',
          });
        }

        const nft = await tx.nFT.create({
          data: {
            tokenId: isNumber(tokenId) ? tokenId.toString() : tokenId,
            cid: metadata.ipnft,
            ipfsUrl: metadata.url,
          },
        });

        await tx.transactionReceipt.create({
          data: {
            transactionHash: receipt.transactionHash,
            nftId: nft.id,
          },
        });

        await tx.item.update({
          where: {
            id: item.id,
          },
          data: {
            nftId: nft.id,
          },
        });
      }

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: item.id,
        },
      };
    });
  }
}
