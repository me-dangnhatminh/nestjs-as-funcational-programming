import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { JwtService } from '../adapters';

export class SetTokenToResInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((claim: { id: string }) => {
        const token = this.jwtService.genAT(claim);
        context
          .switchToHttp()
          .getResponse()
          .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
      }),
    );
  }
}
