import { Either as E, Function as F, Effect as Eff } from 'effect';
import * as RxJs from 'rxjs';
import {
  EmailAddress,
  HashedPassword,
  RawPassword,
  User,
  UserId,
} from '../domain';

// this is command
export type SignUpCommand = {
  id: UserId;
  email: EmailAddress;
  password: HashedPassword;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export class SignUpHandler {
  constructor() {}

  handle(cmd: SignUpCommand): Eff.Effect<void> {
    // return F.pipe(
    //   this.validate(cmd),
    //   E.chain(this.validateEmailExists),
    //   E.map(this.hashPassword),
    //   E.map(toUser),
    //   E.chain(this.persist),
    // );
  }
}

// export type SignUpCommand = {
//   email: string;
//   password: string;
//   firstName?: string;
//   lastName?: string;
//   avatar?: string;
// };

// type ValidCommand = SignUpCommand & {
//   email: EmailAddress;
//   password: RawPassword;
// };

// export type ValidateCommand = (
//   command: SignUpCommand,
// ) => E.Either<Error, ValidCommand>;

// type ValidateEmailExists = (
//   email: EmailAddress,
// ) => E.Either<Error, EmailAddress>;
// type HashPassword = (password: RawPassword) => HashPassword;
// type Persist = (user: User) => Promise<void>;

// export type SignUp = (
//   validate: ValidateCommand,
//   validateEmailExists: ValidateEmailExists,
//   hashPassword: HashPassword,
//   persist: Persist,
// ) => (command: SignUpCommand) => Eff.Effect<void>;
