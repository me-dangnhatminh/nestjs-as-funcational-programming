import User, { EmailAddress, HashedPassword, RawPassword } from './user';

export abstract class IUserRepository {
  abstract findByEmail(
    email: EmailAddress,
  ): Promise<(User & { email: EmailAddress }) | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract add(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract remove(user: User): Promise<void>;
}

// ============================================= //
// ============== Domain Services ============== //
export type HashPassword = (password: RawPassword) => Promise<HashedPassword>;
export type HashPasswordSync = (password: RawPassword) => HashedPassword;
export type ComparePasswordSync = (
  pass: RawPassword,
  hash: HashedPassword,
) => boolean;
export type GenAT = (user: { id: string }) => string;
export type DecodeAT = (token: string) => { id: string };

export abstract class IUserService {
  abstract getUserByEmail(email: EmailAddress): Promise<User | null>;
}

export abstract class IAuthService {
  abstract hashPassword: HashPassword;
  abstract comparePassword: ComparePasswordSync;
  abstract genAT(user: { id: string }): Promise<string>;
  abstract decodeAccessToken: DecodeAT;
}

export type UploadAvatar<T> = (file: T) => Promise<void>;
export type DeleteAvatar<T> = (file: T) => Promise<void>;
export type GetAvatarUrl<T> = (file: T) => Promise<string>;
