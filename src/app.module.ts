import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import joi from '@hapi/joi';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { KlaytnModule } from './modules/klaytn/klaytn.module';

// const isDev = process.env.NODE_ENV === 'development';
// const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: joi.object({
        NODE_ENV: joi
          .string()
          .valid('test', 'development', 'production')
          .required(),
        DATABASE_URL: joi.string().required(),
        COOKIE_SECRET: joi.string().required(),
        PORT: joi.number().optional().default(8000),
        SALT_ROUNDS: joi.number().optional().default(8),
        PRIVATE_KEY: joi.string().required(),
        KLAYTN_NET_RPC_URL: joi.string().uri().required(),
      }),
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    KlaytnModule.forRoot({
      klaytnNetRpcUrl: process.env.KLAYTN_NET_RPC_URL,
    }),
    AuthModule,
  ],
})
export class AppModule {}
