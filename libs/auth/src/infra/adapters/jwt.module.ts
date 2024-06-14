import { AuthClaim } from '@app/auth/domain';
import { Module } from '@nestjs/common';
import * as NestJWT from '@nestjs/jwt';

const AT_SECRET = 'auth-secret'; // TODO: move to env config
const CT_SECRET = 'confirm-secret';
const FT_SECRET = 'forgot-pass-secret';

export class JwtService extends NestJWT.JwtService {
  genAT(claims: AuthClaim) {
    return this.sign(claims, { secret: AT_SECRET });
  }

  decodeAT(token: string): Promise<AuthClaim> {
    return this.verifyAsync(token, { secret: AT_SECRET });
  }

  genConfirmToken(claims: AuthClaim) {
    return this.sign(claims, { secret: CT_SECRET });
  }

  decodeConfirmToken(token: string) {
    return this.verifyAsync(token, { secret: CT_SECRET }).then(AuthClaim.parse);
  }

  genForgotPassToken(claims: AuthClaim) {
    return this.sign(claims, { secret: FT_SECRET });
  }

  decodeForgotPassToken(token: string) {
    return this.verifyAsync(token, { secret: FT_SECRET }).then(AuthClaim.parse);
  }
}

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
