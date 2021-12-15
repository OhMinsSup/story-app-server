import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { TransformInterceptor } from './middlewares/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const prisma: PrismaService = app.get(PrismaService);
  prisma.enableShutdownHooks(app);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedHosts = [/^https:\/\/domain.io$/];
      if (process.env.NODE_ENV === 'development') {
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

  await app.listen(8080);
}
bootstrap();
