import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class OnlyOwner implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ownerId = request.params.ownerId;
    return user.id === ownerId;
  }
}
