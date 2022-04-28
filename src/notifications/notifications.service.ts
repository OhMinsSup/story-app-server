// import { Injectable } from '@nestjs/common';
// import DeviceDetector from 'device-detector-js';
// import * as bcrypt from 'bcrypt';

// // service
// import { PrismaService } from 'src/prisma/prisma.service';
// import { PushService } from 'src/push/push.service';

// // dto
// import { EXCEPTION_CODE } from 'src/exception/exception.code';
// import { TokenPushRequestDto } from './dto/tokenPush.request.dto';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly pushService: PushService,
//   ) {}

//   /**
//    * @description 푸시 토큰을 저장한다
//    * @param {TokenPushRequestDto} input
//    * @param {string} userAgent
//    */
//   async device(input: TokenPushRequestDto, userAgent: string) {
//     const exists = await this.prisma.device.findFirst({
//       where: {
//         token: input.pushToken,
//       },
//     });

//     if (exists) {
//       const now = new Date();
//       const createdAt = new Date(exists.createdAt);
//       const expiredPushToken =
//         now.getTime() - createdAt.getTime() > 15 * 24 * 60 * 60 * 1000;
//       // 토큰의 row값은 존재하지만 token이 빈값이면 토큰 만료
//       if (expiredPushToken) {
//         // 토큰이 만료된 경우 해당 디바이스의 토큰을 제거한다.
//         await this.prisma.device.update({
//           where: {
//             id: exists.id,
//           },
//           data: {
//             token: '',
//           },
//         });

//         return {
//           ok: true,
//           resultCode: EXCEPTION_CODE.PUSH_TOKEN_EXPIRED,
//           message: '푸시 토큰이 만료되었습니다.',
//           result: exists,
//         };
//       }

//       return {
//         ok: true,
//         resultCode: EXCEPTION_CODE.OK,
//         message: null,
//         result: exists,
//       };
//     }

//     const deviceDetector = new DeviceDetector();
//     // userAgent 가지고 OS 정보를 생성
//     const deviceInfo = deviceDetector.parse(userAgent);

//     const device = await this.prisma.device.create({
//       data: {
//         os: deviceInfo.os.name,
//         token: input.pushToken,
//       },
//     });

//     return {
//       ok: true,
//       resultCode: EXCEPTION_CODE.OK,
//       message: null,
//       result: device,
//     };
//   }
// }
