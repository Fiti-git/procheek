import 'reflect-metadata';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  // Must be imported and initialized BEFORE any Nest / express imports.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  });
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/sentry.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express');
  // Preserve raw body only for the webhook route so HMAC verification stays exact.
  app.use('/api/payments/webhook', express.json({
    verify: (req: any, _res: any, buf: Buffer) => {
      req.rawBody = buf;
    },
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new SentryExceptionFilter());

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('PROCHEECK API')
      .setDescription('Safety training & certification platform — NOM/STPS compliance')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PROCHEECK API listening on http://localhost:${port}/api`);
}
bootstrap();
