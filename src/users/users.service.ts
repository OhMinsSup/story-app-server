import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from 'src/jwt/jwt.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';
import { SigninRequestDto } from './dtos/signin.request.dto';
import { SignatureToken } from './dtos/common.dto';
import { userProfileSelect } from 'src/common/select.option';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description - This method is used to get user info
   * @param {number} userId
   */
  async findByUserId(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userProfileSelect,
    });
    return user;
  }

  /**
   * @description - This method is used to user detail info
   * @param userId
   * @returns
   */
  async detail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userProfileSelect,
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: user,
    };
  }

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

  /**
   * @description - This method is used to signin user
   * @param {SigninRequestDto} input
   */
  async signin(input: SigninRequestDto) {
    try {
      const exists = await this.prisma.user.findFirst({
        where: {
          address: input.walletAddress,
        },
        include: {
          profile: true,
        },
      });

      // 해당 지갑 주소가 존재하는 경우
      if (exists) {
        // 현재 유저의 signature 정보를 가져온다.
        const currentSignature = await this.prisma.signature.findFirst({
          where: {
            AND: [
              {
                userId: exists.id,
              },
              {
                isVerified: true,
              },
            ],
          },
        });

        const condition =
          currentSignature && currentSignature.signature !== input.signature;

        // 세션이 존재하고 이미 존재하는 세션하고 새로운 세샨이 다르면 업데이트
        if (condition) {
          await this.prisma.signature.update({
            data: {
              signature: input.signature,
            },
            where: {
              id: currentSignature.id,
            },
          });
        }

        // 액세스 토큰을 생성한다.
        const accessToken = this.jwtService.sign(
          {
            userId: exists.id,
            email: exists.email,
            address: exists.address,
          },
          {
            subject: 'access_token',
            expiresIn: '30d',
          },
        );

        const { id, createdAt, updatedAt, gender, ...info } = exists.profile;

        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: {
            accessToken,
            id: exists.id,
            email: exists.email,
            address: exists.address,
            profile: {
              ...info,
            },
          },
        };
      }

      // 서명 스키마를 먼저 생성하고 이후에 사용자를 생성한다.
      const signature = await this.prisma.signature.create({
        data: {
          signature: input.signature,
        },
      });

      // 서명 토큰을 생성한다.
      const signatureToken = this.jwtService.sign(
        {
          id: signature.id,
          signature: signature.signature,
        },
        {
          expiresIn: '1h',
          subject: 'signature-auth',
        },
      );

      // 존재하지 않는 경우 서명 토큰값을 넘겨준다.
      return {
        ok: false,
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '존재하지 않는 서명 정보입니다.',
        result: signatureToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description - This method is used to signup user
   * @param {SignupRequestDto} input
   */
  async signup(input: SignupRequestDto) {
    try {
      const exists = await this.findEmailAndAddress(
        input.email,
        input.walletAddress,
      );

      if (exists) {
        return {
          ok: false,
          resultCode: EXCEPTION_CODE.INVALID,
          message:
            exists.email === input.email
              ? '이미 사용중인 이메일입니다. 다시 입려해주세요.'
              : '이미 등록된 주소입니다. 다시 입력해주세요.',
          result: exists.email === input.email ? 'email' : 'address',
        };
      }

      // check token
      const decoded = this.jwtService.verify<SignatureToken>(
        input.signatureToken,
      );

      if (decoded.sub !== 'signature-auth') {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.INVALID_TOKEN,
          msg: '유효하지 않은 서명 토큰입니다.',
        });
      }
      const diff = decoded.exp * 1000 - new Date().getTime();
      if (diff > 1000 * 60 * 60) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.TOKEN_EXPIRED,
          msg: '유효기간이 만료되었습니다.',
        });
      }

      // 현재 회원가입을 할려고 하는 signature 정보를 가져온다.
      const currentSignature = await this.prisma.signature.findFirst({
        where: {
          AND: [
            {
              isVerified: false,
            },
            {
              signature: decoded.signature,
            },
            {
              id: decoded.id,
            },
          ],
        },
      });

      // 해당 정보가 존재하지 않으면 에러를 반환한다.
      if (!currentSignature) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.INVALID,
          msg: '유효하지 않은 서명 입니다.',
        });
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const profile_exists = await tx.profile.findFirst({
          where: {
            nickname: input.nickname,
          },
        });
        if (profile_exists) {
          return {
            ok: false,
            resultCode: EXCEPTION_CODE.INVALID,
            message: '이미 사용중인 닉네임 입니다. 다시 입력해 주세요.',
            result: 'nickaname',
          };
        }

        // 유저 생성
        const user = await tx.user.create({
          data: {
            email: input.email,
            address: input.walletAddress,
          },
        });

        // 프로필 생성
        await tx.profile.create({
          data: {
            userId: user.id,
            nickname: input.nickname,
            gender: input.gender,
            profileUrl: input.defaultProfile ? null : input.profileUrl,
            avatarSvg: input.defaultProfile ? input.avatarSvg : null,
            defaultProfile: input.defaultProfile,
          },
        });

        // 회원가입 signature 정보를 업데이트 한다.
        await tx.signature.update({
          where: {
            id: currentSignature.id,
          },
          data: {
            userId: user.id,
            isVerified: true,
          },
        });

        return {
          ok: true,
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          result: true,
        };
      });

      return result;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException({
          resultCode: EXCEPTION_CODE.INVALID_TOKEN,
          msg: '유효하지 않은 토큰입니다.',
        });
      }
      throw error;
    }
  }
}
