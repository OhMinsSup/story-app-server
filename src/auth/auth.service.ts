import bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';

import { EXCEPTION_CODE } from 'src/constants/exception.code';

import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';

import { CreateRequestDto } from './dto/create.request.dto';

import type { User, UserAuthentication } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generateToken(user: User, authentication?: UserAuthentication | null) {
    const { id: userId, username } = user;
    const auth =
      authentication ??
      (await (async () => {
        return this.prisma.userAuthentication.create({
          data: {
            userId,
          },
        });
      })());
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
        resultCode: EXCEPTION_CODE.ALREADY_EXIST,
        message: 'already exists',
      });
    }

    const hash = await bcrypt.hash(
      input.password,
      this.config.get('SALT_ROUNDS'),
    );

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: hash,
        profileUrl: input.profileUrl || null,
      },
    });
    console.log('exists', exists);

    return null;
  }
}
