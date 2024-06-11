import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { JwtService } from '../adapters';
import { ValidatedEmail } from '@app/auth/domain';

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
