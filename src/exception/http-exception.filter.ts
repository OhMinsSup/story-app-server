import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | string
      | { resultCode: number; msg: string };

    if (typeof err === 'string') {
      return response.status(status).json({
        data: null,
        ok: false,
        resultCode: status,
        message: err,
      });
    }
    return response.status(status).json({
      data: null,
      ok: false,
      resultCode: err.resultCode,
      message: err.msg,
    });
  }
}
