import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { KlaytnService } from 'src/klaytn/klaytn.service';
import { NotificationsService } from 'src/notifications/notifications.service';

// types
import type { Story, StoryTags, Tag, User } from '.prisma/client';
import type { SearchParams } from './dtos/story.interface';

// dtos
import { StoryCreateRequestDto } from './dtos/create.request.dto';
import { storiesSelect } from 'src/common/select.option';

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly klaytnService: KlaytnService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * @description - serialize a story
   * @param {unknown} data
   */
  serialize = (data: unknown) => {
    type SerializedTags = (StoryTags & {
      tag: Tag;
    })[];

    const result = _.pick(data, ['storyTags']) as {
      storyTags: SerializedTags;
    };
    const tags = result.storyTags?.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
    }));
    return {
      ..._.omit(data as Story, ['storyTags']),
      tags,
    };
  };

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
  }

  /**
   * @description - detail a story
   * @param id
   */
  async detail(id: number) {
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
  }

  /**
   * @description - update a story
   * @param user
   * @param id
   * @param input
   */
  async update(user: User, id: number, input: StoryCreateRequestDto) {
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
  }

  /**
   * @description - create a new story
   * @param user
   * @param input
   */
  async create(user: User, input: StoryCreateRequestDto) {
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
      // 태크 체크
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

      // 스토리 생성
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

      // 태그 생성
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

      const account = await tx.account.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!account) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          msg: '존재하지 않는 유저입니다.',
        });
      }
      const { privateKey, address } = account;

      // nft 발생
      const receipt = await this.klaytnService.minting({
        privateKey,
        address,
        id: story.id,
      });

      if (!receipt) {
        throw new InternalServerErrorException({
          resultCode: EXCEPTION_CODE.NFT_FAIL,
          msg: '스토리 생성에 실패했습니다.',
        });
      }

      // 발생 NFT 토큰 ID
      const tokenId = receipt.tokenId;
      const transformTokenId = parseInt(tokenId, 10);
      const transformBlockNumber = `${receipt.blockNumber}`;

      // story 업데이트 nftId
      await tx.story.update({
        where: {
          id: story.id,
        },
        data: {
          tokenId: transformTokenId,
        },
      });

      await tx.transaction.create({
        data: {
          status: 'ISSUE',
          storyId: story.id,
          blockHash: receipt.blockHash,
          blockNumber: transformBlockNumber,
          transactionHash: receipt.transactionHash,
        },
      });

      await tx.offer.create({
        data: {
          storyId: story.id,
          sellerId: user.id,
          buyerId: user.id,
          price: input.price,
          unit: input.unit,
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
  }

  /**
   * @description 좋아요
   * @param user {User}
   * @param storyId {number}
   */
  async like(user: User, storyId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 수정하는 스토리 정보가 존재하는지 체크
      const story = await tx.story.findFirst({
        where: {
          id: storyId,
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
  }

  /**
   * @description 싫어요
   * @param user {User}
   * @param storyId {number}
   */
  async unlike(user: User, storyId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 수정하는 스토리 정보가 존재하는지 체크
      const story = await tx.story.findFirst({
        where: {
          id: storyId,
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
  }

  /**
   * @description 스토리 좋아요 리스트 조회 API
   * @param userId {number}
   */
  async storyLikes(userId: number, pageNo = 1, pageSize = 25) {
    if (_.isString(pageNo)) {
      pageNo = Number(pageNo);
    }

    if (_.isString(pageSize)) {
      pageSize = Number(pageSize);
    }

    const [total, list] = await Promise.all([
      this.prisma.like.count({
        where: {
          userId,
        },
      }),
      this.prisma.like.findMany({
        skip: (pageNo - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          userId,
        },
        include: {
          story: {
            include: {
              media: true,
              storyTags: {
                include: {
                  tag: true,
                },
              },
              user: {
                include: {
                  profile: true,
                },
              },
              likes: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
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
  }
}
