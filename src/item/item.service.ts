import { Injectable, NotFoundException } from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';
import { IpfsService } from '../modules/ipfs/ipfs.service';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../modules/queue/queue.service';

import { CreateRequestDto } from './dto/create.request.dto';
import { AuthUserSchema } from '../libs/get-user.decorator';
import { ListRequestDto } from './dto/list.request.dto';

import { EXCEPTION_CODE } from '../constants/exception.code';
import { isEmpty, isNull, isUndefined } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';

import type { Tag } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
    private readonly nftClient: IpfsService,
    private readonly config: ConfigService,
    private readonly queue: QueueService,
  ) {}

  /**
   * @description 아이템 리스트
   * @param {ListRequestDto} listRequestDto
   */
  private async _getRecentItems({ cursor, limit }: ListRequestDto) {
    const [totalCount, list] = await Promise.all([
      this.prisma.item.count(),
      this.prisma.item.findMany({
        orderBy: {
          id: 'desc',
        },
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        select: {
          id: true,
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
          nft: {
            select: {
              tokenId: true,
              cid: true,
            },
          },
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.item.count({
          where: {
            id: {
              lt: endCursor,
            },
          },
          orderBy: {
            id: 'desc',
          },
        })) > 0
      : false;

    return { totalCount, list, endCursor, hasNextPage };
  }

  /**
   * @description 아이템 목록
   * @param {ListRequestDto} query
   */
  async list(query: ListRequestDto) {
    const result = await this._getRecentItems(query);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 아이템 상세
   * @param {number} id
   */
  async detail(id: number) {
    const item = await this.prisma.item.findFirst({
      where: { AND: [{ id }, { isPublic: true }] },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profileUrl: true,
          },
        },
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
        nft: {
          select: {
            tokenId: true,
            cid: true,
            transactionReceipt: {
              select: {
                transactionHash: true,
              },
            },
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

    const contract = this.klaytn.getContract();

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        ...item,
        contractHash: contract._address,
      },
    };
  }

  /**
   * @description 아이템 등록
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    const file = await this.prisma.file.findUnique({
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

    const tx = await this.prisma.$transaction(async (tx) => {
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
          thumbnailUrl: input.thumbnailUrl,
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

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: item.id,
        },
      };
    });

    if (tx.result.dataId) {
      setTimeout(() => {
        this.queue.minting(tx.result.dataId, {
          user,
          name: input.title,
          description: input.description,
          thumbnailUrl: input.thumbnailUrl,
          contentUrl: file.secureUrl,
          tags: input.tags,
          price: input.price,
          backgroundColor: input.backgroundColor,
          externalSite: input.externalSite,
        });
      }, 0);
    }

    return tx;
  }
}
