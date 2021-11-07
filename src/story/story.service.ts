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
import type { Story, StoryTags, Tag, User } from '.prisma/client';

// dtos
import { StoryCreateRequestDto } from './dtos/create.request.dto';
import { storiesSelect } from 'src/common/select.option';
import { SearchParams } from './dtos/story.interface';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description - serialize a story
   * @param story
   */
  serialize(story: unknown) {
    type SerializedTags = (StoryTags & {
      tag: Tag;
    })[];

    const result = _.pick(story, ['storyTags']) as {
      storyTags: SerializedTags;
    };
    const tags = result.storyTags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
    }));
    return {
      ..._.omit(story as Story, ['storyTags']),
      tags,
    };
  }

  /**
   * @description - delete a story
   * @param user
   * @param id
   */
  async delete(user: User, id: number) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const story = await tx.story.findFirst({
          where: { id, userId: user.id },
        });
        if (!story) {
          throw new NotFoundException({
            resultCode: EXCEPTION_CODE.NOT_EXIST,
            msg: '존재하지 않는 스토리입니다.',
          });
        }

        if (story.userId !== user.id) {
          throw new BadRequestException({
            resultCode: EXCEPTION_CODE.NO_PERMISSION,
            msg: '삭제 권한이 없습니다.',
          });
        }

        // delete story tags
        await tx.storyTags.deleteMany({
          where: {
            storyId: id,
          },
        });

        // delete story
        await tx.story.update({
          where: { id },
          data: {
            isDelete: true,
          },
        });

        // // delete story media
        // await tx.media.delete({
        //   where: {
        //     id: story.mediaId,
        //   },
        // });

        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: {
            dataId: id,
          },
        };
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

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
        select: {
          ...storiesSelect,
          isDelete: true,
        },
      });
      if (!story) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 스토리입니다.',
        });
      }

      if (story.isDelete) {
        return {
          ok: false,
          resultCode: EXCEPTION_CODE.DELETED,
          message: '삭제된 스토리입니다.',
          result: null,
        };
      }

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: this.serialize(story),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description - list a story
   */
  async list(
    user: User,
    { pageNo = 1, pageSize = 25, isPrivate = false }: Partial<SearchParams>,
  ) {
    const query = {
      ...(isPrivate
        ? {
            AND: [
              {
                private: true,
              },
              {
                userId: user.id,
              },
              {
                isDelete: false,
              },
            ],
          }
        : {
            AND: [
              {
                private: false,
              },
              {
                isDelete: false,
              },
            ],
          }),
    };

    try {
      const [total, list] = await Promise.all([
        this.prisma.story.count({
          where: query,
        }),
        this.prisma.story.findMany({
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },
          select: storiesSelect,
          where: query,
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          list: list.map(this.serialize),
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
      const result = await this.prisma.$transaction(async (tx) => {
        // 수정하는 스토리 정보가 존재하는지 체크
        const story = await tx.story.findFirst({
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
          include: {
            storyTags: true,
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
          const media = await tx.media.findFirst({
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

        let updatedTags: Tag[] = [];
        if (!_.isEmpty(input.tags)) {
          const tags = await Promise.all(
            input.tags.map(async (tag) => {
              const tagResult = await tx.tag.findFirst({
                where: {
                  name: tag.trim(),
                },
              });
              if (!tagResult) {
                const newTag = await tx.tag.create({
                  data: {
                    name: tag.trim(),
                  },
                });
                return newTag;
              }
              return tagResult;
            }),
          );
          updatedTags = tags.filter((tag) => tag);
        }

        if (!_.isEmpty(updatedTags)) {
          // deep compare tags and storyTags to find deleted tags and create
          //  new tags if not exist in storyTags array of story model
          //  (storyTags is array of tag model)
          const deletedTags = _.differenceWith(
            story.storyTags,
            updatedTags,
            (tag1, tag2) => tag1.id === tag2.id,
          );
          const newTags = _.differenceWith(
            updatedTags,
            story.storyTags,
            (tag1, tag2) => tag1.id === tag2.id,
          );
          await Promise.all([
            ...deletedTags.map((tag) =>
              tx.storyTags.delete({
                where: {
                  id: tag.id,
                },
              }),
            ),
            ...newTags.map((tag) =>
              tx.storyTags.create({
                data: {
                  story: {
                    connect: {
                      id: story.id,
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
          ]);
        }

        const updatedData = _.pickBy(
          _.merge(
            _.omit(story, ['createdAt', 'updatedAt', 'userId', 'storyTags']),
            _.omit(input, ['storyId', 'tags']),
          ),
          _.identity,
        );

        await tx.story.update({
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
      });
      return result;
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
      const result = await this.prisma.$transaction(async (tx) => {
        const media = await tx.media.findFirst({
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
        const nameDuplicate = await tx.story.findFirst({
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

        let createdTags: Tag[] = [];
        if (!_.isEmpty(input.tags)) {
          const tags = await Promise.all(
            input.tags.map(async (tag) => {
              const tagData = await tx.tag.findFirst({
                where: {
                  name: tag.trim(),
                },
              });
              if (!tagData) {
                return tx.tag.create({
                  data: {
                    name: tag.trim(),
                  },
                });
              }
              return tagData;
            }),
          );
          createdTags = tags;
        }

        const story = await tx.story.create({
          data: {
            userId: user.id,
            mediaId: media.id,
            name: input.name,
            description: input.description,
            private: !!input.isPrivate,
            ...(!_.isEmpty(createdTags) && {
              storyTags: {
                connectOrCreate: createdTags.map((tag) => ({
                  where: {
                    id: tag.id,
                  },
                  create: {
                    tag: {
                      connect: {
                        id: tag.id,
                      },
                    },
                  },
                })),
              },
            }),
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
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
