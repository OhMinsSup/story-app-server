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
import { historiesSelect, storiesSelect } from 'src/common/select.option';
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
    const tags = result.storyTags?.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
    }));
    return {
      ..._.omit(story as Story, ['storyTags']),
      tags,
    };
  }

  /**
   * @description - 상세에서 해당 작품을 생성한 거래내역 정보
   * @param storyUserId
   * @param param
   */
  async histories(id: number) {
    const histories = await this.prisma.history.findMany({
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

  /**
   * @description - 상세에서 해당 작품을 생성한 크리에이터의 또 다른 story를 가져온다ㄴs
   */
  async anotherStories(id: number, userId: number) {
    const where = {};

    const AND: Record<string, boolean | number | string>[] = [
      { private: false },
      { isDelete: false },
      { userId },
    ];

    Object.assign(where, {
      AND,
    });

    const list = await this.prisma.story.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: storiesSelect,
      where: {
        userId: {
          equals: userId,
        },
        id: {
          not: id,
        },
      },
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: {
        list: list.map(this.serialize),
      },
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
  async list({
    pageNo = 1,
    pageSize = 25,
    isPrivate = false,
    userId = null,
  }: Partial<SearchParams>) {
    const where = {};

    if (_.isString(pageNo)) {
      pageNo = Number(pageNo);
    }

    if (_.isString(pageSize)) {
      pageSize = Number(pageSize);
    }

    if (isPrivate && _.isString(isPrivate)) {
      isPrivate = isPrivate === 'true' ? true : false;
    }

    const AND: Record<string, boolean | number | string>[] = [
      { private: isPrivate },
      { isDelete: false },
    ];

    if (userId) {
      AND.push({ userId: Number(userId) });
    }

    if (!_.isEmpty(AND)) {
      Object.assign(where, {
        AND,
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
          where,
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
                  storyId: story.id,
                  tagId: tag.id,
                },
              }),
            ),
          ]);
        }

        const updatedData = _.pickBy(
          _.merge(
            _.omit(story, ['createdAt', 'updatedAt', 'userId', 'storyTags']),
            _.omit(input, ['storyId', 'tags', 'dataId']),
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
            ownerId: user.id,
            mediaId: media.id,
            name: input.name,
            description: input.description,
            private: !!input.isPrivate,
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

        await Promise.all(
          createdTags.map((tag) =>
            tx.storyTags.create({
              data: {
                storyId: story.id,
                tagId: tag.id,
              },
            }),
          ),
        );

        await tx.history.create({
          data: {
            status: 'ISSUE',
            storyId: story.id,
            toId: user.id,
            fromId: user.id,
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

  /**
   * @description 좋아요
   * @param user {User}
   * @param storyId {number}
   */
  async likes(user: User, storyId: number) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 수정하는 스토리 정보가 존재하는지 체크
        const story = await tx.story.findFirst({
          where: {
            AND: [
              {
                id: storyId,
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
        if (story.userId === user.id) {
          return {
            ok: false,
            resultCode: EXCEPTION_CODE.NO_PERMISSION_ACTION,
            message: '자신의 스토리는 좋아요를 할 수 없습니다.',
            result: null,
          };
        }

        // 좋아요 정보가 이미 존재하는지 체크
        const like = await tx.like.findFirst({
          where: {
            AND: [
              {
                storyId,
              },
              {
                userId: user.id,
              },
            ],
          },
        });

        if (!_.isEmpty(like)) {
          throw new BadRequestException({
            resultCode: EXCEPTION_CODE.DUPLICATE,
            msg: '이미 좋아요를 누른 스토리입니다.',
          });
        }

        // 좋아요 정보 생성
        await tx.like.create({
          data: {
            userId: user.id,
            storyId: story.id,
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description 싫어요
   * @param user {User}
   * @param storyId {number}
   */
  async unlikes(user: User, storyId: number) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 수정하는 스토리 정보가 존재하는지 체크
        const story = await tx.story.findFirst({
          where: {
            AND: [
              {
                id: storyId,
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
        if (story.userId === user.id) {
          return {
            ok: false,
            resultCode: EXCEPTION_CODE.NO_PERMISSION_ACTION,
            message: '자신의 스토리는 좋아요를 취소할 수 없습니다.',
            result: null,
          };
        }

        // 좋아요 정보가 이미 존재하는지 체크
        const like = await tx.like.findFirst({
          where: {
            AND: [
              {
                storyId,
              },
              {
                userId: user.id,
              },
            ],
          },
        });

        if (_.isEmpty(like)) {
          throw new BadRequestException({
            resultCode: EXCEPTION_CODE.NOT_EXIST,
            msg: '좋아요를 누른 스토리가 없습니다.',
          });
        }

        // 좋아요 정보 삭제
        await tx.like.delete({
          where: {
            id: like.id,
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
    } catch (error) {
      throw error;
    }
  }
}
