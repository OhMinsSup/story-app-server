import { type DynamicModule, Global, Module } from '@nestjs/common';
import type { Jwt } from './jwt.interface';
import { CONFIG_OPTIONS } from '../../constants/config';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: Jwt): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
