import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import { PrismaService } from './database/prisma.service';

import { AppModule } from './app.module';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const prisma: PrismaService = app.get(PrismaService);
  prisma.enableShutdownHooks(app);

  const config = new DocumentBuilder()
    .setTitle('Story API Server')
    .setDescription('Story NFT Market App API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(compression());

  await app.listen(3000);
}
bootstrap();
