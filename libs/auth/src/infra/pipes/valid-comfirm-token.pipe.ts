import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { AuthClaim, ValidatedEmail } from '@app/auth/domain';

import { JwtService } from '../adapters';

@Injectable()
export class ValidComfirmToken
  implements PipeTransform<{ token: string }, Promise<ValidatedEmail>>
{
  constructor(private readonly jwtService: JwtService) {}

  async transform({ token }: { token: string }): Promise<ValidatedEmail> {
    const claims = await this.jwtService.decodeConfirmToken(token);
    if (claims.exp < Date.now()) throw new BadRequestException('Token expired');
    return { email: claims.email, verifiedAt: new Date(claims.iat) };
  }
}

@Injectable()
export class ValidForgotPasswordToken<T extends { token: string }>
  implements PipeTransform<T, Promise<T>>
{
  constructor(private readonly jwtService: JwtService) {}

  async transform(value: T): Promise<T & AuthClaim> {
    const claims = await this.jwtService.decodeForgotPassToken(value.token);
    if (claims.exp < Date.now()) throw new BadRequestException('Token expired');
    return Object.assign({}, value, claims);
  }
}
