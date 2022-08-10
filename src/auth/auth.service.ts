import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';

import { EXCEPTION_CODE } from 'src/constants/exception.code';

import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/modules/jwt/jwt.service';

import { CreateRequestDto } from './dto/create.request.dto';

import type { User, UserAuthentication } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async generateToken(user: User, authentication?: UserAuthentication | null) {
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
    });

    return {
      accessToken: token,
    };
  }

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

    const { accessToken } = await this.generateToken(user);

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
