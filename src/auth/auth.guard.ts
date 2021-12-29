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

    if (!accessToken && authorization) {
      accessToken = authorization.split(' ')[1];
    }

    if (accessToken) {
      let accessTokenData: AccessTokenData | null = null;
      try {
        accessTokenData = this.jwtService.verify<AccessTokenData>(accessToken);
      } catch (error) {
        accessTokenData = null;
      }
      if (accessTokenData) {
        // access token is valid expire date diff is less than 30 days
        const diff = accessTokenData.exp - Math.floor(Date.now() / 1000);
        if (diff > 0) {
          const { id, address } = accessTokenData;
          if (this.klaytnService.isAddress(address)) {
            const user = await this.usersService.findByUserId(id);
            console.log(user);
            if (user) {
              request.user = user;
            }
          }
          // https://forum.klaytn.com/t/kaikas-sign-list/2395
          // https://forum.klaytn.com/t/kaikas-sign/2137
          // const sign = await this.usersService.findBySignature(
          //   accessTokenData.signature,
          // );
          // if (sign) {
          //   const address = await this.klaytnService.recoverSignature(
          //     sign.signature,
          //     sign.messageHash,
          //   );
          // if (address) {
          //   console.log('access token is address', address);
          //   // check if user exists
          //   const user = await this.usersService.findByWalletAddress(address);
          //   console.log('access token is user', user);
          //   if (user) {
          //     request.user = user;
          //   }
          // }
          // }
        }
      }
    }

    return true;
  }
}
