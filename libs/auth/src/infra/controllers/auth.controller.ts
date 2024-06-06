import { Function as F, Either as E } from 'effect';
import { EmailAddress, RawPassword, User } from '@app/auth/domain';
import { Controller, Post } from '@nestjs/common';

type SignUpRequest = {
  email: string;
  password: string;
};
type ValidateInput = (
  input: SignUpRequest,
) => E.Either<Error, { email: EmailAddress; password: RawPassword }>;

type ValidateEmailExists = (
  email: EmailAddress,
) => E.Either<Error, EmailAddress>;
type HashPassword = (password: RawPassword) => HashPassword;
type Persist = (user: User) => Promise<void>;

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('email/sign-up')
  async signUp() {
    // workflow
    // step 1: validate input
    // step 2: check if email exists
    // step 3: hash password
    // step 4: save user
    // step 5: send verification email (side effect)
    // step 6: return success
  }
}
