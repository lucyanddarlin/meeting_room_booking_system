import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    const userAgent = request.headers['user-agent'];
    const { ip, method, path } = request;

    this.logger.debug(
      `${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
        context.getHandler().name
      } invoked...`,
    );

    this.logger.debug(
      `user: ${request?.user?.id ?? 'no_ID'}, ${
        request?.user?.username ?? 'no_User'
      }`,
    );

    const now = Date.now();

    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${
            Date.now() - now
          }ms`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
