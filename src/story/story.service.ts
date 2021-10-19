import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';

// types
import type { User } from '.prisma/client';

// dtos
import { StoryCreateRequestDto } from './dtos/create.request.dto';
import { storiesSelect } from 'src/common/select.option';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description - detail a story
   * @param id
   */
  async detail(id: number) {
    try {
      const story = await this.prisma.story.findFirst({
        where: {
          id,
        },
        select: storiesSelect,
      });
      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: story,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description - list a story
   */
  async list(
    pageNo: number | undefined = 1,
    pageSize: number | undefined = 25,
  ) {
    try {
      const [total, list] = await Promise.all([
        this.prisma.story.count(),
        this.prisma.story.findMany({
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },
          select: storiesSelect,
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          list,
          total,
          pageNo,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description - update a story
   * @param user
   * @param id
   * @param input
   */
  async update(user: User, id: number, input: StoryCreateRequestDto) {
    try {
      // 수정하는 스토리 정보가 존재하는지 체크
      const story = await this.prisma.story.findFirst({
        where: {
          AND: [
            {
              id,
            },
            {
              userId: user.id,
            },
          ],
        },
      });
      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      // 수정하려는 스토리 정보가 이미 존재하는지 체크
      if (story.mediaId !== input.mediaId) {
        const media = await this.prisma.media.findFirst({
          where: {
            id: input.mediaId,
          },
        });
        if (!media) {
          throw new NotFoundException({
            resultCode: EXCEPTION_CODE.NOT_EXIST,
            msg: '존재하지 않는 파일입니다.',
          });
        }
      }

      const updatedData = _.pickBy(
        _.merge(
          _.omit(story, ['createdAt', 'updatedAt', 'userId']),
          _.omit(input, ['storyId']),
        ),
        _.identity,
      );

      await this.prisma.story.update({
        where: {
          id: story.id,
        },
        data: updatedData,
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: story.id,
        },
      };
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  /**
   * @description - create a new story
   * @param user
   * @param input
   */
  async create(user: User, input: StoryCreateRequestDto) {
    try {
      const media = await this.prisma.media.findFirst({
        where: {
          id: input.mediaId,
        },
      });
      if (!media) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 파일입니다.',
        });
      }
      const nameDuplicate = await this.prisma.story.findFirst({
        where: {
          name: input.name,
        },
      });
      if (!_.isEmpty(nameDuplicate)) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.DUPLICATE,
          msg: '이미 존재하는 스토리 입니다.',
        });
      }

      const story = await this.prisma.story.create({
        data: {
          userId: user.id,
          mediaId: media.id,
          name: input.name,
          description: input.description,
          ...(input.backgroundColor
            ? {
                backgroundColor: input.backgroundColor,
              }
            : {
                backgroundColor: '#ffffff',
              }),
          ...(input.externalUrl && {
            externalUrl: input.externalUrl,
          }),
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          dataId: story.id,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
