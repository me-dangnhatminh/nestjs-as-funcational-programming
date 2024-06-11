import { AuthClaim, EmailComfirmClaim } from '@app/auth/domain';
import { Module } from '@nestjs/common';
import * as NestJWT from '@nestjs/jwt';

const AT_SECRET = 'auth-secret'; // TODO: move to env
const CT_SECRET = 'confirm-secret';

export class JwtService extends NestJWT.JwtService {
  genAT(claims: AuthClaim) {
    return this.sign(claims, { secret: AT_SECRET });
  }
  decodeAT(token: string): Promise<AuthClaim> {
    return this.verifyAsync(token, { secret: AT_SECRET });
  }

  genConfirmToken(claims: EmailComfirmClaim) {
    return this.sign(claims, { secret: CT_SECRET });
  }

  decodeConfirmToken(token: string) {
    return this.verifyAsync(token, { secret: CT_SECRET }).then(
      EmailComfirmClaim.parse,
    );
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
