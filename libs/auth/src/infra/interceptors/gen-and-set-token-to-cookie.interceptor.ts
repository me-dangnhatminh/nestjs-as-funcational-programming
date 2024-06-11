import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RequestWithUser, Response } from 'express';
import { map, Observable } from 'rxjs';

import { JwtService } from '../adapters';

export interface Claim {
  sub: string;
  exp: number;
  iat: number;
  role: string;
}

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
        if (!user) throw new Error('User not found in request');
        const now = Date.now();
        const claim: Claim = {
          sub: user.id,
          exp: now + 1000 * 60 * 60 * 24 * 7, // 7 days TODO: move to config
          iat: now,
          role: user.role,
        };
        const token = this.jwtService.sign(claim, {
          privateKey: 'secret-key',
        });

        res.cookie(AUTHENTICATED_KEY, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days TODO: move to config
        });

        return value;
      }),
    );
  }
}
