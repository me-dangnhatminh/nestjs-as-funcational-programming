import { Brand as B, Either as E, Function as F } from 'effect';
import * as Joi from 'joi';
import { JoiUtil } from '../common';

export type UserId = string & B.Brand<'UserId'>;
export type EmailAddress = string & B.Brand<'EmailAddress'>;
export type ValidatedEmail = string & B.Brand<'ValidatedEmail'>;

export type RawPassword = string & B.Brand<'RawPassword'>;
export type HashedPassword = string & B.Brand<'HashedPassword'>;
export type Provider = 'local' | 'google';

export type InvaidEmailAddress = `${string} is not a valid email address`;
export type InvalidPassword = `${string} is not a valid password`;

export type LocalAuth = {
  email: EmailAddress;
  password: HashedPassword;
  verifiedAt?: Date;
};

export type GoogleAuth = {
  email: EmailAddress;
  providerId: string;
  verifiedAt: Date;
};

export type Auth = LocalAuth | GoogleAuth;

export type User = {
  id: UserId;

  provider: Provider;
  email?: EmailAddress;
  password?: HashedPassword;
  providerId?: string;
  verifiedAt?: Date;

  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  createdAt: Date;
  updatedAt?: Date;
  removedAt?: Date;
};

// map user to plain object

// ============================================= //
// ============== Implementation ============== //

export const UserIdSchema = Joi.string<UserId>().uuid();
export const EmailSchema = Joi.string<EmailAddress>().email();
export const RawPasswordSchema = Joi.string<RawPassword>().min(8);
export const UserSchema = Joi.object<User>({
  id: UserIdSchema.required(),
  provider: Joi.string().valid('local', 'google').required(),
  email: EmailSchema.when('provider', {
    is: 'local',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  password: Joi.string<HashedPassword>(),
  providerId: Joi.string().when('provider', {
    is: 'google',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  verifiedAt: Joi.date(),

  firstName: Joi.string(),
  lastName: Joi.string(),
  avatarUrl: Joi.string(),

  createdAt: Joi.date().required(),
  updatedAt: Joi.date(),
  removedAt: Joi.date(),
});

// export const InvalidEmailAddress = (value: string): InvaidEmailAddress =>
//   `${value} is not a valid email address`;
// const InvalidPassword = (value: string): InvalidPassword =>
//   `${value} is not a valid password`;

export const parseUserId = F.flow(
  (v: string) => UserIdSchema.validate(v),
  JoiUtil.toEither,
);

export const parseEmail = F.flow(
  (v: string) => EmailSchema.validate(v),
  JoiUtil.toEither,
);

export const parsePassword = F.flow(
  (v: string) => RawPasswordSchema.validate(v),
  JoiUtil.toEither,
);

export const parseUser = F.flow(
  (v: User) => UserSchema.validate(v),
  JoiUtil.toEither,
);

export const toLocalAuth = (user: User): LocalAuth => {
  if (user.provider !== 'local') throw new Error('User is not a local user');
  if (!user.email || !user.password || !user.verifiedAt)
    throw new Error('User is not a local user');

  return {
    email: user.email,
    password: user.password,
    verifiedAt: user.verifiedAt,
  };
};

export const toGoogleAuth = (user: User): GoogleAuth => {
  if (user.provider !== 'google') throw new Error('User is not a google user');
  if (!user.email || !user.providerId || !user.verifiedAt)
    throw new Error('User is not a google user');

  return {
    email: user.email,
    providerId: user.providerId,
    verifiedAt: user.verifiedAt,
  };
};

export const toAuth = (user: User): Auth => {
  return user.provider === 'local' ? toLocalAuth(user) : toGoogleAuth(user);
};
// factories
export const UserId = {
  parse: parseUserId,
  of: F.flow(parseUserId, E.getOrThrowWith(F.identity)),
} as const;

export const EmailAddress = {
  parse: parseEmail,
  of: F.flow(parseEmail, E.getOrThrowWith(F.identity)),
} as const;

export const RawPassword = {
  parse: parsePassword,
  of: F.flow(parsePassword, E.getOrThrowWith(F.identity)),
} as const;

export const User = {
  parse: parseUser,
  of: F.flow(parseUser, E.getOrThrowWith(F.identity)),
} as const;

export const UserHelper = {
  toLocalAuth,
  toGoogleAuth,
  toAuth,
} as const;

export default User;
