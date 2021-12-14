import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';
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
import { ProfileUpdateRequestDto } from './dtos/profileUpdate.request.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly klaytnService: KlaytnService,
  ) {}

  /**
   * @description - 유저 아이디로 유저 찾기
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
   * @description - 유저 이메일로 유저 찾기
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
   * @param {string} signature
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
   * @param {string} address
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
   * @description - 유저 상세
   * @param {number} userId
   */
  async detail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userAccountSelect,
    });

    if (!user) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        msg: '존재하지 않는 유저입니다.',
      });
    }

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: user,
    };
  }

  /**
   * @description - 유저정보 수정
   * @param {number} userId
   * @param {ProfileUpdateRequestDto} input
   */
  async update(userId: number, input: ProfileUpdateRequestDto) {
    const currentUser = await this.findByUserId(userId);
    if (!currentUser) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        msg: '존재하지 않는 유저입니다.',
      });
    }

    const { profile } = currentUser;
    // currentUser.profile Data compare with input diffence data update
    const updateData: Record<string, any> = {};

    // 닉네임
    if (input.nickname && input.nickname !== profile.nickname) {
      updateData.nickname = input.nickname;
    }

    // 성별
    if (input.gender && input.gender !== profile.gender) {
      updateData.gender = input.gender;
    }

    // 내 소개
    if (input.bio && input.bio !== profile.bio) {
      updateData.bio = input.bio;
    }

    // 프로필 (업로드 사진)
    if (input.profileUrl) {
      if (input.profileUrl !== profile.profileUrl) {
        updateData.profileUrl = input.profileUrl;
        updateData.defaultProfile = false;
      }
      // 프로필 (기본 사진)
    } else if (input.defaultProfile) {
      updateData.defaultProfile = true;
      updateData.profileUrl = '';
    }

    if (!_.isEmpty(updateData)) {
      await this.prisma.profile.update({
        where: {
          id: userId,
        },
        data: {
          ...updateData,
        },
      });
    }

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: {
        dataId: userId,
      },
    };
  }

  /**
   * @description - 로그인
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
          messageData: message,
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
      const { id, createdAt, updatedAt, ...info } = exists.profile;

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          accessToken,
          id: exists.id,
          email: exists.email,
          profile: info,
          account: {
            address: exists.account.address,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description - 회원가입
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
              profileUrl: null,
              avatarSvg: input.avatarSvg,
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

  /**
   * @description 회원탈퇴
   * @param {number} id
   */
  async unregister(id: number) {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          isDelete: true,
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: true,
      };
    } catch (error) {
      throw error;
    }
  }
}
