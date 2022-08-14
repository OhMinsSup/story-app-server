import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { EXCEPTION_CODE } from 'src/constants/exception.code';

import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { KlaytnService } from 'src/modules/klaytn/klaytn.service';

import { CreateRequestDto } from './dto/create.request.dto';

import type { UserAuthentication } from '@prisma/client';
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
    userId: number,
    address?: string | null,
    authentication?: UserAuthentication | null,
  ) {
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
      userId,
      address,
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
    const existsByUser = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!existsByUser) {
      throw new NotFoundException({
        status: EXCEPTION_CODE.NOT_EXIST,
        message: ['존재하지 않는 사용자 입니다.'],
        error: 'Not Found User',
      });
    }

    const compare = await bcrypt.compare(
      input.password,
      existsByUser.passwordHash,
    );

    if (!compare) {
      throw new BadRequestException({
        status: EXCEPTION_CODE.INCORRECT_PASSWORD,
        message: ['비밀번호가 일치하지 않습니다.'],
        error: 'Incorrect Password',
      });
    }

    const wallet = await this.prisma.userWallet.findFirst({
      where: {
        userId: existsByUser.id,
      },
      select: {
        address: true,
      },
    });

    const { accessToken } = await this.generateToken(
      existsByUser.id,
      wallet.address,
    );

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        userId: existsByUser.id,
        accessToken,
      },
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

    const { accessToken } = await this.generateToken(user.id, wallet.address);

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
