import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RequestWithUser, Response } from 'express';
import { map, Observable } from 'rxjs';

import { toClaim } from '@app/auth/domain';
import { JwtService } from '../adapters';
import { authHelper } from '../helpers';

export const AUTHENTICATED_KEY = 'x-user-authenticated' as const;

@Injectable()
export class GenAndSetTokenToCookie implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        const res = context.switchToHttp().getResponse<Response>();
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const user = req.user;

        const claim = toClaim(user);
        const token = this.jwtService.genAT(claim);
        authHelper.setTokenToCookie(res)(token);

        return value;
      }),
    );
  }
}
