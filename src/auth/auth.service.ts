import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { EXCEPTION_CODE } from 'src/constants/exception.code';

import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { KlaytnService } from 'src/modules/klaytn/klaytn.service';

import { CreateRequestDto } from './dto/create.request.dto';

import type { User, UserAuthentication, UserWallet } from '@prisma/client';
import { SigninRequestDto } from './dto/signin.request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly klaytn: KlaytnService,
  ) {}

  async generateToken(
    user: User,
    wallet?: UserWallet | null,
    authentication?: UserAuthentication | null,
  ) {
    const { id: userId } = user;
    const auth =
      authentication ??
      (await (async () => {
        return this.prisma.userAuthentication.create({
          data: {
            userId,
          },
        });
      })());

    const token = await this.jwt.sign({
      authId: auth.id,
      userId: userId,
      address: wallet.address,
    });

    return {
      accessToken: token,
    };
  }

  /**
   * @description 로그인
   * @param {SigninRequestDto} input
   */
  async signin(input: SigninRequestDto) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 회원가입
   * @param {CreateRequestDto} input
   */
  async create(input: CreateRequestDto) {
    const exists = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    // 이미 가입한 이메일이 존재하는 경우
    if (exists) {
      throw new BadRequestException({
        status: EXCEPTION_CODE.ALREADY_EXIST,
        message: ['이미 가입한 유저의 이메일 입니다.'],
        error: 'Already Exists',
      });
    }

    const salt = await bcrypt.genSalt(this.config.get('SALT_ROUNDS'));
    const hash = await bcrypt.hash(input.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: hash,
        profileUrl: input.profileUrl || null,
      },
    });

    const inMemoryWallet = this.klaytn.createWallet();
    if (!inMemoryWallet) {
      throw new InternalServerErrorException({
        status: EXCEPTION_CODE.WALLET_GENERATE_ERROR,
        message: ['지갑생성 오류'],
        error: 'Wallet Generate Error',
      });
    }

    const existsWallet = await this.prisma.userWallet.findUnique({
      where: {
        address: inMemoryWallet.address,
      },
    });

    if (existsWallet) {
      throw new BadRequestException({
        status: EXCEPTION_CODE.ALREADY_EXIST_FOR_WALLET,
        message: ['이미 등록된 지갑 주소 입니다.'],
        error: 'Already Exists For Wallet',
      });
    }

    const wallet = await this.prisma.userWallet.create({
      data: {
        address: inMemoryWallet.address,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    const { accessToken } = await this.generateToken(user, wallet);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        userId: user.id,
        accessToken,
      },
    };
  }
}
