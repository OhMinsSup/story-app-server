import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  result: T;
  resultCode: number;
  message: string | string[] | null;
  error: string | null;
}

@Injectable()
export class CookiInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly config: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();
    return next.handle().pipe(
      map((data) => {
        if (data.result) {
          res.cookie(
            this.config.get('COOKIE_TOKEN_NAME'),
            data.result.accessToken,
            {
              httpOnly: true,
              domain: this.config.get('COOKIE_DOMAIN'),
              path: this.config.get('COOKIE_PATH'),
              maxAge: 1000 * 60 * 60 * 24 * 30,
              sameSite: this.config.get('COOKIE_SAMESITE'),
            },
          );
        }
        return data;
      }),
    );
  }
}
