import { Injectable, NotFoundException } from '@nestjs/common';
import { KlaytnService } from '../modules/klaytn/klaytn.service';
import { PrismaService } from '../database/prisma.service';

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
  ) {}

  /**
   * @description 아이템 등록
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    const file = await this.prisma.file.findFirst({
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
          const tagData = await this.prisma.tag.findFirst({
            where: {
              name,
            },
          });
          if (!tagData) {
            return this.prisma.tag.create({
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

    const item = await this.prisma.item.create({
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
        this.prisma.itemsTags.create({
          data: {
            itemId: item.id,
            tagId: tag.id,
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
  }
}
