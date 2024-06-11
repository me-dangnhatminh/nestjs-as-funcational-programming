import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';

import {
  EmailAddress,
  IUserRepository,
  RawPassword,
  UserLocalAuth,
} from '@app/auth/domain';
import { CryptoService } from '../adapters';

const INVALID_CREDENTIALS = 'Invalid email or password';
const EMAIL_NOT_MATCH = `ValidationLocalAuthPipe: userRepo.findByEmail doesn't return the correct user`;
const InvalidCredentials = () => new UnauthorizedException(INVALID_CREDENTIALS);
const EmailNotMatch = () => new Error(EMAIL_NOT_MATCH);

@Injectable()
export class ValidLocalAuth<
  T extends {
    email: EmailAddress;
    password: RawPassword;
  },
> implements PipeTransform<T, Promise<UserLocalAuth>>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepo: IUserRepository,
  ) {}

  async transform(v: T): Promise<UserLocalAuth> {
    const user = await this.userRepo.findByEmail(v.email);
    if (!user || user.provider !== 'local') throw InvalidCredentials();
    if (user.email !== v.email) throw EmailNotMatch(); // something wrong with the repository
    return this.cryptoService
      .comparePassword(v.password, user.password)
      .then((isMatch) => {
        if (!isMatch) throw InvalidCredentials();
        return user;
      });
  }
}
