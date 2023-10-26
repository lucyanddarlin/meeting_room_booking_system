import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export const MQuery = createParamDecorator(
  (key: string, ctx: ExecutionContext): any => {
    const request: Request = ctx.switchToHttp().getRequest();
    const nextData = request.query[key];
    if (!nextData) {
      throw new BadRequestException(`${key} 缺失`);
    }
    return nextData;
  },
);
