import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

// service
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

export interface AccessTokenData {
  userId: number;
  email: string;
  address: string;
  sub: string;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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
          // check if user exists
          const user = await this.usersService.findByUserId(
            accessTokenData.userId,
          );
          if (user) {
            request.user = user;
          }
        }
      }
    }
    return true;
  }
}
