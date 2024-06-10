import { Global, Injectable, Module } from '@nestjs/common';
import * as NestJWT from '@nestjs/jwt';

@Injectable()
export class JwtService extends NestJWT.JwtService {
  genAT(data: { id: string }): string {
    return 'token';
  }

  decodeAT(token: string): { id: string } {
    return this.verify(token);
  }
}

@Global()
@Module({
  imports: [
    NestJWT.JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
