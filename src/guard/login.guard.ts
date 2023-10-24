import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_KEY } from 'src/decorator/public.decorator';
import { PayLoad } from 'src/user/vo/user-login.vo';
import { to } from 'src/utils';

const AUTHORIZATION_KEY = 'Bearer';

declare module 'express' {
  interface Request {
    user: PayLoad;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException('JWT 缺失');
    }

    const authorizationStr = request.headers.authorization.split(' ');
    if (
      authorizationStr.length === 0 ||
      authorizationStr.length !== 2 ||
      authorizationStr[0] !== AUTHORIZATION_KEY
    ) {
      throw new UnauthorizedException(
        `Authorization 格式错误, like: ${AUTHORIZATION_KEY} xxx`,
      );
    }

    const jwt = authorizationStr[1];

    const [err, user] = await to<PayLoad>(this.jwtService.verifyAsync(jwt));
    if (err) {
      throw new UnauthorizedException('JWT 校验失败');
    }
    request.user = user;
    return true;
  }
}
