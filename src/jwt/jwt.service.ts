import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

// types
import type { JwtModuleOptions } from './jwt.interfaces';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(payload: any, options?: SignOptions): string {
    const jwtOptions: SignOptions = {
      issuer: 'story-app.io',
      expiresIn: '7d',
      ...options,
    };

    if (!jwtOptions.expiresIn) {
      // removes expiresIn when expiresIn is given as undefined
      delete jwtOptions.expiresIn;
    }

    return jwt.sign(payload, this.options.privateKey, jwtOptions);
  }
  verify<T = string | jwt.JwtPayload>(token: string) {
    return jwt.verify(token, this.options.privateKey) as T;
  }
}
