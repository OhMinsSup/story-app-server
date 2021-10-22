import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// types
import { EXCEPTION_CODE } from 'src/exception/exception.code';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description - list a tags
   */
  async list(
    pageNo: number | undefined = 1,
    pageSize: number | undefined = 25,
  ) {
    try {
      const [total, list] = await Promise.all([
        this.prisma.tag.count(),
        this.prisma.tag.findMany({
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          list: list,
          total,
          pageNo,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
