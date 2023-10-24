import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class BaseExceptionsFilter<T> implements ExceptionFilter {
  private logger = new Logger();
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    this.logger.error(new ServiceUnavailableException().getResponse());

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      timestamp: new Date().toISOString(),
      path: request.url,
      info: new ServiceUnavailableException().getResponse()['message'],
    });
  }
}
