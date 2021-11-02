import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

type BadRequestExceptionType = {
  statusCode: number;
  message: string[];
  error: string;
};

type CustomExceptionType = { resultCode: number; msg: string };

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | string
      | CustomExceptionType
      | BadRequestExceptionType;

    if (typeof err === 'string') {
      return response.status(status).json({
        result: null,
        ok: false,
        resultCode: status,
        message: err,
      });
    }

    if ('message' in err && 'error' in err) {
      return response.status(status).json({
        result: null,
        ok: false,
        resultCode: status,
        message: err.message,
      });
    }

    return response.status(status).json({
      result: null,
      ok: false,
      resultCode: err.resultCode,
      message: err.msg,
    });
  }
}
