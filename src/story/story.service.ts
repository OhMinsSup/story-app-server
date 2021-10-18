import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import isEmpty from 'lodash/isEmpty';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';

// types
import type { User } from '.prisma/client';

// dtos
import { CreateRequestDto } from './dtos/create.request.dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description - create a new story
   * @param user
   * @param input
   */
  async create(user: User, input: CreateRequestDto) {
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
      if (!isEmpty(nameDuplicate)) {
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
