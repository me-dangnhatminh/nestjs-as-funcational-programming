import {
  EmailAddress,
  HashedPassword,
  IUserRepository,
  User,
  UserId,
} from '../domain';
import * as RxJs from 'rxjs';

export type SignUpCommand = {
  id: UserId;
  email: EmailAddress;
  password: HashedPassword;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  createdAt?: Date;
};

export class SignUpCommandHandler {
  constructor(private readonly userRepo: IUserRepository) {}

  execute(command: SignUpCommand) {
    const now = new Date();
    const user = User.of({
      id: command.id,
      provider: 'local',
      email: command.email,
      password: command.password,
      createdAt: command.createdAt ?? now,
      // firstName: command.firstName,
      // lastName: command.lastName,
      // avatarUrl: command.avatarUrl,
    });

    const persist = RxJs.mergeMap(this.userRepo.add);
    return RxJs.of(user).pipe(persist);
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
