import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const PayLoadUser = createParamDecorator(
  (key: string, ctx: ExecutionContext): any => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (key) {
      return request.user[key];
    }
    return request.user;
  },
);
