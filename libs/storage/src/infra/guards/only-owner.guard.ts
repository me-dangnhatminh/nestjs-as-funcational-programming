import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithUser } from 'express';

@Injectable()
export class OnlyOwner implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    const ownerId = request.params.ownerId;
    return user.id === ownerId;
  }
}
