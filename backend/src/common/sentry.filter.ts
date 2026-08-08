import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
if (process.env.SENTRY_DSN) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/node');
}

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Report 5xx and unknown errors to Sentry — skip 4xx (expected client errors).
    if (Sentry && status >= 500) {
      Sentry.withScope((scope: any) => {
        scope.setTag('path', req.url);
        scope.setTag('method', req.method);
        Sentry.captureException(exception);
      });
    }

    if (isHttp) {
      const body = exception.getResponse();
      res.status(status).json(typeof body === 'string' ? { message: body, statusCode: status } : body);
    } else {
      this.logger.error(exception);
      res.status(status).json({ message: 'Internal server error', statusCode: status });
    }
  }
}
