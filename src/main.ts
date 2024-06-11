import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import * as BodyParser from 'body-parser';

import RootModule from './root.module';

const buildCORS = (app: INestApplication) => {
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
};

const bootstrap = async () => {
  const appLog = new Logger('Bootstrap');
  const app = await NestFactory.create(RootModule);

  app.use(cookieParser());
  app.use(BodyParser.json({ limit: '100mb' }));

  buildCORS(app);
  app
    .listen(5000)
    .then(() => appLog.log('is running on http://localhost:5000'));
};
bootstrap();
