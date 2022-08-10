import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  result: T;
  resultCode: number;
  message: string | string[] | null;
  error: string | null;
}

@Injectable()
export class HttpTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        result: data.result,
        resultCode: data.resultCode,
        message: data.message,
        error: data.error,
      })),
    );
  }
}
