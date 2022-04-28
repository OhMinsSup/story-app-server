// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// // types
// import { EXCEPTION_CODE } from 'src/exception/exception.code';

// @Injectable()
// export class TagsService {
//   private readonly logger = new Logger(TagsService.name);

//   constructor(private readonly prisma: PrismaService) {}

//   /**
//    * @description - list a tags
//    * @param {number} pageNo - page number
//    * @param {number} pageSize - page size
//    */
//   async list(
//     pageNo: number | undefined = 1,
//     pageSize: number | undefined = 25,
//   ) {
//     this.logger.debug({
//       message: 'tagList',
//       payload: { pageNo, pageSize },
//     });

//     // 현재 등록된 태그를 총 개수 및 태그 목록으로 반환한다.
//     const [total, list] = await Promise.all([
//       this.prisma.tag.count(),
//       this.prisma.tag.findMany({
//         skip: (pageNo - 1) * pageSize,
//         take: pageSize,
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),
//     ]);

//     return {
//       ok: true,
//       resultCode: EXCEPTION_CODE.OK,
//       message: null,
//       result: {
//         list: list,
//         total,
//         pageNo,
//       },
//     };
//   }
// }
