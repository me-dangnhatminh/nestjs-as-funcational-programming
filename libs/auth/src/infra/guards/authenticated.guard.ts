import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IUserRepository } from '@app/auth/domain';
import { JwtService } from '../adapters';
import { authHelper } from '../helpers';

@Injectable()
export class Authenticated implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly jwtService: JwtService,
    protected readonly userRepo: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = authHelper.getTokenFromReq(request);
    if (!token) throw new UnauthorizedException('Not signed in');
    const claim = await this.jwtService.decodeAT(token);
    const user = await this.userRepo.findById(claim.sub);
    authHelper.addUserToReq(request)(user!);
    return true;
  }
}
