import { Global, Module } from '@nestjs/common';
import * as NestJWT from '@nestjs/jwt';

export class JwtService extends NestJWT.JwtService {}

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
