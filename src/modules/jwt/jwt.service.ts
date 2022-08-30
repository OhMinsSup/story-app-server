import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../../constants/config';
import jwt from 'jsonwebtoken';

// types
import type { Jwt } from './jwt.interface';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: Jwt) {}

  async sign(payload: Record<string, string | number>, options?: SignOptions) {
    const jwtOptions: SignOptions = {
      expiresIn: '7d',
      ...options,
    };

    if (!jwtOptions.expiresIn) {
      // removes expiresIn when expiresIn is given as undefined
      delete jwtOptions.expiresIn;
    }

    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        this.options.privateKey,
        jwtOptions,
        (err, token: string) => {
          if (err || !token) {
            return reject(err);
          }
          resolve(token);
        },
      );
    });
  }

  async verify<T = Record<string, any>>(token: string) {
    return new Promise<jwt.JwtPayload & T>((resolve, reject) => {
      jwt.verify(token, this.options.privateKey, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded as jwt.JwtPayload & T);
      });
    });
  }
}
