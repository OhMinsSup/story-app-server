import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { PrismaService } from './database/prisma.service';

import { HttpExceptionFilter } from './libs/http-exception.filter';
import { HttpTransformInterceptor } from './libs/http-transform.interceptor';

import { AppModule } from './app.module';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpTransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = app.get(ConfigService);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedHosts = [/^https:\/\/domain.io$/];
      if (config.get('NODE_ENV') === 'development') {
        allowedHosts.push(/^http:\/\/localhost/);
      }

      let corsOptions: any;
      const valid = allowedHosts.some((regex) => regex.test(origin));
      if (valid) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
      } else {
        corsOptions = { origin: false }; // disable CORS for this request
      }
      callback(null, corsOptions);
    },
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('API Document')
    .setDescription('API Document')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, document);

  app.use(helmet());
  app.use(cookieParser(config.get('COOKIE_SECRET')));
  app.use(compression());

  await app.listen(config.get('PORT'));
}
bootstrap();
