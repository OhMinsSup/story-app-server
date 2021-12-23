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
    backgrounds = undefined,
    tags = undefined,
    orderBy = 'desc',
    orderType = 'createdAt',
  }: StorySearchParams) {
    const where = {};

    if (_.isString(pageNo)) {
      pageNo = Number(pageNo);
    }

    if (_.isString(pageSize)) {
      pageSize = Number(pageSize);
    }

    const OR: Record<string, any>[] = [];

    if (!_.isEmpty(backgrounds)) {
      let transform = [];
      if (typeof backgrounds === 'string') {
        // checked by regex comma or space delimiter
        transform = backgrounds.split(/[,\s]+/);
      } else if (Array.isArray(backgrounds)) {
        // tags array
        transform = backgrounds;
      }

      OR.push({
        backgroundColor: {
          in: transform,
        },
      });
    }

    if (!_.isEmpty(tags)) {
      let transform = [];
      if (typeof tags === 'string') {
        // checked by regex comma or space delimiter
        transform = tags.split(/[,\s]+/);
      } else if (Array.isArray(tags)) {
        // tags array
        transform = tags;
      }

      OR.push({
        storyTags: {
          some: {
            tag: {
              name: {
                in: transform,
              },
            },
          },
        },
      });
    }

    const order = {};

    if (orderType === 'likes') {
      Object.assign(order, {
        likes: {
          _count: orderBy,
        },
      });
    } else {
      Object.assign(order, {
        [orderType]: orderBy,
      });
    }

    const AND: Record<string, boolean | number | string>[] = [
      { private: false },
      { isDelete: false },
    ];

    Object.assign(where, {
      AND,
    });

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
          orderBy: order,
          select: storiesSelect,
          where,
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
