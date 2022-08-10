import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

type Exception = {
  status: number;
  message: string[] | string;
  error: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as Exception;

    return response.status(status).json({
      resultCode: error.status ?? -1,
      message: error.message,
      error: error.error,
      result: null,
    });
  }
}
