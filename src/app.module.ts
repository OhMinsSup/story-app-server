import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import joi from '@hapi/joi';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { KlaytnModule } from './modules/klaytn/klaytn.module';
import { UsersModule } from './users/users.module';
import { AuthGuardModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { FileModule } from './file/file.module';
import { ItemModule } from './item/item.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: isDev
        ? '.env.development'
        : isProd
        ? '.env.production'
        : '.env',
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
        CLOUDINARY_CLOUD_NAME: joi.string().required(),
        CLOUDINARY_API_KEY: joi.string().required(),
        CLOUDINARY_API_SECRET: joi.string().required(),
        NFT_STORAGE_API_KEY: joi.string().required(),
      }),
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MulterModule.register({
      storage: memoryStorage(), // use memory storage for having the buffer
    }),
    KlaytnModule.forRoot({
      klaytnNetRpcUrl: process.env.KLAYTN_NET_RPC_URL,
    }),
    CloudinaryModule.forRoot({
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    }),
    IpfsModule.forRoot({
      nftStorageApiKey: process.env.NFT_STORAGE_API_KEY,
    }),
    AuthGuardModule,
    AuthModule,
    UsersModule,
    FileModule,
    ItemModule,
  ],
})
export class AppModule {}
