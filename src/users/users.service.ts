import { Injectable, NotFoundException } from '@nestjs/common';
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';

import type { Account, Profile } from '.prisma/client';

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
import { userAccountSelect, userSelect } from 'src/common/select.option';
import { ProfileUpdateRequestDto } from './dtos/profileUpdate.request.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly klaytnService: KlaytnService,
  ) {}

  /**
   * @description - 유저 schema 모델을 생성한다.
   * @param {string} email - 유저 이메일
   * @param {string} password - 유저 패스워드
   */
  private async createUserSchema(email: string, password: string) {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });
    return user;
  }

  /**
   * @description - 유저 지갑 계정 schema 모델을 생성한다.
   * @param {number} userId - 유저 아이디
   * @param {Pick<Account, 'address' | 'privateKey'>} input - 지갑 정보 (지갑주소, 개인키)
   */
  private async createAccountSchema(
    userId: number,
    input: Pick<Account, 'address' | 'privateKey'>,
  ) {
    const account = await this.prisma.account.create({
      data: {
        userId,
        ...input,
      },
    });
    return account;
  }

  /**
   * @description - 유저 프로필 schema 모델을 생성한다.
   * @param {number} userId - 유저 아이디
   * @param {Pick<Profile, 'avatarSvg' | 'defaultProfile' | 'gender' | 'nickname' | 'profileUrl'>} input - 프로필 정보
   */
  private async createProfileSchema(
    userId: number,
    input: Pick<
      Profile,
      'avatarSvg' | 'defaultProfile' | 'gender' | 'nickname' | 'profileUrl'
    >,
  ) {
    const profile = await this.prisma.profile.create({
      data: {
        userId,
        ...input,
      },
    });
    return profile;
  }

  /**
   * @description - 유저 이메일또는 닉네임으로 유저 찾기
   * @param {string} email - 유저 이메일
   * @param {string} nickname - 유저 닉네임
   */
  async findByEmailOrNickname(email?: string, nickname?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        profile: {
          OR: [
            {
              nickname,
            },
          ],
        },
      },
      select: userSelect,
    });
    return user;
  }

  /**
   * @description - 유저 이메일로 유저 찾기
   * @param {string} email - 유저 이메일
   */
  async findByUserEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: userSelect,
    });
    return user;
  }

  /**
   * @description - 유저 아이디로 유저 찾기
   * @param {number} userId - 유저 아이디
   */
  async findByUserId(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userAccountSelect,
    });
    return user;
  }

  /**
   * @description - 유저 지갑 주소를 찾기
   * @param userAddress - 유저 지갑 주소
   */
  async findByUserAddress(userAddress: string) {
    const user = await this.prisma.account.findUnique({
      where: {
        address: userAddress,
      },
    });
    return user;
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

    // 알림 설정
    if (typeof input.canNotification === 'boolean') {
      updateData.canNotification = input.canNotification;
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
   * @date 2022-03-21
   * @author veloss
   */
  async signin(input: SigninRequestDto) {
    const user_exists = await this.findByUserEmail(input.email);

    if (!user_exists) {
      return {
        ok: false,
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '존재하지 않는 사용자 입니다.',
        result: null,
      };
    }

    const compare = await bcrypt.compare(input.password, user_exists.password);
    if (!compare) {
      return {
        ok: false,
        resultCode: EXCEPTION_CODE.INCORRECT_PASSWORD,
        message: '비밀번호가 일치하지 않습니다.',
        result: null,
      };
    }

    const accessToken = this.jwtService.generateAccessToken(
      user_exists.id,
      user_exists.account.address,
    );

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: {
        accessToken,
      },
    };
  }

  /**
   * @description - 회원가입
   * @param {SignupRequestDto} input
   * @date 2022-03-21
   * @author veloss
   */
  async signup(input: SignupRequestDto) {
    const user_exists = await this.findByEmailOrNickname(
      input.email,
      input.nickname,
    );

    if (user_exists) {
      return {
        ok: false,
        resultCode: EXCEPTION_CODE.INVALID,
        message:
          user_exists.email === input.email
            ? '이미 사용중인 이메일입니다. 다시 입려해주세요.'
            : '이미 사용중인 닉네임 입니다. 다시 입력해 주세요.',
        result: user_exists.email === input.email ? 'email' : 'nickname',
      };
    }

    /**
     * @example
     * SingleKeyring {
     *   _address: '0x17e7531b40ad5d7b5fa7b4ec78df64ce1cb36d24',
     *   _key: PrivateKey { _privateKey: '0x{private key}' }
     * }
     */
    const keyring = this.klaytnService.keyring();

    const {
      address,
      key: { privateKey },
    } = keyring;

    const account_exists = await this.findByUserAddress(address);
    if (account_exists) {
      return {
        ok: false,
        resultCode: EXCEPTION_CODE.INVALID,
        message: '이미 사용중인 주소입니다. 다시 입력해 주세요.',
        result: 'address',
      };
    }

    const hased = await bcrypt.hash(input.password, 12);

    // 유저 생성
    const user = await this.createUserSchema(input.email, hased);

    // avatarSvg는 무조건 넣는다.
    const profile: Pick<
      Profile,
      'defaultProfile' | 'avatarSvg' | 'profileUrl'
    > = {
      defaultProfile: true,
      avatarSvg: input.avatarSvg,
      profileUrl: undefined,
    };

    if (!input.defaultProfile) {
      Object.assign(profile, {
        defaultProfile: false,
        avatarSvg: input.avatarSvg,
        profileUrl: input.profileUrl,
      });
    }

    await Promise.all([
      // 프로필 생성
      this.createProfileSchema(user.id, {
        nickname: input.nickname,
        gender: input.gender,
        ...profile,
      }),
      this.createAccountSchema(user.id, { address, privateKey }),
    ]);

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: true,
    };
  }

  /**
   * @description 회원탈퇴
   * @param {number} id
   */
  async unregister(id: number) {
    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: true,
    };
  }
}
