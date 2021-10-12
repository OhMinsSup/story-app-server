import { Injectable } from '@nestjs/common';
import omit from 'lodash/omit';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from 'src/jwt/jwt.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description - This method is used to exists user info
   * @param {string} email
   * @param {string} address
   */
  async findEmailAndAddress(email: string, address: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            email,
          },
          {
            address,
          },
        ],
      },
    });
    return exists;
  }

  async create(input: SignupRequestDto) {
    try {
      const exists = await this.findEmailAndAddress(
        input.email,
        input.walletAddress,
      );

      if (exists) {
        return {
          ok: true,
          resultCode: EXCEPTION_CODE.INVALID,
          message:
            exists.email === input.email
              ? '이미 사용중인 이메일입니다. 다시 입려해주세요.'
              : '이미 등록된 주소입니다. 다시 입력해주세요.',
          result: exists.email === input.email ? 'email' : 'address',
        };
      }
      // 유저 생성
      const [user] = await this.prisma.$transaction([
        this.prisma.user.create({
          data: {
            email: input.email,
            address: input.walletAddress,
          },
        }),
      ]);

      // 프로필 생성
      const [profile] = await this.prisma.$transaction([
        this.prisma.profile.create({
          data: {
            userId: user.id,
            nickname: input.nickname,
            gender: input.gender,
            profileUrl: input.defaultProfile ? null : input.profileUrl,
            avatarSvg: input.defaultProfile ? input.avatarSvg : null,
            defaultProfile: input.defaultProfile,
          },
        }),
      ]);

      // 현재 회원가입을 할려고 하는 signature 정보를 가져온다.
      const currentSignature = await this.prisma.signature.findFirst({
        where: {
          AND: [
            {
              isVerified: false,
            },
            {
              signature: input.signature,
            },
          ],
        },
      });

      // 해당 정보가 존재하지 않으면 에러를 반환한다.
      if (!currentSignature) {
        return {
          ok: false,
          resultCode: EXCEPTION_CODE.INVALID,
          message: '유효하지 않은 signature 입니다.',
          result: null,
        };
      }

      // 회원가입 signature 정보를 업데이트 한다.
      await this.prisma.signature.update({
        where: {
          id: currentSignature.id,
        },
        data: {
          isVerified: true,
        },
      });

      // 액세스 토큰 생성
      const accessToken = this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
          address: user.address,
        },
        {
          subject: 'access_token',
          expiresIn: '30d',
        },
      );

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          accessToken,
          email: user.email,
          profile: omit(profile, [
            'userId',
            'createdAt',
            'updatedAt',
            'gender',
          ]),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
