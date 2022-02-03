import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

// service
import { JwtService } from 'src/jwt/jwt.service';
import { KlaytnService } from 'src/klaytn/klaytn.service';
import { UsersService } from 'src/users/users.service';

export interface AccessTokenData {
  address: string;
  id: number;
  sub: string;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly klaytnService: KlaytnService,
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
      let accessTokenData: AccessTokenData | null = null;
      try {
        // 토큰을 통해서 유저 정보를 가져온다.
        accessTokenData = this.jwtService.verify<AccessTokenData>(accessToken);
      } catch (error) {
        // 토큰이 유효하지 않은 경우
        accessTokenData = null;
      }

      if (accessTokenData) {
        // access token is valid expire date diff is less than 30 days
        const diff = accessTokenData.exp - Math.floor(Date.now() / 1000);
        if (diff > 0) {
          const { id, address } = accessTokenData;
          if (this.klaytnService.isAddress(address)) {
            const user = await this.usersService.findByUserId(id);
            if (user) {
              request.user = user;
            } else {
              // 403 forbidden
            }
          } else {
            // 403 forbidden
          }
        } else {
          // 403 forbidden
        }
      }
    }

    return true;
  }
}
