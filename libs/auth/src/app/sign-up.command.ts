import { Either as E, Function as F, Effect as Eff } from 'effect';
import { EmailAddress, RawPassword, User } from '../domain';

export type SignUpCommand = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type ValidCommand = SignUpCommand & {
  email: EmailAddress;
  password: RawPassword;
};

export type ValidateCommand = (
  command: SignUpCommand,
) => E.Either<Error, ValidCommand>;

type ValidateEmailExists = (
  email: EmailAddress,
) => E.Either<Error, EmailAddress>;
type HashPassword = (password: RawPassword) => HashPassword;
type Persist = (user: User) => Promise<void>;

export type SignUp = (
  validate: ValidateCommand,
  validateEmailExists: ValidateEmailExists,
  hashPassword: HashPassword,
  persist: Persist,
) => (command: SignUpCommand) => Eff.Effect<void>;
