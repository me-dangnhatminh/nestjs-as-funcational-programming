import { Brand as B, Either as E, Function as F } from 'effect';
import * as Joi from 'joi';
import { JoiUtil } from '../common';

export type UserId = string & B.Brand<'UserId'>;
export type EmailAddress = string & B.Brand<'EmailAddress'>;
export type ValidatedEmail = string & B.Brand<'ValidatedEmail'>;

export type RawPassword = string & B.Brand<'RawPassword'>;
export type HashedPassword = string & B.Brand<'HashedPassword'>;
export type UserPassword = RawPassword | HashedPassword;
export type Provider = 'local' | 'google';

export type InvaidEmailAddress = `${string} is not a valid email address`;
export type InvalidPassword = `${string} is not a valid password`;

export type LocalAuth = {
  provider: 'local';
  email: EmailAddress;
  password: RawPassword;
  verifiedAt?: Date;
};

export type GoogleAuth = {
  provider: 'google';
  email: EmailAddress;
  providerId: string;
  verifiedAt: Date;
};

export type Auth = LocalAuth | GoogleAuth;

export type Profile = Partial<{
  firstName: string;
  lastName: string;
  avatarUrl: string;
}>;

export type User = {
  id: UserId;

  provider: Provider;
  email?: EmailAddress;
  password?: UserPassword;
  verifiedAt?: Date;

  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  createdAt: Date;
  updatedAt?: Date;
  removedAt?: Date;
};

export type UserWithLocalAuth = User & LocalAuth;
export type UserWithGoogleAuth = User & GoogleAuth;
// map user to plain object

// ============================================= //
// ============== Implementation ============== //
export const UserIdSchema = Joi.string<UserId>().uuid();
export const EmailSchema = Joi.string<EmailAddress>().email();
export const RawPasswordSchema = Joi.string<RawPassword>().min(8);
export const ProviderSchema = Joi.string<Provider>().valid('local', 'google');
export const LocalAuthSchema = Joi.object<LocalAuth>({
  provider: ProviderSchema.valid('local').required(),
  email: EmailSchema.required(),
  password: RawPasswordSchema.required(),
  verifiedAt: Joi.date().optional(),
});
export const GoogleAuthSchema = Joi.object<GoogleAuth>({
  provider: ProviderSchema.valid('google').required(),
  email: EmailSchema.required(),
  providerId: Joi.string().required(),
  verifiedAt: Joi.date().required(),
});
export const AuthSchema = Joi.alternatives<Auth>().try(
  LocalAuthSchema,
  GoogleAuthSchema,
);
export const ProfileSchema = Joi.object<Profile>({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  avatarUrl: Joi.string().optional(),
});

export const UserSchema = Joi.object<User, true, User>({
  id: UserIdSchema.required(),
  provider: ProviderSchema.required(),
  email: EmailSchema.required(),
  password: Joi.string().required(),
  verifiedAt: Joi.date().required(),

  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  avatarUrl: Joi.string().optional(),

  createdAt: Joi.date().required(),
  updatedAt: Joi.date().optional(),
  removedAt: Joi.date().optional(),
});

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

// ============================================= //
// ================= Factory ================== //
export const UserId = {
  parse: parseUserId,
  of: F.flow(parseUserId, E.getOrThrowWith(F.identity)),
} as const;

export const EmailAddress = {
  is: F.flow(parseEmail, E.isRight),
  parse: parseEmail,
  of: F.flow(parseEmail, E.getOrThrowWith(F.identity)),
} as const;

export const RawPassword = {
  is: F.flow(parsePassword, E.isRight),
  parse: parsePassword,
  of: F.flow(parsePassword, E.getOrThrowWith(F.identity)),
} as const;

export const User = {
  parse: parseUser,
  of: F.flow(parseUser, E.getOrThrowWith(F.identity)),
} as const;

export const parseLocalAuth = F.flow(
  (v: unknown) => LocalAuthSchema.validate(v),
  JoiUtil.toEither,
);

export const LocalAuth = {
  is: F.flow(parseLocalAuth, E.isRight),
  parse: parseLocalAuth,
  of: F.flow(parseLocalAuth, E.getOrThrowWith(F.identity)),
} as const;

export default User;
