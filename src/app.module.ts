import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as Joi from '@hapi/joi';

// middleware
import { LoggerMiddleware } from './middlewares/logger.middleware';

// modules
import { JwtModule } from './jwt/jwt.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FilesModule } from './files/files.module';
import { StoriesModule } from './story/story.module';
import { TagsModule } from './tags/tags.module';
import { KlaytnModule } from './klaytn/klaytn.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        DATABASE_URL: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
      }),
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MulterModule.register({
      storage: memoryStorage(), // use memory storage for having the buffer
    }),
    CloudinaryModule.forRoot({
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    }),
    KlaytnModule.forRoot(),
    AuthModule,
    UsersModule,
    FilesModule,
    StoriesModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
