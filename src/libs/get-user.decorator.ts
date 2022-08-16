import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUserSchema;
  },
);

export interface AuthUserSchema {
  id: number;
  email: string;
  profileUrl: string;
  wallet: {
    id: number;
    address: string;
  };
}
