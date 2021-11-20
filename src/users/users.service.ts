import { BadRequestException, Injectable } from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { KlaytnService } from 'src/klaytn/klaytn.service';
import { JwtService } from 'src/jwt/jwt.service';

// types
import { SignupRequestDto } from './dtos/signup.request.dto';
import { SigninRequestDto } from './dtos/signin.request.dto';

// select
import { userAccountSelect, userProfileSelect } from 'src/common/select.option';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly klaytnService: KlaytnService,
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
   * @description - This method is used to exists user info
   * @param {string} email
   */
  async findByEmail(email: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return exists;
  }

  /**
   * @description - 서명 정보를 가져오는 함수
   * @param signature
   */
  async findBySignature(signature: string) {
    return this.prisma.signature.findFirst({
      where: {
        signature,
      },
    });
  }

  /**
   * @description 지갑 정보를 가져오는 함수
   * @param address
   */
  async findByWalletAddress(address: string) {
    return this.prisma.user.findFirst({
      where: {
        account: {
          address,
        },
      },
      select: userAccountSelect,
    });
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
      select: userAccountSelect,
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: user,
    };
  }

  /**
   * @description - This method is used to signin user
   * @param {SigninRequestDto} input
   */
  async signin(input: SigninRequestDto) {
    try {
      const exists = await this.prisma.user.findFirst({
        where: {
          email: input.email,
        },
        include: {
          profile: true,
          account: {
            select: {
              address: true,
              privateKey: true,
            },
          },
        },
      });

      if (!exists) {
        return {
          ok: false,
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: '존재하지 않는 사용자 입니다.',
          result: null,
        };
      }

      // 비밀번호 체크
      const result = await bcrypt.compare(input.password, exists.password);
      if (!result) {
        return {
          ok: false,
          resultCode: EXCEPTION_CODE.INCORRECT_PASSWORD,
          message: '비밀번호가 일치하지 않습니다.',
          result: null,
        };
      }

      // create Sign message Data
      const message = `userId:${
        exists.id
      }\n timestamp:${Date.now()} LoginRequest`;

      // 서명 데이터 생성
      const sign = await this.klaytnService.sign(
        message,
        exists.account.privateKey,
      );

      // 서명 데이터 저장
      await this.prisma.signature.create({
        data: {
          signature: sign.signature,
          messageHash: sign.messageHash,
        },
      });

      // 액세스 토큰을 생성한다.
      const accessToken = this.jwtService.sign(
        {
          signature: sign.signature,
        },
        {
          subject: 'access_token',
          expiresIn: '30d',
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, gender, ...info } = exists.profile;

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          accessToken,
          id: exists.id,
          email: exists.email,
          profile: {
            ...info,
          },
        },
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
      const exists = await this.findByEmail(input.email);

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

        const hased = await bcrypt.hash(input.password, 12);

        // 지갑을 생성한다.
        const wallet = await this.klaytnService.createWallet();
        // 공개키를 생성한다.
        const publicKey = await this.klaytnService.privateKeyToPublicKey(
          wallet.privateKey,
        );

        // 유저 생성
        const user = await tx.user.create({
          data: {
            email: input.email,
            password: hased,
          },
        });

        await Promise.all([
          // 프로필 생성
          tx.profile.create({
            data: {
              userId: user.id,
              nickname: input.nickname,
              gender: input.gender,
              profileUrl: input.defaultProfile ? null : input.profileUrl,
              avatarSvg: input.defaultProfile ? input.avatarSvg : null,
              defaultProfile: input.defaultProfile,
            },
          }),
          // 지갑 생성
          tx.account.create({
            data: {
              userId: user.id,
              address: wallet.address,
              privateKey: wallet.privateKey,
              publicKey,
            },
          }),
        ]);

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
