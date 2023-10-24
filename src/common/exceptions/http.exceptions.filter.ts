import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger();
  convertErrorMessage(error: any): string {
    this.logger.error(error);

    if (typeof error === 'string') {
      return error;
    } else if (typeof error === 'object') {
      return error.message?.join
        ? error.message.join(',')
        : error.message || '';
    }
    return '';
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      error: exception.name,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.convertErrorMessage(exception.getResponse()),
    });
  }
}
