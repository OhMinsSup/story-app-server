import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { storiesSelect } from 'src/common/select.option';

import { EXCEPTION_CODE } from 'src/exception/exception.code';

import { PrismaService } from 'src/prisma/prisma.service';
import { StoriesService } from 'src/story/story.service';

import type { StorySearchParams } from 'src/story/dtos/story.interface';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storiesService: StoriesService,
  ) {}

  async search({
    pageNo = 1,
    pageSize = 25,
    background = undefined,
    tags = undefined,
  }: StorySearchParams) {
    const where = {};

    if (_.isString(pageNo)) {
      pageNo = Number(pageNo);
    }

    if (_.isString(pageSize)) {
      pageSize = Number(pageSize);
    }

    const OR: Record<string, any>[] = [];

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!_.isEmpty(background) && background.match(hexRegex)) {
      OR.push({
        backgroundColor: {
          contains: background,
        },
      });
    }

    if (!_.isEmpty(tags)) {
      OR.push({
        storyTags: {
          some: {
            tag: {
              name: {
                in: tags,
              },
            },
          },
        },
      });
    }

    const AND: Record<string, boolean | number | string>[] = [
      { private: false },
      { isDelete: false },
    ];

    if (!_.isEmpty(AND)) {
      Object.assign(where, {
        AND,
      });
    }

    if (!_.isEmpty(OR)) {
      Object.assign(where, {
        OR,
      });
    }

    try {
      const [total, list] = await Promise.all([
        this.prisma.story.count({
          where,
        }),
        this.prisma.story.findMany({
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },
          select: storiesSelect,
          where: {
            ...where,
            OR,
          },
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          list: list.map(this.storiesService.serialize),
          total,
          pageNo,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
