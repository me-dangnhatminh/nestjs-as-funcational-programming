import * as z from 'zod';

// ============================================= //
// ============== Domain Types ============== //
export type UUID = z.infer<typeof UUID>;
export type EmailAddress = z.infer<typeof EmailAddress>;
export type UniqueEmail = z.infer<typeof UniqueEmail>;
export type ValidatedEmail = z.infer<typeof ValidatedEmail>;
export type RawPassword = z.infer<typeof RawPassword>;
export type HashedPassword = z.infer<typeof HashedPassword>;
export type UserPassword = z.infer<typeof UserPassword>;
export type EmailComfirmClaim = z.infer<typeof EmailComfirmClaim>;
export type UserRole = z.infer<typeof UserRole>;

export type AuthClaim = z.infer<typeof AuthClaim>;
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
export const UniqueEmail = z.string().email().brand('UniqueEmail');
export const ValidatedEmail = z.object({
  email: EmailAddress,
  verifiedAt: z.date().default(() => new Date()),
});

export const RawPassword = z.string().min(8).max(128).brand('RawPassword');
export const UserRole = z.union([z.literal('admin'), z.literal('user')]);
/**
 * @deprecated use EmailComfirmClaim instead
 */
export const EmailComfirmClaim = z.object({
  email: EmailAddress,
  iat: z.number().default(() => Date.now()),
  exp: z.number().default(() => Date.now() + 7 * 60 * 60 * 1000), // 7 hours
});

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

export const AuthClaim = z.object({
  sub: UUID,
  iat: z.number(),
  exp: z.number(),
  role: UserRole,
  email: EmailAddress,
});

export const LocalAuth = z.object({
  provider: z.literal('local').default('local'),
  password: HashedPassword,
  email: EmailAddress,
  verifiedAt: z.date().optional().nullable(),
});

export const GoogleAuth = z.object({
  provider: z.literal('google').default('google'),
  providerId: z.string(),
  email: EmailAddress,
  verifiedAt: z.date(),
});

export const Auth = z.union([LocalAuth, GoogleAuth]);

export const Profile = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

const BaseEntity = z.object({
  id: UUID,

  role: UserRole.default('user'),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional().nullable(),
  removedAt: z.date().optional().nullable(),
});

export const UserLocalAuth = BaseEntity.merge(LocalAuth).merge(Profile);
export const UserGoogleAuth = BaseEntity.merge(GoogleAuth).merge(Profile);
export const User = z.union([UserLocalAuth, UserGoogleAuth]).brand('User');

// ============================================= //

export const toUser = (data: User): User => User.parse(data);
export const toLocalAuth = (data: LocalAuth): LocalAuth =>
  LocalAuth.parse(data);
export const toGoogleAuth = (data: GoogleAuth): GoogleAuth =>
  GoogleAuth.parse(data);

export const toClaim = (
  user: User,
  options?: { iat: number; exp: number },
): AuthClaim => {
  const now = Date.now();
  const sub = user.id;
  const iat = options?.iat ?? now;
  const exp = options?.exp ?? now + 7 * 24 * 60 * 60 * 1000; // 7 days
  const email = user.email;
  const role = user.role;
  return { sub, iat, exp, email, role };
};
