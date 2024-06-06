import {
  EmailAddress,
  HashedPassword,
  IUserRepository,
  RawPassword,
  User,
  UserId,
} from '@app/auth/domain';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';

import { Function as F, Either as E } from 'effect';
import * as RxJs from 'rxjs';
import { hashSync, genSaltSync } from 'bcrypt';
import { v4 as uuid } from 'uuid';

type SignUpBody = { email: string; password: string };
type ValidInput = { id: UserId; email: EmailAddress; password: RawPassword };
type InputWithHashed = Omit<ValidInput, 'password'> & {
  password: HashedPassword;
};

type ValidateInput = (
  input: SignUpBody,
) => E.Either<ValidInput, BadRequestException>;

type ValidateEmailExists = (
  input: ValidInput,
) => RxJs.Observable<E.Either<ValidInput, ConflictException>>;

type HashPassword = (
  input: ValidInput,
) => Omit<ValidInput, 'password'> & { password: HashedPassword };

const toUser = (input: InputWithHashed): User => {
  return User.of({
    id: input.id,
    provider: 'local',
    email: input.email,
    password: input.password,
    createdAt: new Date(),
  });
};

const HashPassword: HashPassword = (input) => ({
  id: input.id,
  email: input.email,
  password: hashSync(input.password, genSaltSync(10)) as HashedPassword,
});

const EmailAreadyExists = (email: string) =>
  new ConflictException(`Email ${email} already exists`);

const ValidateInput: ValidateInput = (input) =>
  F.pipe(
    E.Do,
    E.bind('id', () => UserId.parse(uuid())),
    E.bind('email', () => EmailAddress.parse(input.email)),
    E.bind('password', () => RawPassword.parse(input.password)),
    E.mapLeft((error) => new BadRequestException(error.message)),
  );

const ValidateEmailExists =
  (userRepo: IUserRepository): ValidateEmailExists =>
  (input) =>
    userRepo
      .findByEmail(input.email)
      .pipe(
        RxJs.map((user) =>
          user ? E.left(EmailAreadyExists(input.email)) : E.right(input),
        ),
      );

@Controller('auth')
export class AuthController {
  constructor(private readonly userRepo: IUserRepository) {}

  @Post('email/sign-up')
  async signUp(@Body() body: SignUpBody) {
    const cmd = F.pipe(body, ValidateInput, E.getOrThrowWith(F.identity));

    const workflow = RxJs.of(cmd).pipe(
      RxJs.switchMap(ValidateEmailExists(this.userRepo)),
      RxJs.map(E.getOrThrowWith(F.identity)),

      RxJs.map(HashPassword),
      RxJs.map(toUser),

      RxJs.switchMap(this.userRepo.add),
    );

    return RxJs.firstValueFrom(workflow);
  }
}
