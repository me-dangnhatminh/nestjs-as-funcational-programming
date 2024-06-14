import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from 'express';
import { UserRole } from '@app/auth/domain';
import { AllowRoles } from '../decorators';

const NotAllowPermission = () =>
  new ForbiddenException('You do not have permission to access this resource');

@Injectable()
export class AllowedRoles implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const roles = this.reflector.get<UserRole[]>(AllowRoles, handler) ?? [];
    if (!roles.length) return true;
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    const can = roles.includes(user.role);
    if (!can) throw NotAllowPermission();
    return true;
  }
}
