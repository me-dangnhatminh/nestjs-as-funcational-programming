import { IAuthService, IUserRepository } from '@app/auth/domain';
import { Body, Controller, Post } from '@nestjs/common';

import { SignUpBody } from './view-models';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authSer: IAuthService,
    private readonly userRepo: IUserRepository,
  ) {}

  @Post('email/sign-up')
  async signUp(@Body() body: SignUpBody) {
    // const workflow = RxJs.of(cmd).pipe(
    //   RxJs.switchMap(ValidateEmailExists(this.userRepo)),
    //   RxJs.map(E.getOrThrowWith(F.identity)),
    //   RxJs.map(HashPassword),
    //   RxJs.map(toUser),
    //   RxJs.switchMap(this.userRepo.add),
    // );
    // return RxJs.firstValueFrom(workflow);
  }
}

// type SignUpBody = { email: string; password: string };
// type ValidInput = { id: UserId; email: EmailAddress; password: RawPassword };
// type InputWithHashed = Omit<ValidInput, 'password'> & {
//   password: HashedPassword;
// };

// type ValidateInput = (
//   input: SignUpBody,
// ) => E.Either<ValidInput, BadRequestException>;

// type ValidateEmailExists = (
//   input: ValidInput,
// ) => RxJs.Observable<E.Either<ValidInput, ConflictException>>;

// type HashPassword = (
//   input: ValidInput,
// ) => Omit<ValidInput, 'password'> & { password: HashedPassword };

// const EmailAreadyExists = (email: string) =>
//   new ConflictException(`Email ${email} already exists`);

// const ValidateInput: E.Either<unknown, BadRequestException> = (input) =>
//   F.pipe(
//     E.Do,
//     E.bind('id', () => UserId.parse(uuid())),
//     E.bind('email', () => EmailAddress.parse(input.email)),
//     E.bind('password', () => RawPassword.parse(input.password)),
//     E.mapLeft((error) => new BadRequestException(error.message)),
//   );

// const ValidateEmailExists =
//   (userRepo: IUserRepository): ValidateEmailExists =>
//   (input) =>
//     userRepo
//       .findByEmail(input.email)
//       .pipe(
//         RxJs.map((user) =>
//           user ? E.left(EmailAreadyExists(input.email)) : E.right(input),
//         ),
//       );

// const ValidateEmailNotUsed =
//   (userSer: IUserService) =>
//   async (
//     email: EmailAddress,
//   ): Promise<E.Either<EmailAddress, ConflictException>> => {
//     const user = await userSer.getUserByEmail(email);
//     user
//       ? E.left(new ConflictException(`Email ${email} already exists`))
//       : E.right(email);
//   };

//use pipe in nestjs to validate email not used
