import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

type Exception = {
  status: number;
  message: string[] | string;
  error: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as Exception;

    // 401
    if (status === HttpStatus.UNAUTHORIZED) {
      res.clearCookie(this.config.get('COOKIE_TOKEN_NAME'), {
        httpOnly: true,
        domain: this.config.get('COOKIE_DOMAIN'),
        path: this.config.get('COOKIE_PATH'),
        sameSite: this.config.get('COOKIE_SAMESITE'),
      });
    }

    return res.status(status).json({
      resultCode: error.status ?? -1,
      message: error.message,
      error: error.error,
      result: null,
    });
  }
}
