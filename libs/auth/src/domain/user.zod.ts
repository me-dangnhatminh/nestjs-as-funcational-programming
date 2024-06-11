import * as z from 'zod';

// ============================================= //
// ============== Domain Types ============== //
export type UUID = z.infer<typeof UUID>;
export type EmailAddress = z.infer<typeof EmailAddress>;
export type ValidatedEmail = z.infer<typeof ValidatedEmail>;
export type RawPassword = z.infer<typeof RawPassword>;
export type HashedPassword = z.infer<typeof HashedPassword>;
export type UserPassword = z.infer<typeof UserPassword>;

export type LocalAuth = z.infer<typeof LocalAuth>;
export type GoogleAuth = z.infer<typeof GoogleAuth>;
export type Auth = z.infer<typeof Auth>;
export type Profile = z.infer<typeof Profile>;

export type UserLocalAuth = z.infer<typeof UserLocalAuth>;
export type UserGoogleAuth = z.infer<typeof UserGoogleAuth>;
export type User = z.infer<typeof User>;

// ============================================= //
// ============== Implementation ============== //
export const UUID = z.string().uuid();
export const EmailAddress = z.string().email().brand('EmailAddress');
export const ValidatedEmail = EmailAddress.brand('ValidatedEmail');
export const RawPassword = z.string().min(8).max(128).brand('RawPassword');
export const UserRole = z.union([z.literal('admin'), z.literal('user')]);

export const HashedPassword = z
  .string({
    description: 'bcrypt hash',
    message: 'Password is not hashed',
    invalid_type_error: 'hashed_password',
  })
  .refine((val) => /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9/.]{53}$/g.test(val), {
    message: 'Password is not hashed',
  })
  .brand('HashedPassword');
export const UserPassword = z.union([RawPassword, HashedPassword]);

export const LocalAuth = z.object({
  provider: z.literal('local').default('local'),
  email: z.union([EmailAddress, ValidatedEmail]),
  password: HashedPassword,
  verifiedAt: z.date().optional(),
});

export const GoogleAuth = z.object({
  provider: z.literal('google').default('google'),
  email: ValidatedEmail,
  providerId: z.string(),
  verifiedAt: z.date(),
});

export const Auth = z.union([LocalAuth, GoogleAuth]);

export const Profile = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const BaseEntity = z.object({
  id: UUID,

  role: UserRole.default('user'),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  removedAt: z.date().optional(),
});

export const UserLocalAuth = BaseEntity.merge(LocalAuth).merge(Profile);
export const UserGoogleAuth = BaseEntity.merge(GoogleAuth).merge(Profile);

export const User = z.union([UserLocalAuth, UserGoogleAuth]);

// ============================================= //

export const toUser = (data: User): User => User.parse(data);
export const toLocalAuth = (data: LocalAuth): LocalAuth =>
  LocalAuth.parse(data);
export const toGoogleAuth = (data: GoogleAuth): GoogleAuth =>
  GoogleAuth.parse(data);
