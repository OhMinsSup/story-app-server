import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser(process.env.COOKIE_SECRET));

  await app.listen(3000);
}
bootstrap();
