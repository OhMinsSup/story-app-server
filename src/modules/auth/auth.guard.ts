import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../../database/prisma.service';

// types
import type { JwtPayload } from 'jsonwebtoken';
import { EXCEPTION_CODE } from 'src/constants/exception.code';

interface Payload {
  authId: number;
  userId: number;
  address: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let accessToken: string | undefined = request.cookies?.access_token;

    const { authorization } = request.headers;

    // 토큰은 존재하지 않지만 헤더값에 authorization가 존재하는 경우
    // authorization에서 토큰이 존재하는 체크
    if (!accessToken && authorization) {
      accessToken = authorization.split(' ')[1];
    }

    if (accessToken) {
      // 토큰이 존재하는 경우
      let accessTokenData: (JwtPayload & Payload) | null = null;
      try {
        // 토큰을 통해서 유저 정보를 가져온다.
        accessTokenData = await this.jwt.verify<Payload>(accessToken);
      } catch (error) {
        // 토큰이 유효하지 않은 경우
        accessTokenData = null;
      }

      if (accessTokenData && accessTokenData.authId) {
        // access token is valid expire date diff is less than 30 days
        const diff = accessTokenData.exp - Math.floor(Date.now() / 1000);
        if (diff > 0) {
          const validated = await this.prisma.userAuthentication.findUnique({
            where: {
              id: accessTokenData.authId,
            },
          });
          if (!validated) {
            throw new UnauthorizedException({
              status: EXCEPTION_CODE.INVALID_TOKEN,
              message: ['유효하지않는 토큰입니다.'],
              error: 'Invalid Token',
            });
          }

          const user = await this.prisma.user.findUnique({
            where: {
              id: accessTokenData.userId,
            },
            select: {
              id: true,
              email: true,
              username: true,
              profileUrl: true,
              wallet: {
                select: {
                  id: true,
                  address: true,
                },
              },
            },
          });

          if (!user) {
            throw new UnauthorizedException({
              status: EXCEPTION_CODE.INVALID_TOKEN,
              message: ['유효하지않는 토큰입니다.'],
              error: 'Invalid Token',
            });
          }

          request.user = user;
          return true;
        } else {
          // 401 Unauthorized
          throw new UnauthorizedException({
            status: EXCEPTION_CODE.TOKEN_EXPIRED,
            message: ['만료된 토큰입니다.'],
            error: 'Token Expired',
          });
        }
      } else {
        // 401 Unauthorized
        throw new UnauthorizedException({
          status: EXCEPTION_CODE.INVALID_TOKEN,
          message: ['유효하지않는 토큰입니다.'],
          error: 'Invalid Token',
        });
      }
    }

    return true;
  }
}
