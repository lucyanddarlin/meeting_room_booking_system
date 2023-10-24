import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSION_KEY } from 'src/decorator/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.user) {
      return true;
    }

    const requirePermissions = this.reflector.getAllAndOverride(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirePermissions) {
      return true;
    }

    const permissions = request.user.permissions;

    for (let i = 0; i < requirePermissions.length; i++) {
      const curPermission = requirePermissions[i];
      const matchPermission = permissions.find((p) => p.code === curPermission);
      if (!matchPermission) {
        throw new UnauthorizedException('缺少权限');
      }
    }

    return true;
  }
}
