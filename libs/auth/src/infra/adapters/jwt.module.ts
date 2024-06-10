import { Global, Module } from '@nestjs/common';
import * as NestJWT from '@nestjs/jwt';

export class JwtService extends NestJWT.JwtService {
  genAT(data: { id: string }): Promise<string> {
    return this.signAsync(data);
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
