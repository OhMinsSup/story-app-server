import { Injectable, NotFoundException } from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';
import { IpfsService } from '../modules/ipfs/ipfs.service';

import { CreateRequestDto } from './dto/create.request.dto';
import { AuthUserSchema } from 'src/libs/get-user.decorator';

import { EXCEPTION_CODE } from 'src/constants/exception.code';
import { isEmpty, isNull, isUndefined } from '../libs/assertion';

import type { Tag } from '@prisma/client';
import { escapeForUrl } from 'src/libs/utils';

@Injectable()
export class ItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
    private readonly nftClient: IpfsService,
  ) {}

  /**
   * @description 아이템 등록
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const file = await tx.file.findFirst({
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

      let createdTags: Tag[] = [];
      // 태크 체크
      if (!isEmpty(input.tags)) {
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
          tx.itemsTags.create({
            data: {
              itemId: item.id,
              tagId: tag.id,
            },
          }),
        ),
      );

      const metadata = await this.nftClient.add({
        name: item.title,
        description: item.description,
        contentUrl: file.secureUrl,
        tags: createdTags.map((tag) => tag.name),
        price: item.price,
        backgroundColor: item.backgroundColor ?? null,
        externalSite: item.externalSite ?? null,
      });

      const receipt = await this.klaytn.mint(
        user.wallet.address,
        item.id,
        metadata.url,
      );

      const nft = await tx.nFT.create({
        data: {
          tokenId: '',
          cid: metadata.ipnft,
          ipfsUrl: metadata.url,
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
